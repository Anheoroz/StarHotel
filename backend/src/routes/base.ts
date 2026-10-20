import { Router } from "express";
import { Amenidad, type AmenidadDocumento } from "../models/amenidad";
import { Habitacion, toHabitacionRespuesta, type HabitacionDocumento } from "../models/habitacion";
import { Usuario, toUsuarioPublico, type UsuarioDocumento } from "../models/usuario";

export const baseRouter = Router();

async function habitaciones() {
  const documentos = await Habitacion.find().sort({ orden: 1 }).lean<HabitacionDocumento[]>();
  return documentos.map(toHabitacionRespuesta);
}

async function amenidades() {
  return Amenidad.find().sort({ nombre: 1 }).select("codigo nombre").lean<AmenidadDocumento[]>();
}

async function usuarios() {
  const documentos = await Usuario.find().sort({ correo: 1 }).select("nombre correo rol").lean<UsuarioDocumento[]>();
  return documentos.map(toUsuarioPublico);
}

baseRouter.get("/", async (_req, res, next) => {
  try {
    const [habitacionesGuardadas, amenidadesGuardadas, usuariosGuardados] = await Promise.all([
      habitaciones(),
      amenidades(),
      usuarios(),
    ]);
    res.json({
      base: "starhotel",
      habitaciones: habitacionesGuardadas,
      amenidades: amenidadesGuardadas,
      usuarios: usuariosGuardados,
    });
  } catch (error) {
    next(error);
  }
});

baseRouter.get("/habitaciones", async (_req, res, next) => {
  try {
    res.json(await habitaciones());
  } catch (error) {
    next(error);
  }
});

baseRouter.get("/amenidades", async (_req, res, next) => {
  try {
    res.json(await amenidades());
  } catch (error) {
    next(error);
  }
});

baseRouter.get("/usuarios", async (_req, res, next) => {
  try {
    res.json(await usuarios());
  } catch (error) {
    next(error);
  }
});
