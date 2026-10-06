import { Router } from "express";
import { amenidadesSemilla } from "../data/catalogo";
import {
  Habitacion,
  TIPOS_HABITACION,
  toHabitacionRespuesta,
  type HabitacionDocumento,
  type TipoHabitacion,
} from "../models/habitacion";

export const habitacionesRouter = Router();

const codigosAmenidad = new Set(amenidadesSemilla.map((amenidad) => amenidad.codigo));

function lista(valor: unknown): string[] {
  if (typeof valor !== "string" || valor.trim() === "") {
    return [];
  }
  return valor
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function numero(valor: unknown): number | undefined {
  if (typeof valor !== "string" || valor.trim() === "") {
    return undefined;
  }
  const parsed = Number(valor);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

habitacionesRouter.get("/", async (req, res, next) => {
  try {
    const tipos = lista(req.query.tipo);
    const tiposInvalidos = tipos.filter(
      (tipo) => !TIPOS_HABITACION.includes(tipo as TipoHabitacion),
    );
    if (tiposInvalidos.length > 0) {
      res.status(400).json({ error: "Tipo de habitación no válido." });
      return;
    }

    const amenidades = lista(req.query.amenidades);
    const amenidadesInvalidas = amenidades.filter((codigo) => !codigosAmenidad.has(codigo));
    if (amenidadesInvalidas.length > 0) {
      res.status(400).json({ error: "Amenidad no válida." });
      return;
    }

    const huespedes = numero(req.query.huespedes);
    const precioMin = numero(req.query.precioMin);
    const precioMax = numero(req.query.precioMax);
    if (
      Number.isNaN(huespedes) ||
      Number.isNaN(precioMin) ||
      Number.isNaN(precioMax)
    ) {
      res.status(400).json({ error: "Los filtros numéricos deben ser números." });
      return;
    }

    const filtro: Record<string, unknown> = {};
    if (tipos.length > 0) {
      filtro.tipo = { $in: tipos };
    }
    if (amenidades.length > 0) {
      filtro.amenidades = { $all: amenidades };
    }
    if (precioMin !== undefined || precioMax !== undefined) {
      const precio: { $gte?: number; $lte?: number } = {};
      if (precioMin !== undefined) {
        precio.$gte = precioMin;
      }
      if (precioMax !== undefined) {
        precio.$lte = precioMax;
      }
      filtro.precioPorNoche = precio;
    }

    const documentos = await Habitacion.find(filtro).sort({ orden: 1 }).lean<HabitacionDocumento[]>();
    const habitaciones = documentos
      .filter((doc) => {
        if (huespedes === undefined) {
          return true;
        }
        return doc.capacidad.adultos + doc.capacidad.ninos >= huespedes;
      })
      .map(toHabitacionRespuesta);

    res.json(habitaciones);
  } catch (error) {
    next(error);
  }
});

habitacionesRouter.get("/:codigo", async (req, res, next) => {
  try {
    const documento = await Habitacion.findOne({ codigo: req.params.codigo }).lean<HabitacionDocumento | null>();
    if (!documento) {
      res.status(404).json({ error: "Habitación no encontrada." });
      return;
    }
    res.json(toHabitacionRespuesta(documento));
  } catch (error) {
    next(error);
  }
});
