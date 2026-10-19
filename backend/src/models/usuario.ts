import { Schema, model } from "mongoose";

export const ROLES = [
  "cliente",
  "administrador",
  "recepcion",
  "mantenimiento",
] as const;
export type Rol = (typeof ROLES)[number];

const usuarioSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 100 },
    correo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    contrasenaHash: { type: String, required: true, select: false },
    rol: { type: String, required: true, enum: ROLES, default: "cliente" },
  },
  { collection: "usuarios", timestamps: true, versionKey: false },
);

export const Usuario = model("Usuario", usuarioSchema);

const sesionSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    usuario: { type: Schema.Types.ObjectId, required: true, ref: "Usuario" },
    expira: { type: Date, required: true, index: { expires: 0 } },
  },
  { collection: "sesiones", versionKey: false },
);

export const Sesion = model("Sesion", sesionSchema);
