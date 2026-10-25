const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongoose").mongo;

// Igual que la API: proceso > .env.local > .env. Nunca se muestra la conexión.
dotenv.config({ path: [".env.local", ".env"], quiet: true });
const json = process.argv.includes("--json");
const roles = ["cliente", "administrador", "recepcion", "mantenimiento"];
const estadosUnidad = ["disponible", "ocupada", "pendiente-limpieza", "mantenimiento"];
const esTexto = (value) => typeof value === "string" && value.trim().length > 0;
const booleanOpcional = (value) => value === undefined || typeof value === "boolean";
const entero = (value, min = 0) => Number.isSafeInteger(value) && value >= min;
const esFecha = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const esFechaHora = (value) => value instanceof Date && Number.isFinite(value.getTime());
const esId = (value) => value instanceof ObjectId;
const hashCompatible = (value) => typeof value === "string" && /^scrypt:[a-f\d]{32}:[a-f\d]{128}$/i.test(value);

function emitir(report, exitCode) {
  if (json) console.log(JSON.stringify(report));
  else {
    console.log("Comprobación de base de datos · solo lectura");
    if (report.baseDeDatos) console.log(`Base revisada: ${report.baseDeDatos}`);
    if (report.conteos) {
      const c = report.conteos;
      console.log(`Catálogo: ${c.catalogo} · Amenidades: ${c.amenidades} · Habitaciones físicas: ${c.unidades} · Usuarios: ${c.usuarios} · Reservas: ${c.reservas}`);
      console.log(`Cuentas compatibles: ${report.usuarios.compatibles} · Administradores compatibles: ${report.usuarios.administradoresCompatibles}`);
      console.log(`Contraseñas: ${report.usuarios.contrasenas.scrypt} scrypt · ${report.usuarios.contrasenas.bcrypt} bcrypt · ${report.usuarios.contrasenas.otros} con otro formato`);
    }
    for (const check of report.comprobaciones ?? []) {
      const marca = { correcto: "OK", advertencia: "AVISO", error: "PENDIENTE" }[check.estado];
      console.log(`${marca}: ${check.mensaje}`);
    }
    if (report.error) console.log(report.error);
    if (report.conteos)
      console.log(report.compatible
        ? "La estructura es compatible. Prueba también la aplicación desde el servidor de destino."
        : "La estructura requiere ajustes antes de usar esta base con el sprint 4.");
    console.log("No se modificaron datos, colecciones ni índices.");
  }
  process.exitCode = exitCode;
}

function duplicados(docs, campo) {
  const seen = new Set();
  return docs.filter((doc) => {
    const value = doc[campo];
    if (!esTexto(value)) return false;
    if (seen.has(value)) return true;
    seen.add(value);
    return false;
  }).length;
}

async function revisar(client, database) {
  const db = client.db(database);
  const collections = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((item) => item.name));
  const leer = (name) => collections.has(name) ? db.collection(name).find({}).toArray() : Promise.resolve([]);
  const [catalogo, amenidades, unidades, usuarios, reservas, indices] = await Promise.all([
    leer("habitaciones"), leer("amenidades"), leer("unidades"), leer("usuarios"), leer("reservas"),
    collections.has("reservas") ? db.collection("reservas").listIndexes().toArray() : Promise.resolve([]),
  ]);
  const report = {
    compatible: true,
    soloLectura: true,
    baseDeDatos: database,
    conteos: { catalogo: catalogo.length, amenidades: amenidades.length, unidades: unidades.length, usuarios: usuarios.length, reservas: reservas.length },
    usuarios: { compatibles: 0, administradoresCompatibles: 0, roles: { cliente: 0, administrador: 0, recepcion: 0, mantenimiento: 0, otros: 0 }, contrasenas: { scrypt: 0, bcrypt: 0, otros: 0 } },
    comprobaciones: [],
  };
  function registrar(codigo, correcto, mensajeOk, mensajeError) {
    const estado = correcto ? "correcto" : "error";
    report.comprobaciones.push({ codigo, estado, mensaje: correcto ? mensajeOk : mensajeError });
    if (!correcto) report.compatible = false;
  }
  const amenidadCodes = new Set(amenidades.map((a) => a.codigo));
  const catalogoCodes = new Set(catalogo.map((h) => h.codigo));
  const unidadesIds = new Set(unidades.map((u) => String(u._id)));
  const usuariosIds = new Set(usuarios.map((u) => String(u._id)));
  const catalogoInvalido = catalogo.filter((h) => !(
    esTexto(h.codigo) && esTexto(h.nombre) && ["Sencilla", "Doble", "Suite"].includes(h.tipo) &&
    entero(h.capacidad?.adultos, 1) && entero(h.capacidad?.ninos) &&
    typeof h.precioPorNoche === "number" && Number.isFinite(h.precioPorNoche) && h.precioPorNoche >= 0 &&
    h.moneda === "GTQ" && Array.isArray(h.amenidades) && h.amenidades.every((a) => esTexto(a) && amenidadCodes.has(a)) &&
    Array.isArray(h.fotos) && h.fotos.length > 0 && h.fotos.every(esTexto) &&
    esTexto(h.descripcion) && typeof h.orden === "number" && Number.isFinite(h.orden) && booleanOpcional(h.activa)
  )).length;
  registrar("catalogo", catalogo.length > 0 && catalogoInvalido === 0 && !duplicados(catalogo, "codigo"),
    "El catálogo tiene la estructura de habitaciones esperada.",
    `Revisar el catálogo: ${catalogoInvalido} registros incompatibles. Debe existir al menos un modelo y sus códigos deben ser únicos.`);
  const amenidadesInvalidas = amenidades.filter((a) => !(
    esId(a._id) && esTexto(a.codigo) && esTexto(a.nombre) && (a.descripcion === undefined || typeof a.descripcion === "string") && booleanOpcional(a.activa)
  )).length;
  registrar("amenidades", amenidadesInvalidas === 0 && !duplicados(amenidades, "codigo"),
    "Las amenidades y sus referencias son compatibles.",
    `Revisar las amenidades: ${amenidadesInvalidas} registros incompatibles o códigos repetidos.`);
  const unidadesInvalidas = unidades.filter((u) => !(
    esId(u._id) && esTexto(u.numero) && esTexto(u.catalogo) && catalogoCodes.has(u.catalogo) &&
    typeof u.activa === "boolean" && estadosUnidad.includes(u.estado)
  )).length;
  registrar("unidades", unidades.length > 0 && unidadesInvalidas === 0 && !duplicados(unidades, "numero"),
    "Las habitaciones físicas tienen estados, habilitación y modelos válidos.",
    `Revisar las habitaciones físicas: ${unidadesInvalidas} registros incompatibles. Se necesita inventario, números únicos y referencias al catálogo.`);
  for (const user of usuarios) {
    report.usuarios.roles[roles.includes(user.rol) ? user.rol : "otros"]++;
    const formato = hashCompatible(user.contrasenaHash) ? "scrypt" :
      typeof user.contrasenaHash === "string" && /^\$2[aby]\$/.test(user.contrasenaHash) ? "bcrypt" : "otros";
    report.usuarios.contrasenas[formato]++;
    const valido = esId(user._id) && esTexto(user.nombre) && typeof user.correo === "string" &&
      user.correo === user.correo.trim().toLowerCase() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.correo) &&
      roles.includes(user.rol) && hashCompatible(user.contrasenaHash);
    if (valido) {
      report.usuarios.compatibles++;
      if (user.rol === "administrador") report.usuarios.administradoresCompatibles++;
    }
  }
  registrar("usuarios", usuarios.length > 0 && report.usuarios.compatibles === usuarios.length && !duplicados(usuarios, "correo"),
    "Los usuarios tienen roles y contraseñas compatibles con esta versión.",
    "Hay cuentas con datos, roles o contraseñas de otra versión. Conservar un respaldo y preparar su migración; cambiar la conexión no convierte usuarios ni contraseñas.");
  registrar("administrador", report.usuarios.administradoresCompatibles > 0,
    "Existe al menos un administrador compatible.",
    "Falta un administrador que pueda iniciar sesión con esta versión. Preparar el acceso antes de la demostración.");

  const reservasInvalidas = reservas.filter((r) => {
    if (!esTexto(r.codigo) || !esId(r.usuario) || !usuariosIds.has(String(r.usuario)) ||
      !esFecha(r.ingreso) || !esFecha(r.salida) || r.salida <= r.ingreso ||
      !entero(r.noches, 1) || r.noches !== (Date.parse(r.salida) - Date.parse(r.ingreso)) / 86_400_000 ||
      r.noches > 365 || !Array.isArray(r.habitaciones) || r.habitaciones.length < 1 || r.habitaciones.length > 4 ||
      !esTexto(r.nombre) || !esTexto(r.correo) || !esTexto(r.telefono) || !entero(r.totalCentavos) ||
      r.moneda !== "GTQ" || !["pendiente-pago", "pagada", "vencida"].includes(r.estado) || !esFechaHora(r.expira)) return true;
    if (r.habitaciones.some((h) => !h || typeof h !== "object" || !esId(h.unidad) || !unidadesIds.has(String(h.unidad)) ||
      !esTexto(h.numero) || !esTexto(h.nombre) || !catalogoCodes.has(h.catalogo) || !entero(h.precioCentavos))) return true;
    if (new Set(r.habitaciones.map((h) => String(h.unidad))).size !== r.habitaciones.length ||
      r.totalCentavos !== r.habitaciones.reduce((total, h) => total + h.precioCentavos * r.noches, 0)) return true;
    const noches = r.habitaciones.flatMap((h) => Array.from({ length: r.noches }, (_, day) =>
      `${h.unidad}:${new Date(Date.parse(r.ingreso) + day * 86_400_000).toISOString().slice(0, 10)}`));
    if (r.estado === "vencida" ? r.nochesOcupadas !== undefined :
      !Array.isArray(r.nochesOcupadas) || r.nochesOcupadas.length !== noches.length ||
      new Set(r.nochesOcupadas).size !== noches.length || noches.some((key) => !r.nochesOcupadas.includes(key))) return true;
    if (!r.pago) return r.estado === "pagada";
    return r.pago.modo !== "simulado" || !["credito", "debito"].includes(r.pago.tipoTarjeta) ||
      r.pago.estado !== (r.estado === "pagada" ? "aprobado" : "rechazado") ||
      !esTexto(r.pago.referencia) || !esFechaHora(r.pago.fecha) ||
      r.pago.montoCentavos !== r.totalCentavos || typeof r.pago.ultimos4 !== "string" || !/^\d{4}$/.test(r.pago.ultimos4);
  }).length;
  registrar("reservas", reservasInvalidas === 0 && !duplicados(reservas, "codigo"),
    "Las reservas existentes tienen la estructura, los importes y las relaciones esperadas.",
    `Hay ${reservasInvalidas} reservas incompatibles o códigos repetidos. Revisar su migración antes de iniciar esta versión.`);
  const indexName = "cuarto_noche_sin_sobreventa";
  const esClaveNoches = (index) => Object.keys(index.key).length === 1 && index.key.nochesOcupadas === 1;
  const index = indices.find((entry) => esClaveNoches(entry) && entry.name === indexName && entry.unique === true && entry.sparse === true && !entry.partialFilterExpression);
  const conflicto = indices.some((entry) => (entry.name === indexName || esClaveNoches(entry)) && entry !== index);
  if (!index && reservas.length === 0 && !conflicto)
    report.comprobaciones.push({ codigo: "indice-reservas", estado: "advertencia", mensaje: "La colección de reservas o su índice aún no existe: se prepara al arrancar la API. Esta comprobación no los crea." });
  else registrar("indice-reservas", Boolean(index) && !conflicto,
    "Existe el índice único que impide reservar dos veces la misma habitación y noche.",
    "Falta el índice de reservas o su definición es incompatible. Conservar los datos y revisar duplicados e índice antes de iniciar la API.");
  return report;
}

async function main() {
  let client;
  let etapa = "configuracion";
  try {
    if (process.argv.slice(2).some((arg) => arg !== "--json")) throw new Error("config");
    const uri = process.env.MONGODB_URI;
    const expected = process.env.EXPECTED_DB_NAME;
    if (!uri || !expected) {
      emitir({ compatible: false, soloLectura: true, tipo: "configuracion", error: "Configura MONGODB_URI y EXPECTED_DB_NAME antes de comprobar la base." }, 1);
      return;
    }
    if (process.env.REQUIRE_LOCAL_DB === "true" &&
      !/^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\/starhotel_(sprint3|test(?:_reservas|_amenidades|_entrega)?)(?:\?|$)/.test(uri)) {
      emitir({ compatible: false, soloLectura: true, tipo: "configuracion", error: "El modo local solo permite la base local del proyecto o una base de pruebas autorizada en localhost." }, 1);
      return;
    }
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 8_000, connectTimeoutMS: 8_000, socketTimeoutMS: 8_000, timeoutMS: 8_000 });
    if (client.db().databaseName !== expected) {
      emitir({ compatible: false, soloLectura: true, tipo: "configuracion", error: "La base de MONGODB_URI no coincide con EXPECTED_DB_NAME. No se abrió ninguna conexión." }, 1);
      return;
    }
    etapa = "conexion";
    await client.connect();
    etapa = "lectura";
    const report = await revisar(client, expected);
    emitir(report, report.compatible ? 0 : 2);
  } catch {
    const mensajes = {
      configuracion: "La configuración de conexión no es válida. Revisar MONGODB_URI y las opciones del comando sin compartir credenciales.",
      conexion: "No se pudo comprobar la conexión. Revisar la configuración privada, el acceso de red y los permisos; no se muestran credenciales.",
      lectura: "No se pudo leer la estructura completa. Revisar los permisos de lectura de esta base y volver a ejecutar la comprobación.",
    };
    emitir({ compatible: false, soloLectura: true, tipo: etapa, error: mensajes[etapa] }, 1);
  } finally {
    if (client) await client.close().catch(() => {});
  }
}

main();
