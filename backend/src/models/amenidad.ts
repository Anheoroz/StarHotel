import { Schema, model } from "mongoose";

const amenidadSchema = new Schema(
  {
    codigo: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
  },
  { collection: "amenidades", versionKey: false },
);

export type AmenidadDocumento = {
  codigo: string;
  nombre: string;
};

export const Amenidad = model("Amenidad", amenidadSchema);
