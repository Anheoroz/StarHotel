import { Router } from "express";
import { requireAuth, requireRoles } from "../auth";
import { endpoint, HttpError, texto } from "../http";
import { Amenidad } from "../models/amenidad";
import { Habitacion } from "../models/habitacion";

export const amenidadesRouter = Router();

amenidadesRouter.get(
  "/",
  endpoint(async (_req, res) => {
    const amenidades = await Amenidad.find({ activa: { $ne: false } })
      .sort({ nombre: 1 })
      .lean();
    res.json(
      amenidades.map(({ codigo, nombre, descripcion }) => ({
        codigo,
        nombre,
        descripcion: descripcion ?? "",
      })),
    );
  }),
);

amenidadesRouter.use(requireAuth, requireRoles("administrador"));

function datos(body: Record<string, unknown>) {
  return {
    nombre: texto(body.nombre, "Nombre", 120),
    descripcion: texto(body.descripcion, "Descripción", 500),
  };
}

amenidadesRouter.post(
  "/",
  endpoint(async (req, res) => {
    const codigo = texto(req.body.codigo, "Código", 80);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(codigo))
      throw new HttpError(
        400,
        "El código solo admite letras minúsculas, números y guiones.",
      );
    const amenidad = await Amenidad.create({
      codigo,
      ...datos(req.body),
      activa: true,
    });
    res
      .status(201)
      .json({
        codigo: amenidad.codigo,
        nombre: amenidad.nombre,
        descripcion: amenidad.descripcion,
      });
  }),
);

amenidadesRouter.patch(
  "/:codigo",
  endpoint(async (req, res) => {
    if (req.body.codigo !== undefined && req.body.codigo !== req.params.codigo)
      throw new HttpError(
        400,
        "El código de una amenidad existente no se puede cambiar.",
      );
    const amenidad = await Amenidad.findOneAndUpdate(
      { codigo: req.params.codigo, activa: { $ne: false } },
      { $set: datos(req.body) },
      { new: true, runValidators: true },
    );
    if (!amenidad) throw new HttpError(404, "Amenidad no encontrada.");
    res.json({
      codigo: amenidad.codigo,
      nombre: amenidad.nombre,
      descripcion: amenidad.descripcion,
    });
  }),
);

amenidadesRouter.delete(
  "/:codigo",
  endpoint(async (req, res) => {
    const amenidad = await Amenidad.findOneAndUpdate(
      { codigo: req.params.codigo, activa: { $ne: false } },
      { $set: { activa: false } },
    );
    if (!amenidad) throw new HttpError(404, "Amenidad no encontrada.");
    // Conserva el registro de la amenidad y retira su asignación del catálogo.
    // Los listados también filtran inactivas si hay una edición simultánea.
    await Habitacion.updateMany(
      { amenidades: req.params.codigo },
      { $pull: { amenidades: req.params.codigo } },
    );
    res.json({ ok: true });
  }),
);
