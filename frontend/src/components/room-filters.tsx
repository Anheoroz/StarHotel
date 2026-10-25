"use client";

import {
  ROOM_TYPES,
  type AmenityId,
  type RoomFilters,
  type RoomType,
} from "@/lib/rooms";
import type { Amenity } from "@/lib/amenities";
import { fechaGuatemala, limiteReservas, sumarDias } from "@/lib/reservas";

type RoomFiltersFormProps = {
  value: RoomFilters;
  onChange: (filters: RoomFilters) => void;
  onApply: () => void;
  amenities: Amenity[];
  busy?: boolean;
};

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function RoomFiltersForm({
  value,
  onChange,
  onApply,
  amenities,
  busy = false,
}: RoomFiltersFormProps) {
  const hoy = fechaGuatemala();
  function toggleType(tipo: RoomType) {
    onChange({ ...value, types: toggleValue(value.types, tipo) });
  }

  function toggleAmenity(amenity: AmenityId) {
    onChange({ ...value, amenities: toggleValue(value.amenities, amenity) });
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <h2 className="text-lg font-bold">Buscar habitaciones</h2>
      <div className="mt-4 grid gap-4">
        <label className="grid gap-1 text-sm">
          Fecha de inicio
          <input
            type="date"
            min={hoy}
            max={limiteReservas(hoy)}
            value={value.checkIn}
            onChange={(event) =>
              onChange({
                ...value,
                checkIn: event.target.value,
                checkOut:
                  value.checkOut && event.target.value >= value.checkOut
                    ? ""
                    : value.checkOut,
              })
            }
            className="h-11 w-full rounded-md border border-zinc-200 bg-background px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Fecha de salida
          <input
            type="date"
            min={
              value.checkIn ? sumarDias(value.checkIn, 1) : sumarDias(hoy, 1)
            }
            value={value.checkOut}
            onChange={(event) =>
              onChange({ ...value, checkOut: event.target.value })
            }
            className="h-11 w-full rounded-md border border-zinc-200 bg-background px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Huéspedes
          <input
            type="number"
            min={1}
            value={value.guests}
            onChange={(event) =>
              onChange({ ...value, guests: event.target.value })
            }
            className="h-11 w-full rounded-md border border-zinc-200 bg-background px-3 py-2"
          />
        </label>
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium">Tipo de habitación</legend>
        <div className="mt-3 grid gap-3 text-[15px]">
          {ROOM_TYPES.map((tipo) => (
            <label key={tipo} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value.types.includes(tipo)}
                onChange={() => toggleType(tipo)}
              />
              {tipo}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium">Precio por noche</legend>
        <div className="mt-2 grid gap-3">
          <label className="grid gap-1 text-sm">
            Mínimo:
            <input
              type="number"
              min={0}
              value={value.minPrice}
              onChange={(event) =>
                onChange({ ...value, minPrice: event.target.value })
              }
              className="h-11 w-full rounded-md border border-zinc-200 bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Máximo:
            <input
              type="number"
              min={0}
              value={value.maxPrice}
              onChange={(event) =>
                onChange({ ...value, maxPrice: event.target.value })
              }
              className="h-11 w-full rounded-md border border-zinc-200 bg-background px-3 py-2"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium">Amenidades</legend>
        <div className="mt-3 grid gap-3 text-[15px]">
          {amenities.map((amenity) => (
            <label
              key={amenity.codigo}
              title={amenity.descripcion}
              className="flex items-center gap-2"
            >
              <input
                type="checkbox"
                checked={value.amenities.includes(amenity.codigo)}
                onChange={() => toggleAmenity(amenity.codigo)}
              />
              {amenity.nombre}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={busy}
        className="mt-5 w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white"
      >
        {busy ? "Consultando…" : "Aplicar filtros"}
      </button>
    </form>
  );
}
