import "../env";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import mongoose from "mongoose";
import { app } from "../app";
import { assertLocalDatabase } from "../env";
import { connectDb, disconnectDb } from "../db";
import { hashPassword } from "../auth";
import { Amenidad } from "../models/amenidad";
import { Habitacion } from "../models/habitacion";
import { Usuario } from "../models/usuario";
import { Unidad } from "../models/unidad";
import { seedIfEmpty } from "../seed";

const database = "starhotel_test_amenidades";
const password = "PruebaAmenidades2026!";
let server: Server;
let base = "";
const sessions: Record<string, string> = {};

async function request(
  path: string,
  method = "GET",
  body?: unknown,
  cookie = "",
) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return {
    status: response.status,
    body: await response.json(),
    cookie: response.headers.get("set-cookie")?.split(";")[0] ?? "",
  };
}

before(async () => {
  process.env.MONGODB_URI = `mongodb://127.0.0.1:27018/${database}`;
  process.env.REQUIRE_LOCAL_DB = "true";
  process.env.EXPECTED_DB_NAME = database;
  assertLocalDatabase();
  await connectDb();
  assert.equal(mongoose.connection.db!.databaseName, database);
  await mongoose.connection.db!.dropDatabase();
  await seedIfEmpty();
  await Promise.all([
    Amenidad.init(),
    Habitacion.init(),
    Usuario.init(),
    Unidad.init(),
  ]);
  await Unidad.create({ numero: "101", catalogo: "sencilla" });
  for (const rol of [
    "administrador",
    "recepcion",
    "mantenimiento",
    "cliente",
  ]) {
    await Usuario.create({
      nombre: rol,
      correo: `${rol}@amenidades.test`,
      contrasenaHash: await hashPassword(password),
      rol,
    });
  }
  server = await new Promise<Server>((resolve) => {
    const running = app.listen(0, "127.0.0.1", () => resolve(running));
  });
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api`;
  for (const rol of [
    "administrador",
    "recepcion",
    "mantenimiento",
    "cliente",
  ]) {
    const response = await request("/auth/login", "POST", {
      correo: `${rol}@amenidades.test`,
      contrasena: password,
    });
    assert.equal(response.status, 200);
    sessions[rol] = response.cookie;
  }
});

after(async () => {
  if (server)
    await new Promise<void>((resolve) => server.close(() => resolve()));
  if (mongoose.connection.db?.databaseName === database)
    await mongoose.connection.db.dropDatabase();
  await disconnectDb();
});

test("El catálogo público conserva amenidades anteriores y solo administradores pueden modificarlas", async () => {
  const list = await request("/amenidades");
  assert.equal(list.status, 200);
  assert.ok(
    list.body.some(
      (a: { codigo: string; descripcion: string }) =>
        a.codigo === "wifi" && a.descripcion === "",
    ),
  );
  for (const method of ["POST", "PATCH", "DELETE"]) {
    const path = method === "POST" ? "/amenidades" : "/amenidades/wifi";
    assert.equal((await request(path, method, {})).status, 401);
    for (const rol of ["recepcion", "mantenimiento", "cliente"])
      assert.equal(
        (await request(path, method, {}, sessions[rol])).status,
        403,
      );
  }
});

test("Crear amenidades valida nombre, descripción y código y rechaza duplicados", async () => {
  const valid = {
    codigo: "piscina",
    nombre: "Piscina",
    descripcion: "Piscina de uso compartido incluida en la estancia.",
  };
  for (const invalid of [
    { ...valid, codigo: "No valido" },
    { ...valid, nombre: " " },
    { ...valid, descripcion: "" },
    { ...valid, descripcion: "a".repeat(501) },
  ])
    assert.equal(
      (await request("/amenidades", "POST", invalid, sessions.administrador))
        .status,
      400,
    );
  const created = await request(
    "/amenidades",
    "POST",
    valid,
    sessions.administrador,
  );
  assert.equal(created.status, 201);
  assert.deepEqual(created.body, valid);
  assert.equal(
    (await request("/amenidades", "POST", valid, sessions.administrador))
      .status,
    409,
  );
});

test("La asignación admite nuevas amenidades, persiste en edición y aparece en el catálogo y sus filtros", async () => {
  const data = {
    nombre: "Habitación Sencilla",
    tipo: "Sencilla",
    adultos: 1,
    ninos: 1,
    precio: 85,
    descripcion: "Habitación con servicios actualizados.",
    fotos: ["/rooms/sencilla.jpg"],
    amenidades: ["wifi", "piscina", "piscina"],
  };
  assert.equal(
    (
      await request(
        "/admin/catalogo/sencilla",
        "PATCH",
        data,
        sessions.administrador,
      )
    ).status,
    200,
  );
  const edition = (
    await request("/admin/catalogo", "GET", undefined, sessions.administrador)
  ).body.find((h: { codigo: string }) => h.codigo === "sencilla");
  assert.deepEqual(edition.amenidades, ["wifi", "piscina"]);
  const publicRoom = await request("/habitaciones/sencilla");
  assert.deepEqual(publicRoom.body.amenidades, ["wifi", "piscina"]);
  assert.equal(
    publicRoom.body.amenidadesDetalle.find(
      (a: { codigo: string }) => a.codigo === "piscina",
    ).nombre,
    "Piscina",
  );
  const filtered = await request("/habitaciones?amenidades=piscina");
  assert.equal(filtered.status, 200);
  assert.deepEqual(
    filtered.body.map((h: { id: string }) => h.id),
    ["sencilla"],
  );
  assert.equal(
    (
      await request(
        "/admin/catalogo/sencilla",
        "PATCH",
        { ...data, amenidades: ["inexistente"] },
        sessions.administrador,
      )
    ).status,
    400,
  );
});

test("Editar el nombre y la descripción actualiza las habitaciones sin romper la relación", async () => {
  const update = {
    nombre: "Piscina exterior",
    descripcion: "Acceso de 8:00 a 18:00, incluido en el alojamiento.",
  };
  assert.equal(
    (
      await request(
        "/amenidades/piscina",
        "PATCH",
        update,
        sessions.administrador,
      )
    ).status,
    200,
  );
  const room = await request("/habitaciones/sencilla");
  assert.deepEqual(
    room.body.amenidadesDetalle.find(
      (a: { codigo: string }) => a.codigo === "piscina",
    ),
    { codigo: "piscina", ...update },
  );
  assert.equal(
    (
      await request(
        "/amenidades/piscina",
        "PATCH",
        { ...update, codigo: "otro-codigo" },
        sessions.administrador,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await request(
        "/amenidades/no-existe",
        "PATCH",
        update,
        sessions.administrador,
      )
    ).status,
    404,
  );
});

test("Eliminar una amenidad asignada la retira de todos los listados y conserva las habitaciones", async () => {
  const before = await Habitacion.countDocuments();
  assert.equal(
    (await request("/amenidades/piscina", "DELETE", {}, sessions.administrador))
      .status,
    200,
  );
  assert.equal(await Habitacion.countDocuments(), before);
  assert.equal((await Amenidad.findOne({ codigo: "piscina" }))!.activa, false);
  assert.equal(await Habitacion.countDocuments({ amenidades: "piscina" }), 0);
  assert.ok(
    !(await request("/amenidades")).body.some(
      (a: { codigo: string }) => a.codigo === "piscina",
    ),
  );
  assert.ok(
    !(await request("/habitaciones/sencilla")).body.amenidades.includes(
      "piscina",
    ),
  );
  const adminRoom = (
    await request("/admin/catalogo", "GET", undefined, sessions.administrador)
  ).body.find((h: { codigo: string }) => h.codigo === "sencilla");
  assert.ok(!adminRoom.amenidades.includes("piscina"));
  const data = {
    nombre: adminRoom.nombre,
    tipo: adminRoom.tipo,
    adultos: adminRoom.capacidad.adultos,
    ninos: adminRoom.capacidad.ninos,
    precio: adminRoom.precioPorNoche,
    descripcion: adminRoom.descripcion,
    fotos: adminRoom.fotos,
    amenidades: ["piscina"],
  };
  assert.equal(
    (
      await request(
        "/admin/catalogo/sencilla",
        "PATCH",
        data,
        sessions.administrador,
      )
    ).status,
    400,
  );
  assert.equal((await request("/habitaciones?amenidades=piscina")).status, 400);
  assert.equal(
    (await request("/amenidades/piscina", "DELETE", {}, sessions.administrador))
      .status,
    404,
  );
});

test("Las lecturas omiten asignaciones antiguas a amenidades eliminadas y guardar las limpia", async () => {
  // Representa una escritura antigua simultánea a una eliminación.
  await Habitacion.updateOne(
    { codigo: "sencilla" },
    { $addToSet: { amenidades: "piscina" } },
  );
  const detail = await request("/habitaciones/sencilla");
  assert.ok(!detail.body.amenidades.includes("piscina"));
  assert.ok(
    !(await request("/habitaciones")).body.some((h: { amenidades: string[] }) =>
      h.amenidades.includes("piscina"),
    ),
  );
  const catalog = (
    await request("/admin/catalogo", "GET", undefined, sessions.administrador)
  ).body;
  assert.ok(
    !catalog
      .find((h: { codigo: string }) => h.codigo === "sencilla")
      .amenidades.includes("piscina"),
  );
  assert.equal(
    (
      await request(
        "/admin/catalogo/sencilla",
        "PATCH",
        { activa: true },
        sessions.administrador,
      )
    ).status,
    200,
  );
  assert.equal(await Habitacion.countDocuments({ amenidades: "piscina" }), 0);
});
