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
    const solicitado = texto(req.body.codigo, "Código", 80);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(solicitado))
      throw new HttpError(
        400,
        "El código solo admite letras minúsculas, números y guiones.",
      );
    const fields = datos(req.body);
    let codigo = solicitado;
    let anterior = await Amenidad.findOne({ codigo }).select("activa").lean();
    while (anterior) {
      if (anterior.activa !== false)
        throw new HttpError(409, "Ya existe una amenidad activa con ese código.");
      // Un código retirado no se reutiliza: una edición antigua podría conservar
      // esa relación. El servicio nuevo comienza sin habitaciones asignadas.
      // Derivarlo del registro retirado hace que dos solicitudes simultáneas o
      // repetidas elijan el mismo código y el índice único rechace duplicados.
      codigo = `${solicitado.slice(0, 55).replace(/-+$/, "")}-${anterior._id}`;
      anterior = await Amenidad.findOne({ codigo }).select("activa").lean();
    }
    const amenidad = await Amenidad.create({
      codigo,
      ...fields,
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
