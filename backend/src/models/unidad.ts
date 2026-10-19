import { Schema, model } from "mongoose";

export const ESTADOS = [
  "disponible",
  "ocupada",
  "pendiente-limpieza",
  "mantenimiento",
] as const;

// Un catálogo puede describir varios cuartos físicos. El número identifica al cuarto.
const unidadSchema = new Schema(
  {
    numero: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 20,
    },
    catalogo: { type: String, required: true, index: true },
    activa: { type: Boolean, default: true, required: true },
    estado: {
      type: String,
      enum: ESTADOS,
      default: "disponible",
      required: true,
    },
  },
  { collection: "unidades", timestamps: true, versionKey: false },
);

export const Unidad = model("Unidad", unidadSchema);
