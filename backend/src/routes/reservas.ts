import { Router } from "express";
import { requireAuth, requireRoles } from "../auth";
import { endpoint } from "../http";
import { Reserva } from "../models/reserva";
import {
  buscarReservaPropia,
  consultarDisponibilidad,
  crearReserva,
  liberarApartadosVencidos,
  pagarReserva,
  reservaRespuesta,
} from "../reservas";

export const disponibilidadRouter = Router();
disponibilidadRouter.get("/", endpoint(async (req, res) =>
  res.json(await consultarDisponibilidad(req.query.ingreso, req.query.salida)),
));

export const reservasRouter = Router();
reservasRouter.use(requireAuth, requireRoles("cliente"));
reservasRouter.get("/", endpoint(async (req, res) => {
  await liberarApartadosVencidos();
  const reservas = await Reserva.find({ usuario: req.cuenta!.id }).sort({ createdAt: -1 });
  return res.json(reservas.map(reservaRespuesta));
}));
reservasRouter.post("/", endpoint(async (req, res) =>
  res.status(201).json(await crearReserva(req.cuenta!.id, req.body)),
));
reservasRouter.get("/:id", endpoint(async (req, res) =>
  res.json(reservaRespuesta(await buscarReservaPropia(req.params.id, req.cuenta!.id))),
));
reservasRouter.post("/:id/pago", endpoint(async (req, res) =>
  res.json(await pagarReserva(req.params.id, req.cuenta!.id, req.body)),
));
