import type { TipoHabitacion } from "../models/habitacion";

export type AmenidadSemilla = {
  codigo: string;
  nombre: string;
};

export type HabitacionSemilla = {
  codigo: string;
  nombre: string;
  tipo: TipoHabitacion;
  capacidad: { adultos: number; ninos: number };
  precioPorNoche: number;
  moneda: "GTQ";
  amenidades: string[];
  fotos: string[];
  descripcion: string;
  orden: number;
};

export const amenidadesSemilla: AmenidadSemilla[] = [
  { codigo: "wifi", nombre: "Wi-Fi" },
  { codigo: "aire", nombre: "Aire acondicionado" },
  { codigo: "desayuno", nombre: "Desayuno incluido" },
  { codigo: "tina", nombre: "Tina" },
  { codigo: "ducha", nombre: "Agua caliente" },
  { codigo: "tv", nombre: "TV" },
  { codigo: "balcon", nombre: "Balcón" },
  { codigo: "cocina", nombre: "Cocina" },
  { codigo: "escritorio", nombre: "Escritorio" },
  { codigo: "minibar", nombre: "Minibar" },
];

const FOTO = {
  sencilla: "/rooms/sencilla.jpg",
  doble: "/rooms/doble.jpg",
  suite: "/rooms/suite.jpg",
  ejecutiva: "/rooms/ejecutiva.jpg",
  deluxe: "/rooms/deluxe.jpg",
  mar: "/rooms/mar.jpg",
} as const;

const TODAS_LAS_FOTOS = Object.values(FOTO);

function galeria(principal: string, cantidad: number): string[] {
  return [principal, ...TODAS_LAS_FOTOS.filter((foto) => foto !== principal)].slice(0, cantidad);
}

export const habitacionesSemilla: HabitacionSemilla[] = [
  {
    codigo: "sencilla",
    nombre: "Habitación Sencilla",
    tipo: "Sencilla",
    capacidad: { adultos: 1, ninos: 1 },
    precioPorNoche: 85,
    moneda: "GTQ",
    amenidades: ["wifi", "aire", "desayuno", "tina", "ducha"],
    fotos: galeria(FOTO.sencilla, 4),
    descripcion:
      "Un refugio íntimo con cama individual premium, ropa de cama de algodón egipcio y luz natural durante toda la mañana.",
    orden: 1,
  },
  {
    codigo: "doble",
    nombre: "Habitación Doble",
    tipo: "Doble",
    capacidad: { adultos: 2, ninos: 2 },
    precioPorNoche: 130,
    moneda: "GTQ",
    amenidades: ["wifi", "tv", "balcon", "aire", "desayuno"],
    fotos: galeria(FOTO.doble, 3),
    descripcion:
      "Dos camas amplias, zona de estar y balcón privado. Pensada para familias pequeñas o viajes compartidos.",
    orden: 2,
  },
  {
    codigo: "suite-familiar",
    nombre: "Suite Familiar",
    tipo: "Suite",
    capacidad: { adultos: 4, ninos: 3 },
    precioPorNoche: 260,
    moneda: "GTQ",
    amenidades: ["wifi", "cocina", "tina", "aire", "desayuno"],
    fotos: galeria(FOTO.suite, 5),
    descripcion:
      "Sala independiente, cocineta equipada y dormitorio principal con baño en mármol. La opción más espaciosa del hotel.",
    orden: 3,
  },
  {
    codigo: "ejecutiva",
    nombre: "Habitación Ejecutiva",
    tipo: "Sencilla",
    capacidad: { adultos: 1, ninos: 0 },
    precioPorNoche: 150,
    moneda: "GTQ",
    amenidades: ["wifi", "escritorio", "minibar", "aire", "desayuno"],
    fotos: galeria(FOTO.ejecutiva, 3),
    descripcion:
      "Escritorio ergonómico, iluminación de trabajo y minibar seleccionado. Ideal para estancias de negocios.",
    orden: 4,
  },
  {
    codigo: "sencilla-deluxe",
    nombre: "Habitación Sencilla Deluxe",
    tipo: "Sencilla",
    capacidad: { adultos: 1, ninos: 1 },
    precioPorNoche: 110,
    moneda: "GTQ",
    amenidades: ["wifi", "aire", "desayuno", "tina", "ducha"],
    fotos: galeria(FOTO.deluxe, 4),
    descripcion:
      "Versión ampliada de nuestra habitación sencilla, con baño en mármol, tina exenta y detalles en latón.",
    orden: 5,
  },
  {
    codigo: "doble-vista-al-mar",
    nombre: "Habitación Doble Vista al Mar",
    tipo: "Doble",
    capacidad: { adultos: 2, ninos: 2 },
    precioPorNoche: 195,
    moneda: "GTQ",
    amenidades: ["wifi", "tv", "balcon", "aire", "desayuno"],
    fotos: galeria(FOTO.mar, 3),
    descripcion:
      "Ventanales de piso a techo frente al océano y terraza privada para desayunar con el sonido de las olas.",
    orden: 6,
  },
];
