import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import type { NextFunction, Request, Response } from "express";
import { Sesion, Usuario, type Rol } from "./models/usuario";
import { HttpError } from "./http";

const scrypt = promisify(scryptCallback);
export const COOKIE = "starhotel_session";
export const SESSION_MS = 8 * 60 * 60 * 1000;
export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export type Cuenta = { id: string; nombre: string; correo: string; rol: Rol };
declare global {
  namespace Express {
    interface Request {
      cuenta?: Cuenta;
    }
  }
}

export function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}

export async function checkPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [format, salt, hash] = stored.split(":");
  if (format !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return expected.length === key.length && timingSafeEqual(expected, key);
}

export function tokenFrom(req: Request): string {
  const entry = req.headers.cookie
    ?.split(";")
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${COOKIE}=`));
  return entry?.slice(COOKIE.length + 1) ?? "";
}

export async function createSession(userId: unknown, res: Response) {
  const token = randomBytes(32).toString("hex");
  await Sesion.create({
    usuario: userId,
    tokenHash: digest(token),
    expira: new Date(Date.now() + SESSION_MS),
  });
  res.cookie(COOKIE, token, { ...cookieOptions, maxAge: SESSION_MS });
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  (async () => {
    const token = tokenFrom(req);
    if (!token) throw new HttpError(401, "Inicia sesión para continuar.");
    const session = await Sesion.findOne({
      tokenHash: digest(token),
      expira: { $gt: new Date() },
    });
    const user = session ? await Usuario.findById(session.usuario) : null;
    if (!user)
      throw new HttpError(401, "La sesión venció. Inicia sesión nuevamente.");
    req.cuenta = {
      id: String(user._id),
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol as Rol,
    };
  })().then(() => next(), next);
}

export function requireRoles(...roles: Rol[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.cuenta || !roles.includes(req.cuenta.rol))
      return next(
        new HttpError(403, "No tienes permisos para realizar esta acción."),
      );
    next();
  };
}

// Límite por IP en operaciones de autenticación; se limpia para evitar crecimiento indefinido.
const attempts = new Map<string, { count: number; reset: number }>();
export function authLimit(req: Request, _res: Response, next: NextFunction) {
  const now = Date.now();
  for (const [key, value] of attempts)
    if (value.reset < now) attempts.delete(key);
  const key = req.ip ?? "local";
  const bucket = attempts.get(key) ?? { count: 0, reset: now + 15 * 60 * 1000 };
  bucket.count++;
  attempts.set(key, bucket);
  next(
    bucket.count > 40
      ? new HttpError(
          429,
          "Demasiados intentos. Intenta nuevamente en 15 minutos.",
        )
      : undefined,
  );
}
