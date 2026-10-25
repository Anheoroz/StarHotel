import { after, before, beforeEach, test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
import { scryptSync } from "node:crypto";
import mongoose from "mongoose";

const { MongoClient, ObjectId } = mongoose.mongo;
const database = "starhotel_test_entrega";
const uri = `mongodb://127.0.0.1:27018/${database}`;
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8_000 });
const db = client.db();
const execute = promisify(execFile);
const checker = path.resolve(__dirname, "../../scripts/check-db.cjs");
let configDir = "";
const adminId = new ObjectId();
const clienteId = new ObjectId();
const unidadId = new ObjectId();
const salt = "1234567890abcdef1234567890abcdef";
const password = "SoloPruebasEntrega2026!";
const passwordHash = `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;

function entorno(overrides: Record<string, string> = {}) {
  const env = { ...process.env };
  for (const key of ["MONGODB_URI", "EXPECTED_DB_NAME", "REQUIRE_LOCAL_DB"])
    delete env[key];
  return { ...env, ...overrides };
}

async function runCheck(overrides: Record<string, string> = {}) {
  try {
    const result = await execute(process.execPath, [checker, "--json"], {
      cwd: configDir, env: entorno(overrides), timeout: 12_000,
    });
    return { code: 0, output: result.stdout, report: JSON.parse(result.stdout) };
  } catch (error) {
    const result = error as { code: number; stdout: string; stderr: string };
    assert.equal(result.stderr, "");
    return { code: result.code, output: result.stdout, report: JSON.parse(result.stdout) };
  }
}

async function snapshot() {
  const collections = (await db.listCollections().toArray()).sort((a, b) => a.name.localeCompare(b.name));
  const data = await Promise.all(collections.map(async (collection) => ({
    collection,
    documents: await db.collection(collection.name).find({}).sort({ _id: 1 }).toArray(),
    indexes: (await db.collection(collection.name).listIndexes().toArray()).sort((a, b) => a.name!.localeCompare(b.name!)),
  })));
  return JSON.stringify(data);
}

async function fixture() {
  await db.collection("habitaciones").insertOne({
    codigo: "sencilla", nombre: "Habitación de prueba", tipo: "Sencilla", capacidad: { adultos: 2, ninos: 1 },
    precioPorNoche: 85.29, moneda: "GTQ", amenidades: ["wifi"], fotos: ["/rooms/sencilla.jpg"],
    descripcion: "Modelo para comprobar la entrega.", orden: 1, activa: true,
  });
  await db.collection("amenidades").insertOne({ codigo: "wifi", nombre: "Wi-Fi" });
  await db.collection("unidades").insertOne({ _id: unidadId, numero: "101", catalogo: "sencilla", activa: true, estado: "disponible" });
  await db.collection("usuarios").insertMany([
    { _id: adminId, nombre: "Administrador privado", correo: "administrador-privado@entrega.test", contrasenaHash: passwordHash, rol: "administrador" },
    { _id: clienteId, nombre: "Cliente privado", correo: "cliente-privado@entrega.test", contrasenaHash: passwordHash, rol: "cliente" },
  ]);
}

before(async () => {
  assert.equal(db.databaseName, database);
  assert.match(uri, /^mongodb:\/\/127\.0\.0\.1:27018\/starhotel_test_entrega$/);
  await client.connect();
  configDir = await mkdtemp(path.join(tmpdir(), "starhotel-entrega-"));
  await writeFile(path.join(configDir, ".env"), "MONGODB_URI=mongodb://127.0.0.1:1/otra\nEXPECTED_DB_NAME=otra\nREQUIRE_LOCAL_DB=true\n", { mode: 0o600 });
  await writeFile(path.join(configDir, ".env.local"), `MONGODB_URI=${uri}\nEXPECTED_DB_NAME=${database}\nREQUIRE_LOCAL_DB=true\n`, { mode: 0o600 });
});
beforeEach(async () => {
  assert.equal(db.databaseName, database);
  await db.dropDatabase();
});
after(async () => {
  assert.equal(db.databaseName, database);
  await db.dropDatabase();
  await client.close();
  if (configDir) await rm(configDir, { recursive: true, force: true });
});

test("db:check reconoce la estructura y el índice de reservas sin crear colecciones ni modificar datos", async () => {
  await fixture();
  const beforeEmpty = await snapshot();
  const empty = await runCheck();
  assert.equal(empty.code, 0);
  assert.equal(empty.report.compatible, true);
  assert.equal(empty.report.soloLectura, true);
  assert.equal(empty.report.baseDeDatos, database);
  assert.equal(empty.report.usuarios.administradoresCompatibles, 1);
  assert.equal(empty.report.comprobaciones.find((check: { codigo: string }) => check.codigo === "indice-reservas").estado, "advertencia");
  assert.equal(await snapshot(), beforeEmpty);

  const ingreso = "2026-11-01";
  const salida = "2026-11-03";
  await db.collection("reservas").insertOne({
    codigo: "SH-ENTREGA", usuario: clienteId, ingreso, salida, noches: 2,
    habitaciones: [{ unidad: unidadId, numero: "101", nombre: "Habitación de prueba", catalogo: "sencilla", precioCentavos: 8529 }],
    nombre: "Contacto privado", correo: "contacto-privado@entrega.test", telefono: "55551234",
    totalCentavos: 17058, moneda: "GTQ", estado: "pagada", expira: new Date("2026-10-26T00:00:00Z"),
    nochesOcupadas: [`${unidadId}:${ingreso}`, `${unidadId}:2026-11-02`],
    pago: { modo: "simulado", tipoTarjeta: "credito", estado: "aprobado", referencia: "SIM-PRUEBA", fecha: new Date("2026-10-25T23:00:00Z"), montoCentavos: 17058, ultimos4: "4242" },
  });
  await db.collection("reservas").createIndex({ nochesOcupadas: 1 }, { unique: true, sparse: true, name: "cuarto_noche_sin_sobreventa" });
  const beforePaid = await snapshot();
  const paid = await runCheck();
  assert.equal(paid.code, 0);
  assert.equal(paid.report.conteos.reservas, 1);
  assert.ok(paid.report.comprobaciones.every((check: { estado: string }) => check.estado === "correcto"));
  assert.equal(await snapshot(), beforePaid);
  for (const privateValue of [passwordHash, password, "cliente-privado@entrega.test", "Contacto privado", "55551234"])
    assert.ok(!paid.output.includes(privateValue));
});

test("db:check detecta cuentas de otra versión, falta de inventario y reservas incompatibles sin cambiarlas", async () => {
  await fixture();
  await db.collection("unidades").deleteMany({});
  await db.collection("usuarios").updateOne({ _id: adminId }, { $set: { contrasenaHash: "$2b$10$HASH_PRIVADO_DE_OTRA_VERSION" } });
  await db.collection("usuarios").updateOne({ _id: clienteId }, { $set: { rol: "huesped" } });
  await db.collection("reservas").insertOne({ codigo: "LEGACY", habitaciones: [null] });
  const before = await snapshot();
  const result = await runCheck();
  assert.equal(result.code, 2);
  assert.equal(result.report.compatible, false);
  assert.equal(result.report.usuarios.contrasenas.bcrypt, 1);
  assert.equal(result.report.usuarios.roles.otros, 1);
  for (const codigo of ["unidades", "usuarios", "administrador", "reservas", "indice-reservas"])
    assert.equal(result.report.comprobaciones.find((check: { codigo: string }) => check.codigo === codigo).estado, "error");
  assert.equal(await snapshot(), before);
  for (const privateValue of ["$2b$10$HASH_PRIVADO_DE_OTRA_VERSION", "cliente-privado@entrega.test", passwordHash])
    assert.ok(!result.output.includes(privateValue));
});

test("db:check rechaza una base distinta antes de abrir la conexión y respeta las variables del proceso", async () => {
  await fixture();
  const before = await snapshot();
  let conexiones = 0;
  const listener = net.createServer((socket) => { conexiones++; socket.destroy(); });
  await new Promise<void>((resolve) => listener.listen(0, "127.0.0.1", resolve));
  try {
    const port = (listener.address() as net.AddressInfo).port;
    const result = await runCheck({
      MONGODB_URI: `mongodb://127.0.0.1:${port}/${database}`,
      EXPECTED_DB_NAME: "otra_base",
      REQUIRE_LOCAL_DB: "true",
    });
    assert.equal(result.code, 1);
    assert.equal(result.report.tipo, "configuracion");
    assert.match(result.report.error, /No se abrió ninguna conexión/);
    assert.equal(conexiones, 0);
    assert.equal(await snapshot(), before);
  } finally {
    await new Promise<void>((resolve) => listener.close(() => resolve()));
  }
  const malformed = await runCheck({ MONGODB_URI: "mongodb://usuario-privado:clave-privada@[", REQUIRE_LOCAL_DB: "false" });
  assert.equal(malformed.code, 1);
  assert.ok(!malformed.output.includes("usuario-privado"));
  assert.ok(!malformed.output.includes("clave-privada"));
});
