import { Schema, model } from "mongoose";

export const ROLES = ["administrador", "recepcion", "mantenimiento", "huesped"] as const;

export type Rol = (typeof ROLES)[number];

export const ROLES_PERSONAL = ["administrador", "recepcion", "mantenimiento"] as const;

export type RolPersonal = (typeof ROLES_PERSONAL)[number];

const usuarioSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
    contrasenaHash: { type: String, required: true },
    rol: { type: String, required: true, enum: ROLES },
  },
  { collection: "usuarios", versionKey: false },
);

export type UsuarioDocumento = {
  _id: { toString(): string };
  nombre: string;
  correo: string;
  contrasenaHash: string;
  rol: Rol;
};

export type UsuarioPublico = {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
};

export function toUsuarioPublico(doc: UsuarioDocumento): UsuarioPublico {
  return {
    id: doc._id.toString(),
    nombre: doc.nombre,
    correo: doc.correo,
    rol: doc.rol,
  };
}

export const Usuario = model("Usuario", usuarioSchema);
