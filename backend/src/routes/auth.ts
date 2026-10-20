import { Router, type Request } from "express";
import bcrypt from "bcryptjs";
import { firmarSesion, requireAuth, requireRole } from "../auth";
import {
  ROLES_PERSONAL,
  Usuario,
  toUsuarioPublico,
  type Rol,
  type RolPersonal,
  type UsuarioDocumento,
} from "../models/usuario";

export const authRouter = Router();
export const usuariosRouter = Router();

const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function datosCuenta(body: unknown): { nombre: string; correo: string; contrasena: string } | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Los datos de la cuenta son obligatorios." };
  }
  const entrada = body as Record<string, unknown>;
  const nombre = typeof entrada.nombre === "string" ? entrada.nombre.trim() : "";
  const correo = typeof entrada.correo === "string" ? entrada.correo.trim().toLowerCase() : "";
  const contrasena = typeof entrada.contrasena === "string" ? entrada.contrasena : "";
  if (!nombre || !correo || !contrasena) {
    return { error: "Nombre, correo y contraseña son obligatorios." };
  }
  if (!correoValido.test(correo)) {
    return { error: "El correo no es válido." };
  }
  if (contrasena.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  return { nombre, correo, contrasena };
}

authRouter.post("/registro", async (req, res, next) => {
  try {
    const datos = datosCuenta(req.body);
    if ("error" in datos) {
      res.status(400).json({ error: datos.error });
      return;
    }
    const existente = await Usuario.findOne({ correo: datos.correo });
    if (existente) {
      res.status(409).json({ error: "Ya existe una cuenta con ese correo." });
      return;
    }
    const usuario = await Usuario.create({
      nombre: datos.nombre,
      correo: datos.correo,
      contrasenaHash: await bcrypt.hash(datos.contrasena, 10),
      rol: "huesped",
    });
    const publico = toUsuarioPublico(usuario as unknown as UsuarioDocumento);
    const token = firmarSesion({
      sub: publico.id,
      nombre: publico.nombre,
      correo: publico.correo,
      rol: publico.rol,
    });
    res.status(201).json({ token, usuario: publico });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/sesion", async (req, res, next) => {
  try {
    const correo = typeof req.body?.correo === "string" ? req.body.correo.trim().toLowerCase() : "";
    const contrasena = typeof req.body?.contrasena === "string" ? req.body.contrasena : "";
    if (!correo || !contrasena) {
      res.status(400).json({ error: "Correo y contraseña son obligatorios." });
      return;
    }
    const usuario = await Usuario.findOne({ correo }).lean<UsuarioDocumento | null>();
    const coincide = usuario ? await bcrypt.compare(contrasena, usuario.contrasenaHash) : false;
    if (!usuario || !coincide) {
      res.status(401).json({ error: "Correo o contraseña incorrectos." });
      return;
    }
    const publico = toUsuarioPublico(usuario);
    const token = firmarSesion({
      sub: publico.id,
      nombre: publico.nombre,
      correo: publico.correo,
      rol: publico.rol,
    });
    res.json({ token, usuario: publico });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/yo", requireAuth, (req, res) => {
  const sesion = (req as Request & { usuario?: { sub: string; nombre: string; correo: string; rol: string } }).usuario;
  res.json({
    usuario: {
      id: sesion?.sub,
      nombre: sesion?.nombre,
      correo: sesion?.correo,
      rol: sesion?.rol,
    },
  });
});

usuariosRouter.post("/", requireAuth, requireRole("administrador"), async (req, res, next) => {
  try {
    const datos = datosCuenta(req.body);
    if ("error" in datos) {
      res.status(400).json({ error: datos.error });
      return;
    }
    const rol = req.body?.rol;
    if (typeof rol !== "string" || !ROLES_PERSONAL.includes(rol as RolPersonal)) {
      res.status(400).json({ error: "El rol debe ser administrador, recepción o mantenimiento." });
      return;
    }
    const existente = await Usuario.findOne({ correo: datos.correo });
    if (existente) {
      res.status(409).json({ error: "Ya existe una cuenta con ese correo." });
      return;
    }
    const usuario = await Usuario.create({
      nombre: datos.nombre,
      correo: datos.correo,
      contrasenaHash: await bcrypt.hash(datos.contrasena, 10),
      rol: rol as Rol,
    });
    res.status(201).json({ usuario: toUsuarioPublico(usuario as unknown as UsuarioDocumento) });
  } catch (error) {
    next(error);
  }
});
