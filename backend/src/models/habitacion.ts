import { Schema, model } from "mongoose";

export const TIPOS_HABITACION = ["Sencilla", "Doble", "Suite"] as const;

export type TipoHabitacion = (typeof TIPOS_HABITACION)[number];

const habitacionSchema = new Schema(
  {
    codigo: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    tipo: { type: String, required: true, enum: TIPOS_HABITACION },
    capacidad: {
      adultos: { type: Number, required: true, min: 1 },
      ninos: { type: Number, required: true, min: 0 },
    },
    precioPorNoche: { type: Number, required: true, min: 0 },
    moneda: { type: String, required: true, default: "GTQ" },
    amenidades: { type: [String], required: true },
    fotos: { type: [String], required: true },
    descripcion: { type: String, required: true },
    orden: { type: Number, required: true },
  },
  { collection: "habitaciones", versionKey: false },
);

export type HabitacionDocumento = {
  codigo: string;
  nombre: string;
  tipo: TipoHabitacion;
  capacidad: {
    adultos: number;
    ninos: number;
  };
  precioPorNoche: number;
  moneda: string;
  amenidades: string[];
  fotos: string[];
  descripcion: string;
  orden: number;
};

export type HabitacionRespuesta = {
  id: string;
  nombre: string;
  tipo: TipoHabitacion;
  adultos: number;
  ninos: number;
  precio: number;
  amenidades: string[];
  fotos: string[];
  descripcion: string;
};

export function toHabitacionRespuesta(doc: HabitacionDocumento): HabitacionRespuesta {
  return {
    id: doc.codigo,
    nombre: doc.nombre,
    tipo: doc.tipo,
    adultos: doc.capacidad.adultos,
    ninos: doc.capacidad.ninos,
    precio: doc.precioPorNoche,
    amenidades: doc.amenidades,
    fotos: doc.fotos,
    descripcion: doc.descripcion,
  };
}

export const Habitacion = model("Habitacion", habitacionSchema);
