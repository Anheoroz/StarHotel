import { Router } from "express";
import { requireAuth, requireRoles } from "../auth";
import { endpoint, HttpError, numero, texto } from "../http";
import { Amenidad } from "../models/amenidad";
import { Habitacion, TIPOS_HABITACION } from "../models/habitacion";
import { ESTADOS, Unidad } from "../models/unidad";
import { ROLES, Sesion, Usuario } from "../models/usuario";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRoles("administrador"));

async function datosCatalogo(body: Record<string, unknown>) {
  const nombre = texto(body.nombre, "Nombre", 120);
  if (
    !TIPOS_HABITACION.includes(body.tipo as (typeof TIPOS_HABITACION)[number])
  )
    throw new HttpError(400, "Tipo de habitación inválido.");
  if (
    !Array.isArray(body.fotos) ||
    body.fotos.length < 1 ||
    body.fotos.length > 10 ||
    body.fotos.some(
      (f) =>
        typeof f !== "string" ||
        f.length > 2000 ||
        !(/^\/rooms\/[a-zA-Z0-9._-]+$/.test(f) || /^https?:\/\//.test(f)),
    )
  )
    throw new HttpError(
      400,
      "Agrega de 1 a 10 fotos: rutas /rooms/ o enlaces http/https.",
    );
  if (
    !Array.isArray(body.amenidades) ||
    body.amenidades.some((a) => typeof a !== "string")
  )
    throw new HttpError(400, "Selecciona amenidades válidas.");
  const codes = await Amenidad.distinct("codigo", { activa: { $ne: false } });
  if (body.amenidades.some((a) => !codes.includes(a)))
    throw new HttpError(
      400,
      "Una amenidad no existe o fue eliminada del catálogo.",
    );
  return {
    nombre,
    tipo: body.tipo,
    capacidad: {
      adultos: numero(body.adultos, "Adultos", 1, true),
      ninos: numero(body.ninos, "Niños", 0, true),
    },
    precioPorNoche: numero(body.precio, "Precio"),
    descripcion: texto(body.descripcion, "Descripción", 5000),
    fotos: body.fotos,
    amenidades: [...new Set(body.amenidades)],
  };
}

async function limpiarAmenidades(codigo: string) {
  // Retira solo códigos eliminados. Una lista antigua de activos podría borrar
  // una amenidad válida creada y asignada por otro administrador entre consultas.
  const inactivas = await Amenidad.distinct("codigo", { activa: false });
  if (inactivas.length)
    await Habitacion.updateOne(
      { codigo },
      { $pull: { amenidades: { $in: inactivas } } },
    );
  return Habitacion.findOne({ codigo }).lean();
}

adminRouter.get(
  "/catalogo",
  endpoint(async (_req, res) => {
    const [habitaciones, activas] = await Promise.all([
      Habitacion.find().sort({ orden: 1 }).lean(),
      Amenidad.distinct("codigo", { activa: { $ne: false } }),
    ]);
    res.json(
      habitaciones.map((habitacion) => ({
        ...habitacion,
        amenidades: habitacion.amenidades.filter((codigo) =>
          activas.includes(codigo),
        ),
      })),
    );
  }),
);
adminRouter.post(
  "/catalogo",
  endpoint(async (req, res) => {
    const codigo = texto(req.body.codigo, "Código", 80);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(codigo))
      throw new HttpError(
        400,
        "El código solo admite letras minúsculas, números y guiones.",
      );
    const datos = await datosCatalogo(req.body);
    const last = await Habitacion.findOne().sort({ orden: -1 });
    await Habitacion.create({
      ...datos,
      codigo,
      moneda: "GTQ",
      orden: (last?.orden ?? 0) + 1,
      activa: true,
    });
    res.status(201).json(await limpiarAmenidades(codigo));
  }),
);
adminRouter.patch(
  "/catalogo/:codigo",
  endpoint(async (req, res) => {
    const room = await Habitacion.findOne({ codigo: req.params.codigo });
    if (!room) throw new HttpError(404, "Habitación no encontrada.");
    if (
      Object.keys(req.body).length === 1 &&
      typeof req.body.activa === "boolean"
    )
      room.activa = req.body.activa;
    else room.set(await datosCatalogo(req.body));
    await room.save();
    res.json(await limpiarAmenidades(room.codigo));
  }),
);

export async function inventario() {
  const [units, catalogs] = await Promise.all([
    Unidad.find().sort({ numero: 1 }).lean(),
    Habitacion.find().lean(),
  ]);
  return units.map((unit) => {
    const catalog = catalogs.find((c) => c.codigo === unit.catalogo);
    return {
      ...unit,
      nombre: catalog?.nombre ?? unit.catalogo,
      tipo: catalog?.tipo,
      catalogoActivo: catalog?.activa !== false,
      disponible:
        unit.activa &&
        catalog?.activa !== false &&
        unit.estado === "disponible",
    };
  });
}

adminRouter.get(
  "/inventario",
  endpoint(async (_req, res) => res.json(await inventario())),
);
async function datosUnidad(body: Record<string, unknown>) {
  const numeroCuarto = texto(body.numero, "Número de habitación", 20);
  const catalogo = texto(body.catalogo, "Modelo de catálogo", 80);
  if (!(await Habitacion.exists({ codigo: catalogo })))
    throw new HttpError(400, "El modelo de catálogo no existe.");
  if (!ESTADOS.includes(body.estado as (typeof ESTADOS)[number]))
    throw new HttpError(400, "Estado inválido.");
  if (typeof body.activa !== "boolean")
    throw new HttpError(400, "Indica si la habitación está habilitada.");
  return {
    numero: numeroCuarto,
    catalogo,
    estado: body.estado,
    activa: body.activa,
  };
}
adminRouter.post(
  "/inventario",
  endpoint(async (req, res) =>
    res.status(201).json(await Unidad.create(await datosUnidad(req.body))),
  ),
);
adminRouter.patch(
  "/inventario/:id",
  endpoint(async (req, res) => {
    const data = await datosUnidad(req.body);
    const unit = await Unidad.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!unit) throw new HttpError(404, "Habitación física no encontrada.");
    res.json(unit);
  }),
);
adminRouter.get(
  "/usuarios",
  endpoint(async (_req, res) =>
    res.json(
      await Usuario.find().sort({ nombre: 1 }).select("nombre correo rol"),
    ),
  ),
);
adminRouter.patch(
  "/usuarios/:id/rol",
  endpoint(async (req, res) => {
    if (!ROLES.includes(req.body.rol))
      throw new HttpError(400, "Rol inválido.");
    if (req.params.id === req.cuenta?.id)
      throw new HttpError(400, "No puedes cambiar tu propio rol.");
    const user = await Usuario.findById(req.params.id);
    if (!user) throw new HttpError(404, "Usuario no encontrado.");
    user.rol = req.body.rol;
    await user.save();
    await Sesion.deleteMany({ usuario: user._id });
    res.json({
      id: String(user._id),
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol,
    });
  }),
);
