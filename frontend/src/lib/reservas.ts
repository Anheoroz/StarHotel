export type HabitacionDisponible = {
  id: string;
  numero: string;
  catalogo: string;
  nombre: string;
  tipo: string;
  adultos: number;
  ninos: number;
  precio: number;
  fotos: string[];
  amenidades: string[];
  descripcion: string;
};

export type Disponibilidad = {
  ingreso: string;
  salida: string;
  noches: number;
  habitaciones: HabitacionDisponible[];
};

export type Reserva = {
  id: string;
  codigo: string;
  ingreso: string;
  salida: string;
  noches: number;
  habitaciones: {
    id: string;
    numero: string;
    nombre: string;
    precio: number;
  }[];
  nombre: string;
  correo: string;
  telefono: string;
  total: number;
  moneda: "GTQ";
  estado: "pendiente-pago" | "pagada" | "vencida";
  expira: string;
  pago?: {
    modo: "simulado";
    tipoTarjeta: "credito" | "debito";
    estado: "aprobado" | "rechazado";
    referencia?: string;
    ultimos4?: string;
    fecha?: string;
    monto?: number;
  };
};

export const RESERVA_ESTADOS = {
  "pendiente-pago": "Pendiente de pago",
  pagada: "Pagada",
  vencida: "Plazo de pago vencido",
};

export function moneda(valor: number) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(valor);
}

export function fechaCorta(fecha: string) {
  return new Intl.DateTimeFormat("es-GT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${fecha.slice(0, 10)}T12:00:00Z`));
}

export function fechaParametro(valor: unknown) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor))
    return "";
  const dia = new Date(`${valor}T12:00:00Z`);
  return !Number.isNaN(dia.getTime()) &&
    dia.toISOString().slice(0, 10) === valor
    ? valor
    : "";
}

export function fechaGuatemala() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guatemala",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const parte = (tipo: string) =>
    partes.find((p) => p.type === tipo)?.value ?? "";
  return `${parte("year")}-${parte("month")}-${parte("day")}`;
}

export function sumarDias(fecha: string, dias: number) {
  const dia = new Date(`${fecha}T12:00:00Z`);
  dia.setUTCDate(dia.getUTCDate() + dias);
  return dia.toISOString().slice(0, 10);
}

export function limiteReservas(fecha: string) {
  const dia = new Date(`${fecha}T12:00:00Z`);
  const numero = dia.getUTCDate();
  dia.setUTCDate(1);
  dia.setUTCMonth(dia.getUTCMonth() + 3);
  const finMes = new Date(
    Date.UTC(dia.getUTCFullYear(), dia.getUTCMonth() + 1, 0),
  ).getUTCDate();
  dia.setUTCDate(Math.min(numero, finMes));
  return dia.toISOString().slice(0, 10);
}
