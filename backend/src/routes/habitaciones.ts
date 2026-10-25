import { Router } from "express";
import { Unidad } from "../models/unidad";
import { Amenidad, type AmenidadDocumento } from "../models/amenidad";
import {
  Habitacion,
  TIPOS_HABITACION,
  toHabitacionRespuesta,
  type HabitacionDocumento,
  type TipoHabitacion,
} from "../models/habitacion";

export const habitacionesRouter = Router();

function respuesta(doc: HabitacionDocumento, amenidades: AmenidadDocumento[]) {
  const activas = doc.amenidades.flatMap((codigo) => {
    const amenidad = amenidades.find((a) => a.codigo === codigo);
    return amenidad
      ? [
          {
            codigo,
            nombre: amenidad.nombre,
            descripcion: amenidad.descripcion ?? "",
          },
        ]
      : [];
  });
  return {
    ...toHabitacionRespuesta(doc),
    amenidades: activas.map((a) => a.codigo),
    amenidadesDetalle: activas,
  };
}

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
    const catalogoAmenidades = await Amenidad.find({
      activa: { $ne: false },
    }).lean();
    const codigosAmenidad = new Set(catalogoAmenidades.map((a) => a.codigo));
    const amenidadesInvalidas = amenidades.filter(
      (codigo) => !codigosAmenidad.has(codigo),
    );
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
      res
        .status(400)
        .json({ error: "Los filtros numéricos deben ser números." });
      return;
    }

    const filtro: Record<string, unknown> = { activa: { $ne: false } };
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

    const documentos = await Habitacion.find(filtro)
      .sort({ orden: 1 })
      .lean<HabitacionDocumento[]>();
    const inventoryExists = await Unidad.exists({});
    const availableCodes = inventoryExists
      ? await Unidad.distinct("catalogo", {
          activa: true,
          estado: "disponible",
        })
      : null;
    const habitaciones = documentos
      .filter((doc) => !availableCodes || availableCodes.includes(doc.codigo))
      .filter((doc) => {
        if (huespedes === undefined) {
          return true;
        }
        return doc.capacidad.adultos + doc.capacidad.ninos >= huespedes;
      })
      .map((doc) => respuesta(doc, catalogoAmenidades));

    res.json(habitaciones);
  } catch (error) {
    next(error);
  }
});

habitacionesRouter.get("/:codigo", async (req, res, next) => {
  try {
    const documento = await Habitacion.findOne({
      codigo: req.params.codigo,
      activa: { $ne: false },
    }).lean<HabitacionDocumento | null>();
    if (!documento) {
      res.status(404).json({ error: "Habitación no encontrada." });
      return;
    }
    const amenidades = await Amenidad.find({ activa: { $ne: false } }).lean();
    res.json(respuesta(documento, amenidades));
  } catch (error) {
    next(error);
  }
});
