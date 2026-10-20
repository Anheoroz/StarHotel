import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Rol } from "./models/usuario";

export type Sesion = {
  sub: string;
  nombre: string;
  correo: string;
  rol: Rol;
};

type RequestConSesion = Request & { usuario?: Sesion };

function secreto(): string {
  const valor = process.env.JWT_SECRET;
  if (!valor) {
    throw new Error("Falta JWT_SECRET.");
  }
  return valor;
}

export function firmarSesion(sesion: Sesion): string {
  return jwt.sign(sesion, secreto(), { expiresIn: "12h" });
}

export function leerSesion(req: Request): Sesion | undefined {
  const encabezado = req.headers.authorization;
  if (!encabezado?.startsWith("Bearer ")) {
    return undefined;
  }
  try {
    return jwt.verify(encabezado.slice("Bearer ".length), secreto()) as Sesion;
  } catch {
    return undefined;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const sesion = leerSesion(req);
  if (!sesion) {
    res.status(401).json({ error: "Debes iniciar sesión." });
    return;
  }
  (req as RequestConSesion).usuario = sesion;
  next();
}

export function requireRole(...roles: Rol[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const sesion = (req as RequestConSesion).usuario;
    if (!sesion || !roles.includes(sesion.rol)) {
      res.status(403).json({ error: "No tienes permiso para esta acción." });
      return;
    }
    next();
  };
}
