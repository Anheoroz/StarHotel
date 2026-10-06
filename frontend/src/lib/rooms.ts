export const AMENITY_IDS = [
  "wifi",
  "aire",
  "desayuno",
  "tina",
  "ducha",
  "tv",
  "balcon",
  "cocina",
  "escritorio",
  "minibar",
] as const;

export type AmenityId = (typeof AMENITY_IDS)[number];

export const ROOM_TYPES = ["Sencilla", "Doble", "Suite"] as const;

export type RoomType = (typeof ROOM_TYPES)[number];

export type Room = {
  id: string;
  nombre: string;
  tipo: RoomType;
  adultos: number;
  ninos: number;
  precio: number;
  amenidades: AmenityId[];
  fotos: string[];
  descripcion: string;
};

export const AMENITY_LABELS: Record<AmenityId, string> = {
  wifi: "Wi-Fi",
  aire: "Aire acondicionado",
  desayuno: "Desayuno incluido",
  tina: "Tina",
  ducha: "Agua caliente",
  tv: "TV",
  balcon: "Balcón",
  cocina: "Cocina",
  escritorio: "Escritorio",
  minibar: "Minibar",
};

export const FILTER_AMENITIES: AmenityId[] = [
  "wifi",
  "aire",
  "desayuno",
  "tina",
  "ducha",
];

export type RoomFilters = {
  checkIn: string;
  checkOut: string;
  guests: string;
  types: RoomType[];
  minPrice: string;
  maxPrice: string;
  amenities: AmenityId[];
};

export const emptyFilters: RoomFilters = {
  checkIn: "",
  checkOut: "",
  guests: "",
  types: [],
  minPrice: "",
  maxPrice: "",
  amenities: [],
};

export function capacityLabel(adultos: number, ninos: number): string {
  const adults = `${adultos} ${adultos === 1 ? "adulto" : "adultos"}`;
  if (ninos === 0) {
    return adults;
  }
  const children = `${ninos} ${ninos === 1 ? "niño" : "niños"}`;
  return `${adults} · ${children}`;
}

export function formatPrice(precio: number): string {
  return `Q${precio}`;
}

export function filterRooms(source: Room[], filters: RoomFilters): Room[] {
  const guests = Number(filters.guests);
  const minPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
  const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);

  return source.filter((room) => {
    if (filters.types.length > 0 && !filters.types.includes(room.tipo)) {
      return false;
    }
    if (Number.isFinite(guests) && guests > 0 && room.adultos + room.ninos < guests) {
      return false;
    }
    if (minPrice !== null && Number.isFinite(minPrice) && room.precio < minPrice) {
      return false;
    }
    if (maxPrice !== null && Number.isFinite(maxPrice) && room.precio > maxPrice) {
      return false;
    }
    return filters.amenities.every((amenity) => room.amenidades.includes(amenity));
  });
}
