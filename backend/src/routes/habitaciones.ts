import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { leerSesion, requireAuth, requireRole } from "../auth";
import { amenidadesSemilla } from "../data/catalogo";
import {
  Habitacion,
  TIPOS_HABITACION,
  toHabitacionRespuesta,
  type HabitacionDocumento,
  type TipoHabitacion,
} from "../models/habitacion";
import { ROLES_PERSONAL } from "../models/usuario";

export const habitacionesRouter = Router();

const codigosAmenidad = new Set(amenidadesSemilla.map((amenidad) => amenidad.codigo));
const uploadsDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const subirFoto = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadsDir),
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${extension}`);
    },
  }),
  limits: { fileSize: 2_000_000 },
  fileFilter: (_req, file, callback) => {
    callback(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype));
  },
});

function esPersonal(rol: string | undefined): boolean {
  return ROLES_PERSONAL.includes(rol as (typeof ROLES_PERSONAL)[number]);
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
    const amenidadesInvalidas = amenidades.filter((codigo) => !codigosAmenidad.has(codigo));
    if (amenidadesInvalidas.length > 0) {
      res.status(400).json({ error: "Amenidad no válida." });
      return;
    }

    const huespedes = numero(req.query.huespedes);
    const precioMin = numero(req.query.precioMin);
    const precioMax = numero(req.query.precioMax);
    if (Number.isNaN(huespedes) || Number.isNaN(precioMin) || Number.isNaN(precioMax)) {
      res.status(400).json({ error: "Los filtros numéricos deben ser números." });
      return;
    }

    const filtro: Record<string, unknown> = {};
    const incluirInactivas = req.query.incluirInactivas === "true";
    if (incluirInactivas) {
      const sesion = leerSesion(req);
      if (!esPersonal(sesion?.rol)) {
        res.status(403).json({ error: "No tienes permiso para ver habitaciones inactivas." });
        return;
      }
    } else {
      filtro.activa = { $ne: false };
    }
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
    if (!documento || (documento.activa === false && !esPersonal(leerSesion(req)?.rol))) {
      res.status(404).json({ error: "Habitación no encontrada." });
      return;
    }
    res.json(toHabitacionRespuesta(documento));
  } catch (error) {
    next(error);
  }
});

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function esTipo(valor: string): valor is TipoHabitacion {
  return TIPOS_HABITACION.includes(valor as TipoHabitacion);
}

habitacionesRouter.post("/", requireAuth, requireRole("administrador"), async (req, res, next) => {
  try {
    const codigo = texto(req.body?.codigo);
    const nombre = texto(req.body?.nombre);
    const tipo = texto(req.body?.tipo);
    if (!codigo || !nombre || !tipo) {
      res.status(400).json({ error: "Código, nombre y tipo son obligatorios." });
      return;
    }
    if (!esTipo(tipo)) {
      res.status(400).json({ error: "Tipo de habitación no válido." });
      return;
    }
    const existente = await Habitacion.findOne({ codigo });
    if (existente) {
      res.status(409).json({ error: "Ya existe una habitación con ese código." });
      return;
    }
    const ultima = await Habitacion.findOne().sort({ orden: -1 }).lean<HabitacionDocumento | null>();
    const documento = await Habitacion.create({
      codigo,
      nombre,
      tipo,
      capacidad: { adultos: 1, ninos: 0 },
      precioPorNoche: 0,
      moneda: "GTQ",
      amenidades: [],
      fotos: [],
      descripcion: "Sin descripción.",
      orden: (ultima?.orden ?? 0) + 1,
      activa: req.body?.activa !== false,
    });
    res.status(201).json(toHabitacionRespuesta(documento.toObject() as HabitacionDocumento));
  } catch (error) {
    next(error);
  }
});

habitacionesRouter.patch("/:codigo", requireAuth, requireRole("administrador"), async (req, res, next) => {
  try {
    const cambios: Record<string, unknown> = {};
    const nombre = texto(req.body?.nombre);
    const tipo = texto(req.body?.tipo);
    if (req.body?.nombre !== undefined) {
      if (!nombre) {
        res.status(400).json({ error: "El nombre es obligatorio." });
        return;
      }
      cambios.nombre = nombre;
    }
    if (req.body?.tipo !== undefined) {
      if (!esTipo(tipo)) {
        res.status(400).json({ error: "Tipo de habitación no válido." });
        return;
      }
      cambios.tipo = tipo;
    }
    if (req.body?.descripcion !== undefined) {
      cambios.descripcion = typeof req.body.descripcion === "string" ? req.body.descripcion.trim() : "";
    }
    if (req.body?.precio !== undefined) {
      const precio = Number(req.body.precio);
      if (!Number.isFinite(precio) || precio < 0) {
        res.status(400).json({ error: "El precio debe ser un número mayor o igual a cero." });
        return;
      }
      cambios.precioPorNoche = precio;
    }
    if (req.body?.activa !== undefined) {
      if (typeof req.body.activa !== "boolean") {
        res.status(400).json({ error: "El estado debe ser verdadero o falso." });
        return;
      }
      cambios.activa = req.body.activa;
    }
    const documento = await Habitacion.findOneAndUpdate(
      { codigo: req.params.codigo },
      cambios,
      { new: true },
    ).lean<HabitacionDocumento | null>();
    if (!documento) {
      res.status(404).json({ error: "Habitación no encontrada." });
      return;
    }
    res.json(toHabitacionRespuesta(documento));
  } catch (error) {
    next(error);
  }
});

habitacionesRouter.post(
  "/:codigo/fotos",
  requireAuth,
  requireRole("administrador"),
  subirFoto.single("foto"),
  async (req, res, next) => {
    try {
      const documento = await Habitacion.findOne({ codigo: req.params.codigo });
      if (!documento) {
        res.status(404).json({ error: "Habitación no encontrada." });
        return;
      }
      const urlExterna = texto(req.body?.url);
      const archivo = req.file;
      if (!urlExterna && !archivo) {
        res.status(400).json({ error: "Indica una imagen o una dirección." });
        return;
      }
      const foto = archivo ? `${req.protocol}://${req.get("host")}/uploads/${archivo.filename}` : urlExterna;
      documento.fotos.push(foto);
      await documento.save();
      res.status(201).json(toHabitacionRespuesta(documento.toObject() as HabitacionDocumento));
    } catch (error) {
      next(error);
    }
  },
);

habitacionesRouter.delete("/:codigo/fotos", requireAuth, requireRole("administrador"), async (req, res, next) => {
  try {
    const url = texto(req.body?.url);
    if (!url) {
      res.status(400).json({ error: "Indica la fotografía que quieres quitar." });
      return;
    }
    const documento = await Habitacion.findOne({ codigo: req.params.codigo });
    if (!documento) {
      res.status(404).json({ error: "Habitación no encontrada." });
      return;
    }
    documento.fotos = documento.fotos.filter((foto) => foto !== url);
    await documento.save();
    res.json(toHabitacionRespuesta(documento.toObject() as HabitacionDocumento));
  } catch (error) {
    next(error);
  }
});
