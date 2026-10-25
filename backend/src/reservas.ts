import { randomBytes } from "node:crypto";
import mongoose, { type Types } from "mongoose";
import { HttpError, texto } from "./http";
import { Habitacion } from "./models/habitacion";
import { Amenidad } from "./models/amenidad";
import { Reserva, type ReservaDatos } from "./models/reserva";
import { Unidad } from "./models/unidad";

export const APARTADO_MS = 15 * 60 * 1000;
const DIA_MS = 86_400_000;
let indexDatabase: typeof mongoose.connection.db;
let indexPromise: Promise<unknown> | undefined;

export async function ensureReservaIndexes() {
  if (!mongoose.connection.db) throw new Error("La base de datos no está conectada.");
  if (indexDatabase !== mongoose.connection.db || !indexPromise) {
    indexDatabase = mongoose.connection.db;
    indexPromise = Reserva.createIndexes().catch((error) => {
      indexPromise = undefined;
      throw error;
    });
  }
  await indexPromise;
}

export function hoyGuatemala(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guatemala",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function horizonteReserva(now = new Date()): string {
  const [year, month, day] = hoyGuatemala(now).split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month + 3, 0)).getUTCDate();
  return new Date(Date.UTC(year, month + 2, Math.min(day, lastDay)))
    .toISOString()
    .slice(0, 10);
}

function fecha(value: unknown, nombre: string): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new HttpError(400, `${nombre} debe ser una fecha válida (AAAA-MM-DD).`);
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value)
    throw new HttpError(400, `${nombre} debe ser una fecha válida.`);
  return value;
}

export function validarFechas(ingresoValue: unknown, salidaValue: unknown, now = new Date()) {
  const ingreso = fecha(ingresoValue, "La fecha de ingreso");
  const salida = fecha(salidaValue, "La fecha de salida");
  if (ingreso < hoyGuatemala(now))
    throw new HttpError(400, "El ingreso no puede ser anterior a hoy.");
  if (salida <= ingreso)
    throw new HttpError(400, "La salida debe ser posterior al ingreso.");
  if (ingreso > horizonteReserva(now))
    throw new HttpError(400, "El ingreso debe estar dentro de los próximos tres meses.");
  const noches = Math.round((Date.parse(salida) - Date.parse(ingreso)) / DIA_MS);
  // Acota el tamaño de la consulta y del índice por noche; no es una política de tarifas.
  if (noches > 365)
    throw new HttpError(400, "Esta consulta admite estancias de hasta 365 noches. Contacta al hotel para una estancia mayor.");
  const fechas = Array.from({ length: noches }, (_, index) =>
    new Date(Date.parse(ingreso) + index * DIA_MS).toISOString().slice(0, 10),
  );
  return { ingreso, salida, noches, fechas };
}

export async function liberarApartadosVencidos(now = new Date()) {
  await ensureReservaIndexes();
  await Reserva.updateMany(
    { estado: "pendiente-pago", expira: { $lte: now } },
    { $set: { estado: "vencida" }, $unset: { nochesOcupadas: 1 } },
  );
}

export async function consultarDisponibilidad(ingresoValue: unknown, salidaValue: unknown) {
  const dates = validarFechas(ingresoValue, salidaValue);
  await liberarApartadosVencidos();
  const [modelos, amenidadesActivas] = await Promise.all([
    Habitacion.find({ activa: { $ne: false } }).sort({ orden: 1 }).lean(),
    Amenidad.find({ activa: { $ne: false } }).lean(),
  ]);
  const amenidadPorCodigo = new Map(amenidadesActivas.map((amenidad) => [amenidad.codigo, amenidad]));
  const porCodigo = new Map(modelos.map((modelo) => [modelo.codigo, modelo]));
  const unidades = await Unidad.find({
    activa: true,
    estado: "disponible",
    catalogo: { $in: [...porCodigo.keys()] },
  }).sort({ numero: 1 }).lean();
  const ocupadas = await Reserva.distinct("habitaciones.unidad", {
    nochesOcupadas: { $exists: true },
    ingreso: { $lt: dates.salida },
    salida: { $gt: dates.ingreso },
  });
  const ocupadasIds = new Set(ocupadas.map(String));
  const habitaciones = unidades.filter((unidad) => !ocupadasIds.has(String(unidad._id))).map((unidad) => {
    const modelo = porCodigo.get(unidad.catalogo)!;
    const amenidadesDetalle = modelo.amenidades.flatMap((codigo) => {
      const amenidad = amenidadPorCodigo.get(codigo);
      return amenidad ? [{ codigo, nombre: amenidad.nombre, descripcion: amenidad.descripcion ?? "" }] : [];
    });
    return {
      id: String(unidad._id),
      numero: unidad.numero,
      catalogo: modelo.codigo,
      nombre: modelo.nombre,
      tipo: modelo.tipo,
      adultos: modelo.capacidad!.adultos!,
      ninos: modelo.capacidad!.ninos!,
      precio: modelo.precioPorNoche,
      fotos: modelo.fotos,
      amenidades: amenidadesDetalle.map((amenidad) => amenidad.codigo),
      amenidadesDetalle,
      descripcion: modelo.descripcion,
    };
  });
  return { ingreso: dates.ingreso, salida: dates.salida, noches: dates.noches, habitaciones };
}

export function reservaRespuesta(doc: ReservaDatos & { _id: Types.ObjectId }) {
  return {
    id: String(doc._id),
    codigo: doc.codigo,
    ingreso: doc.ingreso,
    salida: doc.salida,
    noches: doc.noches,
    habitaciones: doc.habitaciones.map((habitacion) => ({
      id: String(habitacion.unidad),
      numero: habitacion.numero,
      nombre: habitacion.nombre,
      precio: habitacion.precioCentavos / 100,
    })),
    nombre: doc.nombre,
    correo: doc.correo,
    telefono: doc.telefono,
    total: doc.totalCentavos / 100,
    moneda: doc.moneda,
    estado: doc.estado,
    expira: doc.expira,
    ...(doc.pago ? { pago: {
      modo: doc.pago.modo,
      tipoTarjeta: doc.pago.tipoTarjeta,
      estado: doc.pago.estado,
      referencia: doc.pago.referencia,
      fecha: doc.pago.fecha,
      monto: doc.pago.montoCentavos / 100,
      ultimos4: doc.pago.ultimos4,
    } } : {}),
  };
}

function idsHabitaciones(value: unknown): string[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 4 ||
    value.some((id) => typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)))
    throw new HttpError(400, "Selecciona de una a cuatro habitaciones válidas.");
  const ids = value.map((id: string) => id.toLowerCase());
  if (new Set(ids).size !== ids.length)
    throw new HttpError(400, "No puedes seleccionar una habitación más de una vez.");
  return ids;
}

export async function crearReserva(usuario: string, body: Record<string, unknown>) {
  const dates = validarFechas(body.ingreso, body.salida);
  const ids = idsHabitaciones(body.habitaciones);
  const nombre = texto(body.nombre, "El nombre", 100);
  const correo = texto(body.correo, "El correo", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
    throw new HttpError(400, "Ingresa un correo válido.");
  const telefono = texto(body.telefono, "El teléfono", 30);
  if (!/^\+?[\d ()-]{7,30}$/.test(telefono) || telefono.replace(/\D/g, "").length < 7)
    throw new HttpError(400, "Ingresa un teléfono válido con al menos siete dígitos.");
  const disponibles = await consultarDisponibilidad(dates.ingreso, dates.salida);
  const porId = new Map(disponibles.habitaciones.map((habitacion) => [habitacion.id, habitacion]));
  const habitaciones = ids.map((id) => {
    const habitacion = porId.get(id);
    if (!habitacion)
      throw new HttpError(409, "Una habitación ya no está disponible. Consulta las fechas nuevamente.");
    const precioCentavos = Math.round(habitacion.precio * 100);
    if (!Number.isSafeInteger(precioCentavos) || precioCentavos < 0)
      throw new HttpError(409, "Una habitación tiene una tarifa inválida. Contacta al hotel.");
    return {
      unidad: id,
      numero: habitacion.numero,
      catalogo: habitacion.catalogo,
      nombre: habitacion.nombre,
      precioCentavos,
    };
  });
  const totalCentavos = habitaciones.reduce((total, h) => total + h.precioCentavos * dates.noches, 0);
  if (!Number.isSafeInteger(totalCentavos))
    throw new HttpError(400, "El total de la reserva supera el límite permitido.");
  try {
    const reserva = await Reserva.create({
      codigo: `SH-${randomBytes(8).toString("hex").toUpperCase()}`,
      usuario,
      ingreso: dates.ingreso,
      salida: dates.salida,
      noches: dates.noches,
      habitaciones,
      nombre,
      correo,
      telefono,
      totalCentavos,
      moneda: "GTQ",
      estado: "pendiente-pago",
      expira: new Date(Date.now() + APARTADO_MS),
      nochesOcupadas: ids.flatMap((id) => dates.fechas.map((day) => `${id}:${day}`)),
    });
    return reservaRespuesta(reserva);
  } catch (error) {
    if ((error as { code?: number }).code === 11000)
      throw new HttpError(409, "Una habitación acaba de ser reservada. Consulta las fechas nuevamente.");
    throw error;
  }
}

export async function buscarReservaPropia(id: unknown, usuario: string) {
  if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id))
    throw new HttpError(404, "Reserva no encontrada.");
  await liberarApartadosVencidos();
  const reserva = await Reserva.findOne({ _id: id, usuario });
  if (!reserva) throw new HttpError(404, "Reserva no encontrada.");
  return reserva;
}

function validarTarjeta(body: Record<string, unknown>) {
  texto(body.titular, "El titular de la tarjeta", 100);
  const tipoTarjeta = body.tipoTarjeta ?? "credito";
  if (tipoTarjeta !== "credito" && tipoTarjeta !== "debito")
    throw new HttpError(400, "Selecciona tarjeta de crédito o débito.");
  if (typeof body.numero !== "string" || !/^[\d ]{16,23}$/.test(body.numero))
    throw new HttpError(400, "Ingresa el número de una tarjeta de prueba.");
  const numero = body.numero.replaceAll(" ", "");
  if (!["4242424242424242", "4000000000000002"].includes(numero))
    throw new HttpError(400, "Esta demostración solo admite las tarjetas de prueba indicadas; no uses tarjetas reales.");
  if (typeof body.vencimiento !== "string" || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(body.vencimiento))
    throw new HttpError(400, "Ingresa el vencimiento como MM/AA.");
  const [mes, anio] = body.vencimiento.split("/").map(Number);
  const hoy = hoyGuatemala();
  if (`20${String(anio).padStart(2, "0")}-${String(mes).padStart(2, "0")}` < hoy.slice(0, 7))
    throw new HttpError(400, "La tarjeta de prueba está vencida.");
  if (typeof body.cvv !== "string" || !/^\d{3,4}$/.test(body.cvv))
    throw new HttpError(400, "Ingresa un código de seguridad de tres o cuatro dígitos.");
  return { aprobado: numero === "4242424242424242", ultimos4: numero.slice(-4), tipoTarjeta };
}

export async function pagarReserva(id: unknown, usuario: string, body: Record<string, unknown>) {
  const reserva = await buscarReservaPropia(id, usuario);
  if (reserva.estado === "pagada") return reservaRespuesta(reserva);
  if (reserva.estado === "vencida")
    throw new HttpError(409, "El tiempo para pagar venció. Crea una reserva nueva.");
  const tarjeta = validarTarjeta(body);
  const now = new Date();
  const actualizada = await Reserva.findOneAndUpdate(
    { _id: reserva._id, usuario, estado: "pendiente-pago", expira: { $gt: now } },
    { $set: {
      ...(tarjeta.aprobado ? { estado: "pagada" } : {}),
      pago: {
        modo: "simulado",
        tipoTarjeta: tarjeta.tipoTarjeta,
        estado: tarjeta.aprobado ? "aprobado" : "rechazado",
        referencia: `SIM-${randomBytes(12).toString("hex").toUpperCase()}`,
        fecha: now,
        montoCentavos: reserva.totalCentavos,
        ultimos4: tarjeta.ultimos4,
      },
    } },
    { new: true, runValidators: true },
  );
  if (!actualizada) {
    const final = await buscarReservaPropia(id, usuario);
    if (final.estado === "pagada") return reservaRespuesta(final);
    throw new HttpError(409, "El tiempo para pagar venció. Crea una reserva nueva.");
  }
  if (!tarjeta.aprobado)
    throw new HttpError(402, "Pago simulado rechazado. Prueba con la tarjeta de demostración aprobada; no se realizó ningún cobro.");
  return reservaRespuesta(actualizada);
}
