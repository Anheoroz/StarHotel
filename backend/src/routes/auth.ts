import { Router } from "express";
import {
  COOKIE,
  authLimit,
  checkPassword,
  cookieOptions,
  createSession,
  digest,
  hashPassword,
  requireAuth,
  tokenFrom,
} from "../auth";
import { endpoint, HttpError, texto } from "../http";
import { Sesion, Usuario } from "../models/usuario";

export const authRouter = Router();
function credentials(body: Record<string, unknown>) {
  const correo = texto(body.correo, "Correo", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
    throw new HttpError(400, "Ingresa un correo válido.");
  if (
    typeof body.contrasena !== "string" ||
    body.contrasena.length < 8 ||
    body.contrasena.length > 128
  )
    throw new HttpError(
      400,
      "La contraseña debe tener entre 8 y 128 caracteres.",
    );
  return { correo, contrasena: body.contrasena };
}

authRouter.post(
  "/registro",
  authLimit,
  endpoint(async (req, res) => {
    const { correo, contrasena } = credentials(req.body);
    const nombre = texto(req.body.nombre, "Nombre", 100);
    if (await Usuario.exists({ correo }))
      throw new HttpError(409, "Ya existe una cuenta con ese correo.");
    // El registro público nunca permite elegir un rol de personal.
    const user = await Usuario.create({
      nombre,
      correo,
      contrasenaHash: await hashPassword(contrasena),
      rol: "cliente",
    });
    await createSession(user._id, res);
    res
      .status(201)
      .json({ id: String(user._id), nombre, correo, rol: user.rol });
  }),
);

authRouter.post(
  "/login",
  authLimit,
  endpoint(async (req, res) => {
    const { correo, contrasena } = credentials(req.body);
    const user = await Usuario.findOne({ correo }).select("+contrasenaHash");
    if (!user || !(await checkPassword(contrasena, user.contrasenaHash)))
      throw new HttpError(401, "Correo o contraseña incorrectos.");
    // Revoca la sesión de este navegador antes de emitir una nueva.
    if (tokenFrom(req))
      await Sesion.deleteOne({ tokenHash: digest(tokenFrom(req)) });
    await createSession(user._id, res);
    res.json({
      id: String(user._id),
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
    });
  }),
);

authRouter.get("/me", requireAuth, (req, res) => res.json(req.cuenta));
authRouter.post(
  "/logout",
  endpoint(async (req, res) => {
    if (tokenFrom(req))
      await Sesion.deleteOne({ tokenHash: digest(tokenFrom(req)) });
    res.clearCookie(COOKIE, cookieOptions);
    res.json({ ok: true });
  }),
);
