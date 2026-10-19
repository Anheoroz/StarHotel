import "../env";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import mongoose from "mongoose";
import { app } from "../app";
import { assertLocalDatabase } from "../env";
import { connectDb, disconnectDb } from "../db";
import { hashPassword } from "../auth";
import { Usuario } from "../models/usuario";
import { Unidad } from "../models/unidad";
import { Habitacion } from "../models/habitacion";
import { seedIfEmpty } from "../seed";

let server: Server;
let base: string;
const password = "PruebaStar2026!";
const sessions: Record<string, string> = {};
async function request(
  path: string,
  method = "GET",
  data?: unknown,
  cookie = "",
  origin?: string,
) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(origin ? { Origin: origin } : {}),
    },
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  });
  return {
    status: response.status,
    body: await response.json(),
    cookie: response.headers.get("set-cookie")?.split(";")[0] ?? "",
  };
}

before(async () => {
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27018/starhotel_test";
  process.env.REQUIRE_LOCAL_DB = "true";
  process.env.EXPECTED_DB_NAME = "starhotel_test";
  assertLocalDatabase();
  await connectDb();
  assert.equal(mongoose.connection.db!.databaseName, "starhotel_test");
  await mongoose.connection.db!.dropDatabase();
  await seedIfEmpty();
  await Promise.all([Usuario.init(), Unidad.init(), Habitacion.init()]);
  for (const rol of [
    "administrador",
    "recepcion",
    "mantenimiento",
    "cliente",
  ]) {
    await Usuario.create({
      nombre: rol,
      correo: `${rol}@test.example`,
      contrasenaHash: await hashPassword(password),
      rol,
    });
  }
  for (const catalogo of [
    "sencilla",
    "doble",
    "suite-familiar",
    "ejecutiva",
    "sencilla-deluxe",
    "doble-vista-al-mar",
  ]) {
    await Unidad.create({ numero: catalogo, catalogo });
  }
  server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api`;
  for (const rol of [
    "administrador",
    "recepcion",
    "mantenimiento",
    "cliente",
  ]) {
    const login = await request("/auth/login", "POST", {
      correo: `${rol}@test.example`,
      contrasena: password,
    });
    assert.equal(login.status, 200);
    sessions[rol] = login.cookie;
  }
});
after(async () => {
  if (server)
    await new Promise<void>((resolve) => server.close(() => resolve()));
  if (mongoose.connection.db?.databaseName === "starhotel_test")
    await mongoose.connection.db.dropDatabase();
  await disconnectDb();
});

test("Registro valida datos, evita duplicados y no permite elevar privilegios", async () => {
  assert.equal(
    (
      await request("/auth/registro", "POST", {
        nombre: "",
        correo: "mal",
        contrasena: "1",
      })
    ).status,
    400,
  );
  const result = await request("/auth/registro", "POST", {
    nombre: "Invitado",
    correo: "nuevo@test.example",
    contrasena: password,
    rol: "administrador",
  });
  assert.equal(result.status, 201);
  assert.equal(result.body.rol, "cliente");
  assert.ok(result.cookie);
  assert.equal(
    (
      await request("/auth/registro", "POST", {
        nombre: "Otro",
        correo: "NUEVO@test.example",
        contrasena: password,
      })
    ).status,
    409,
  );
  const stored = await Usuario.findOne({ correo: "nuevo@test.example" }).select(
    "+contrasenaHash",
  );
  assert.ok(stored!.contrasenaHash.startsWith("scrypt:"));
  assert.notEqual(stored!.contrasenaHash, password);
  assert.equal(result.body.contrasenaHash, undefined);
});
test("Inicio de sesión, consulta de sesión y cierre efectivo", async () => {
  assert.equal(
    (
      await request("/auth/login", "POST", {
        correo: "cliente@test.example",
        contrasena: "Incorrecta123!",
      })
    ).status,
    401,
  );
  const login = await request("/auth/login", "POST", {
    correo: "cliente@test.example",
    contrasena: password,
  });
  assert.equal(
    (await request("/auth/me", "GET", undefined, login.cookie)).body.rol,
    "cliente",
  );
  assert.equal(
    (await request("/auth/logout", "POST", {}, login.cookie)).status,
    200,
  );
  assert.equal(
    (await request("/auth/me", "GET", undefined, login.cookie)).status,
    401,
  );
});
test("La API restringe las acciones por rol y rechaza solicitudes de otros sitios", async () => {
  assert.equal((await request("/admin/catalogo")).status, 401);
  for (const rol of ["recepcion", "mantenimiento", "cliente"]) {
    assert.equal(
      (await request("/admin/catalogo", "GET", undefined, sessions[rol]))
        .status,
      403,
    );
    assert.equal(
      (await request("/admin/inventario", "POST", {}, sessions[rol])).status,
      403,
    );
  }
  for (const rol of ["administrador", "recepcion", "mantenimiento"])
    assert.equal(
      (await request("/operacion", "GET", undefined, sessions[rol])).status,
      200,
    );
  assert.equal(
    (await request("/operacion", "GET", undefined, sessions.cliente)).status,
    403,
  );
  assert.equal(
    (
      await request(
        "/admin/catalogo/sencilla",
        "PATCH",
        { activa: false },
        sessions.administrador,
        "https://otro-sitio.example",
      )
    ).status,
    403,
  );
});
test("Crear y editar catálogo conserva fotos, descripción y precio", async () => {
  const data = {
    codigo: "catalogo-prueba",
    nombre: "Modelo de prueba",
    tipo: "Doble",
    adultos: 2,
    ninos: 2,
    precio: 120,
    descripcion: "Descripción de prueba.",
    fotos: ["/rooms/doble.jpg"],
    amenidades: ["wifi"],
  };
  assert.equal(
    (await request("/admin/catalogo", "POST", data, sessions.administrador))
      .status,
    201,
  );
  assert.equal(
    (await request("/admin/catalogo", "POST", data, sessions.administrador))
      .status,
    409,
  );
  assert.equal(
    (
      await request(
        "/admin/catalogo/catalogo-prueba",
        "PATCH",
        { ...data, precio: -5 },
        sessions.administrador,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await request(
        "/admin/catalogo/catalogo-prueba",
        "PATCH",
        { ...data, fotos: [] },
        sessions.administrador,
      )
    ).status,
    400,
  );
  const update = {
    ...data,
    descripcion: "Descripción actualizada",
    precio: 175,
    fotos: ["/rooms/mar.jpg", "https://example.com/foto.jpg"],
  };
  assert.equal(
    (
      await request(
        "/admin/catalogo/catalogo-prueba",
        "PATCH",
        update,
        sessions.administrador,
      )
    ).status,
    200,
  );
  const room = await request("/habitaciones/catalogo-prueba");
  assert.equal(room.body.precio, 175);
  assert.equal(room.body.descripcion, update.descripcion);
  assert.deepEqual(room.body.fotos, update.fotos);
  assert.equal(
    (
      await request(
        "/admin/catalogo/catalogo-prueba",
        "PATCH",
        { ...update, fotos: ["/rooms/mar.jpg"] },
        sessions.administrador,
      )
    ).body.fotos.length,
    1,
  );
});
test("Crear, editar y retirar cuartos físicos conserva el inventario", async () => {
  const data = {
    numero: "999",
    catalogo: "catalogo-prueba",
    activa: true,
    estado: "disponible",
  };
  const created = await request(
    "/admin/inventario",
    "POST",
    data,
    sessions.administrador,
  );
  assert.equal(created.status, 201);
  assert.equal(
    (await request("/admin/inventario", "POST", data, sessions.administrador))
      .status,
    409,
  );
  const id = created.body._id;
  assert.equal(
    (
      await request(
        `/admin/inventario/${id}`,
        "PATCH",
        { ...data, activa: false },
        sessions.administrador,
      )
    ).status,
    200,
  );
  assert.ok(await Unidad.exists({ _id: id }));
  assert.ok(
    !(await request("/habitaciones")).body.some(
      (r: { id: string }) => r.id === "catalogo-prueba",
    ),
  );
  await request(
    `/admin/inventario/${id}`,
    "PATCH",
    { ...data, estado: "pendiente-limpieza" },
    sessions.administrador,
  );
  assert.ok(
    !(await request("/habitaciones")).body.some(
      (r: { id: string }) => r.id === "catalogo-prueba",
    ),
  );
  await request(
    `/admin/inventario/${id}`,
    "PATCH",
    data,
    sessions.administrador,
  );
  assert.ok(
    (await request("/habitaciones")).body.some(
      (r: { id: string }) => r.id === "catalogo-prueba",
    ),
  );
  await request(
    "/admin/catalogo/catalogo-prueba",
    "PATCH",
    { activa: false },
    sessions.administrador,
  );
  assert.equal((await request("/habitaciones/catalogo-prueba")).status, 404);
  assert.ok(await Habitacion.exists({ codigo: "catalogo-prueba" }));
  assert.equal(
    (
      await request(
        "/admin/catalogo/catalogo-prueba",
        "DELETE",
        {},
        sessions.administrador,
      )
    ).status,
    404,
  );
});
test("Asignar rol revoca sesiones y no permite quitarse el propio acceso", async () => {
  const client = await Usuario.findOne({ correo: "cliente@test.example" });
  assert.equal(
    (
      await request(
        `/admin/usuarios/${client!._id}/rol`,
        "PATCH",
        { rol: "mantenimiento" },
        sessions.administrador,
      )
    ).status,
    200,
  );
  assert.equal(
    (await request("/auth/me", "GET", undefined, sessions.cliente)).status,
    401,
  );
  const admin = await Usuario.findOne({ correo: "administrador@test.example" });
  assert.equal(
    (
      await request(
        `/admin/usuarios/${admin!._id}/rol`,
        "PATCH",
        { rol: "cliente" },
        sessions.administrador,
      )
    ).status,
    400,
  );
});

test("La protección de base impide conectar con un nombre inesperado", async () => {
  const expected = process.env.EXPECTED_DB_NAME;
  try {
    process.env.EXPECTED_DB_NAME = "starthotel_db";
    await assert.rejects(connectDb(), /EXPECTED_DB_NAME/);
    assert.equal(mongoose.connection.db!.databaseName, "starhotel_test");
  } finally {
    process.env.EXPECTED_DB_NAME = expected;
  }
});
