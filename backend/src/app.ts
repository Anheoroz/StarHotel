import "./env";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { requireAuth, requireRoles } from "./auth";
import { endpoint, HttpError } from "./http";
import { adminRouter, inventario } from "./routes/admin";
import { authRouter } from "./routes/auth";
import { amenidadesRouter } from "./routes/amenidades";
import { habitacionesRouter } from "./routes/habitaciones";
import { disponibilidadRouter, reservasRouter } from "./routes/reservas";

export const app = express();
app.disable("x-powered-by");
if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
const origin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
app.use(cors({ origin, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {
  req.body ??= {};
  res.setHeader("Cache-Control", "no-store");
  if (
    !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
    req.headers.origin &&
    req.headers.origin !== origin
  )
    return next(new HttpError(403, "Origen de solicitud no permitido."));
  next();
});
app.get("/api/health", (_req, res) =>
  res.json({
    ok: true,
    servicio: "star-hotel-api",
    entorno: mongoose.connection.host?.endsWith(".mongodb.net")
      ? "atlas"
      : process.env.REQUIRE_LOCAL_DB === "true"
        ? "local"
        : "configurado",
    baseDeDatos: mongoose.connection.name,
  }),
);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.get(
  "/api/operacion",
  requireAuth,
  requireRoles("administrador", "recepcion", "mantenimiento"),
  endpoint(async (_req, res) => res.json(await inventario())),
);
app.use("/api/amenidades", amenidadesRouter);
app.use("/api/habitaciones", habitacionesRouter);
app.use("/api/disponibilidad", disponibilidadRouter);
app.use("/api/reservas", reservasRouter);
app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada." }));
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof HttpError)
      return res.status(error.status).json({ error: error.message });
    const err = error as { code?: number; name?: string; type?: string };
    if (err.code === 11000)
      return res.status(409).json({
        error: "Ese correo, código o número de habitación ya existe.",
      });
    if (
      err.name === "ValidationError" ||
      err.name === "CastError" ||
      err.type === "entity.parse.failed"
    )
      return res
        .status(400)
        .json({ error: "Los datos enviados no son válidos." });
    console.error("Error de API:", err.name ?? "Error");
    res.status(500).json({ error: "Error interno del servidor." });
  },
);
