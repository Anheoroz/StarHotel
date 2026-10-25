import { Schema, model } from "mongoose";

const amenidadSchema = new Schema(
  {
    codigo: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    descripcion: { type: String, default: "" },
    activa: { type: Boolean, default: true },
  },
  { collection: "amenidades", versionKey: false },
);

export type AmenidadDocumento = {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activa?: boolean;
};

export const Amenidad = model("Amenidad", amenidadSchema);
