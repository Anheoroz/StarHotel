import "../env";
import { after, before, beforeEach, test } from "node:test";
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
import { Amenidad } from "../models/amenidad";
import { Reserva } from "../models/reserva";
import { ensureReservaIndexes, horizonteReserva, hoyGuatemala, validarFechas } from "../reservas";

let server: Server;
let base: string;
const sessions: Record<string, string> = {};
let unidades: string[];
let clienteId: string;
const password = "PruebaReservas2026!";

function fechaEn(dias: number) {
  return new Date(Date.parse(hoyGuatemala()) + dias * 86_400_000).toISOString().slice(0, 10);
}
function datos(habitaciones = [unidades[0]], ingreso = fechaEn(2), salida = fechaEn(4)) {
  return { ingreso, salida, habitaciones, nombre: "Cliente de prueba", correo: "cliente@prueba.test", telefono: "+502 5555-1234" };
}
const tarjeta = {
  titular: "Cliente de prueba",
  numero: "4242424242424242",
  vencimiento: "12/99",
  cvv: "123",
  tipoTarjeta: "debito",
};
async function request(path: string, method = "GET", data?: unknown, cookie = sessions.cliente) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  return { status: response.status, body: await response.json(), cookie: response.headers.get("set-cookie")?.split(";")[0] ?? "" };
}

before(async () => {
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27018/starhotel_test_reservas";
  process.env.REQUIRE_LOCAL_DB = "true";
  process.env.EXPECTED_DB_NAME = "starhotel_test_reservas";
  assertLocalDatabase();
  await connectDb();
  assert.equal(mongoose.connection.db!.databaseName, "starhotel_test_reservas");
  await mongoose.connection.db!.dropDatabase();
  await Promise.all([Usuario.createIndexes(), Unidad.createIndexes(), Habitacion.createIndexes(), ensureReservaIndexes()]);
  await Habitacion.create({
    codigo: "sencilla", nombre: "Habitación Sencilla", tipo: "Sencilla", capacidad: { adultos: 2, ninos: 1 },
    precioPorNoche: 85.29, moneda: "GTQ", amenidades: ["wifi"], fotos: ["/rooms/sencilla.jpg"],
    descripcion: "Modelo para pruebas de reservas.", orden: 1, activa: true,
  });
  await Habitacion.create({
    codigo: "retirado", nombre: "Modelo retirado", tipo: "Suite", capacidad: { adultos: 2, ninos: 1 },
    precioPorNoche: 100, moneda: "GTQ", amenidades: [], fotos: ["/rooms/suite.jpg"],
    descripcion: "Modelo deshabilitado.", orden: 2, activa: false,
  });
  const docs = await Unidad.create(Array.from({ length: 9 }, (_, index) => ({
    numero: String(101 + index), catalogo: "sencilla", activa: index !== 5,
    estado: index === 6 ? "ocupada" : index === 7 ? "mantenimiento" : index === 8 ? "pendiente-limpieza" : "disponible",
  })));
  unidades = docs.slice(0, 5).map((doc) => String(doc._id));
  await Unidad.create({ numero: "201", catalogo: "retirado", activa: true, estado: "disponible" });
  await Amenidad.create({ codigo: "wifi", nombre: "Internet inalámbrico", descripcion: "Conexión en la habitación", activa: true });
  for (const [key, rol] of [["cliente", "cliente"], ["otro", "cliente"], ["administrador", "administrador"], ["recepcion", "recepcion"], ["mantenimiento", "mantenimiento"]]) {
    const user = await Usuario.create({ nombre: key, correo: `${key}@prueba.test`, contrasenaHash: await hashPassword(password), rol });
    if (key === "cliente") clienteId = String(user._id);
  }
  server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api`;
  for (const key of ["cliente", "otro", "administrador", "recepcion", "mantenimiento"]) {
    const result = await request("/auth/login", "POST", { correo: `${key}@prueba.test`, contrasena: password }, "");
    assert.equal(result.status, 200);
    sessions[key] = result.cookie;
  }
});

beforeEach(async () => { await Reserva.deleteMany({}); });
after(async () => {
  if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
  if (mongoose.connection.db?.databaseName === "starhotel_test_reservas") await mongoose.connection.db.dropDatabase();
  await disconnectDb();
});

test("Fechas reales y anticipación usan el día de Guatemala y tres meses calendario", async () => {
  const now = new Date("2026-10-26T03:00:00Z");
  assert.equal(hoyGuatemala(now), "2026-10-25");
  assert.equal(horizonteReserva(now), "2027-01-25");
  assert.equal(horizonteReserva(new Date("2026-01-31T18:00:00Z")), "2026-04-30");
  assert.throws(() => validarFechas("2026-10-24", "2026-10-25", now), /anterior/);
  assert.throws(() => validarFechas("2026-11-31", "2026-12-03", now), /válida/);
  assert.throws(() => validarFechas("2027-01-26", "2027-01-27", now), /tres meses/);
  assert.equal(validarFechas("2027-01-25", "2027-02-01", now).noches, 7);
  for (const path of ["?ingreso=incorrecto&salida=2026-12-01", `?ingreso=${fechaEn(1)}&salida=${fechaEn(1)}`, `?ingreso=${fechaEn(-1)}&salida=${fechaEn(1)}`])
    assert.equal((await request(`/disponibilidad${path}`)).status, 400);
});

test("Disponibilidad excluye habitaciones y modelos retirados, ocupados, en limpieza o mantenimiento", async () => {
  const result = await request(`/disponibilidad?ingreso=${fechaEn(2)}&salida=${fechaEn(4)}`, "GET", undefined, "");
  assert.equal(result.status, 200);
  assert.equal(result.body.noches, 2);
  assert.deepEqual(result.body.habitaciones.map((h: { id: string }) => h.id), unidades);
  assert.equal(result.body.habitaciones[0].precio, 85.29);
  assert.equal(result.body.habitaciones[0].amenidadesDetalle[0].nombre, "Internet inalámbrico");
});

test("Crear valida contacto y selección de una a cuatro habitaciones y calcula importe en servidor", async () => {
  for (const changes of [{ habitaciones: [] }, { habitaciones: unidades }, { habitaciones: [unidades[0], unidades[0]] }, { habitaciones: ["invalido"] }, { nombre: "" }, { correo: "invalido" }, { telefono: "---" }])
    assert.equal((await request("/reservas", "POST", { ...datos(), ...changes })).status, 400);
  const result = await request("/reservas", "POST", {
    ...datos(unidades.slice(0, 2)), total: 1, precio: 0.01, usuario: new mongoose.Types.ObjectId().toString(), estado: "pagada",
  });
  assert.equal(result.status, 201);
  assert.match(result.body.codigo, /^SH-/);
  assert.equal(result.body.estado, "pendiente-pago");
  assert.equal(result.body.total, 341.16);
  assert.equal(result.body.moneda, "GTQ");
  assert.equal(result.body.nochesOcupadas, undefined);
  assert.equal(result.body.usuario, undefined);
  const stored = await Reserva.findById(result.body.id);
  assert.equal(String(stored!.usuario), clienteId);
  assert.equal(stored!.totalCentavos, 34116);
  const cuatro = await request("/reservas", "POST", datos(unidades.slice(0, 4), fechaEn(5), fechaEn(6)));
  assert.equal(cuatro.status, 201);
  assert.equal(cuatro.body.habitaciones.length, 4);
});

test("Solo clientes autenticados crean y consultan sus propias reservas y pagos", async () => {
  assert.equal((await request("/reservas", "POST", datos(), "")).status, 401);
  for (const rol of ["administrador", "recepcion", "mantenimiento"]) {
    assert.equal((await request("/reservas", "POST", datos(), sessions[rol])).status, 403);
    assert.equal((await request("/reservas", "GET", undefined, sessions[rol])).status, 403);
  }
  const created = await request("/reservas", "POST", datos());
  assert.equal((await request(`/reservas/${created.body.id}`, "GET", undefined, sessions.otro)).status, 404);
  assert.equal((await request(`/reservas/${created.body.id}/pago`, "POST", tarjeta, sessions.otro)).status, 404);
  assert.deepEqual((await request("/reservas", "GET", undefined, sessions.otro)).body, []);
  assert.equal((await request("/reservas")).body.length, 1);
  assert.equal((await request("/reservas/no-es-id")).status, 404);
});

test("Las noches solapadas quedan bloqueadas y las estancias adyacentes son compatibles", async () => {
  assert.equal((await request("/reservas", "POST", datos([unidades[0]], fechaEn(2), fechaEn(5)))).status, 201);
  const availability = await request(`/disponibilidad?ingreso=${fechaEn(3)}&salida=${fechaEn(4)}`);
  assert.ok(!availability.body.habitaciones.some((h: { id: string }) => h.id === unidades[0]));
  assert.equal((await request("/reservas", "POST", datos([unidades[0]], fechaEn(4), fechaEn(6)))).status, 409);
  assert.equal((await request("/reservas", "POST", datos([unidades[0]], fechaEn(1), fechaEn(2)))).status, 201);
  assert.equal((await request("/reservas", "POST", datos([unidades[0]], fechaEn(5), fechaEn(6)))).status, 201);
});

test("El índice único impide la sobreventa en solicitudes simultáneas sin transacciones", async () => {
  const simultaneous = await Promise.all(Array.from({ length: 10 }, () => request("/reservas", "POST", datos(unidades.slice(0, 2)))));
  assert.equal(simultaneous.filter((result) => result.status === 201).length, 1);
  assert.equal(simultaneous.filter((result) => result.status === 409).length, 9);
  assert.equal(await Reserva.countDocuments(), 1);
  const index = (await Reserva.collection.indexes()).find((entry) => entry.name === "cuarto_noche_sin_sobreventa");
  assert.equal(index?.unique, true);
});

test("Los apartados vencen sin borrar el historial y no pueden pagarse después", async () => {
  const created = await request("/reservas", "POST", datos());
  await Reserva.updateOne({ _id: created.body.id }, { $set: { expira: new Date(Date.now() - 1_000) } });
  assert.equal((await request(`/reservas/${created.body.id}/pago`, "POST", tarjeta)).status, 409);
  const expired = await Reserva.findById(created.body.id).select("+nochesOcupadas");
  assert.equal(expired!.estado, "vencida");
  assert.equal(expired!.nochesOcupadas, undefined);
  assert.equal((await request("/reservas", "POST", datos())).status, 201);
  assert.equal(await Reserva.countDocuments(), 2);
});

test("Pago simulado valida tarjeta, registra fallo y permite reintentar el cien por ciento", async () => {
  const created = await request("/reservas", "POST", datos());
  for (const invalid of [{ numero: "4111111111111111" }, { vencimiento: "01/20" }, { vencimiento: "13/99" }, { cvv: "a" }, { titular: "" }, { tipoTarjeta: "otra" }])
    assert.equal((await request(`/reservas/${created.body.id}/pago`, "POST", { ...tarjeta, ...invalid })).status, 400);
  const rejected = await request(`/reservas/${created.body.id}/pago`, "POST", { ...tarjeta, numero: "4000000000000002", tipoTarjeta: "credito" });
  assert.equal(rejected.status, 402);
  assert.match(rejected.body.error, /rechazado/);
  const pending = await request(`/reservas/${created.body.id}`);
  assert.equal(pending.body.estado, "pendiente-pago");
  assert.equal(pending.body.pago.estado, "rechazado");
  const paid = await request(`/reservas/${created.body.id}/pago`, "POST", { ...tarjeta, monto: 0.01 });
  assert.equal(paid.status, 200);
  assert.equal(paid.body.estado, "pagada");
  assert.equal(paid.body.pago.monto, created.body.total);
  assert.equal(paid.body.pago.modo, "simulado");
  assert.equal(paid.body.pago.tipoTarjeta, "debito");
  assert.equal(paid.body.pago.ultimos4, "4242");
  const stored = JSON.stringify(await Reserva.findById(created.body.id).lean());
  assert.ok(!stored.includes(tarjeta.numero));
  assert.ok(!stored.includes('"cvv"'));
  assert.ok(!stored.includes('"titular"'));
});

test("El pago simultáneo es idempotente y las reservas pagadas conservan la ocupación", async () => {
  const created = await request("/reservas", "POST", datos());
  const payments = await Promise.all(Array.from({ length: 5 }, () => request(`/reservas/${created.body.id}/pago`, "POST", tarjeta)));
  assert.ok(payments.every((result) => result.status === 200 && result.body.estado === "pagada"));
  assert.equal(new Set(payments.map((result) => result.body.pago.referencia)).size, 1);
  await Reserva.updateOne({ _id: created.body.id }, { $set: { expira: new Date(Date.now() - 1_000) } });
  const availability = await request(`/disponibilidad?ingreso=${fechaEn(2)}&salida=${fechaEn(4)}`);
  assert.ok(!availability.body.habitaciones.some((h: { id: string }) => h.id === unidades[0]));
  assert.equal((await request(`/reservas/${created.body.id}`)).body.estado, "pagada");
});
