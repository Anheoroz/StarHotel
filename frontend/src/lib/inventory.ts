export type Unidad = {
  _id: string;
  numero: string;
  catalogo: string;
  nombre: string;
  tipo: string;
  activa: boolean;
  estado: string;
  catalogoActivo: boolean;
  disponible: boolean;
};

export const ESTADO_LABELS: Record<string, string> = {
  disponible: "Disponible",
  ocupada: "Ocupada",
  "pendiente-limpieza": "Pendiente de limpieza",
  mantenimiento: "Mantenimiento",
};
