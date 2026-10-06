import { Router } from "express";
import { Amenidad } from "../models/amenidad";

export const amenidadesRouter = Router();

amenidadesRouter.get("/", async (_req, res, next) => {
  try {
    const amenidades = await Amenidad.find().sort({ nombre: 1 }).select("-_id codigo nombre");
    res.json(amenidades);
  } catch (error) {
    next(error);
  }
});
