"use client";

import {
  AMENITY_LABELS,
  FILTER_AMENITIES,
  ROOM_TYPES,
  type AmenityId,
  type RoomFilters,
  type RoomType,
} from "@/lib/rooms";

type RoomFiltersFormProps = {
  value: RoomFilters;
  onChange: (filters: RoomFilters) => void;
  onApply: () => void;
};

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function RoomFiltersForm({ value, onChange, onApply }: RoomFiltersFormProps) {
  function toggleType(tipo: RoomType) {
    onChange({ ...value, types: toggleValue(value.types, tipo) });
  }

  function toggleAmenity(amenity: AmenityId) {
    onChange({ ...value, amenities: toggleValue(value.amenities, amenity) });
  }

  return (
    <form
      className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <h2 className="text-lg font-semibold">Buscar habitaciones</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Fecha de inicio
          <input
            type="date"
            value={value.checkIn}
            onChange={(event) => onChange({ ...value, checkIn: event.target.value })}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Fecha de salida
          <input
            type="date"
            value={value.checkOut}
            onChange={(event) => onChange({ ...value, checkOut: event.target.value })}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm sm:col-span-2">
          Huéspedes
          <input
            type="number"
            min={1}
            value={value.guests}
            onChange={(event) => onChange({ ...value, guests: event.target.value })}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium">Tipo de habitación</legend>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
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
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Mínimo:
            <input
              type="number"
              min={0}
              value={value.minPrice}
              onChange={(event) => onChange({ ...value, minPrice: event.target.value })}
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Máximo:
            <input
              type="number"
              min={0}
              value={value.maxPrice}
              onChange={(event) => onChange({ ...value, maxPrice: event.target.value })}
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium">Amenidades</legend>
        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          {FILTER_AMENITIES.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
              />
              {AMENITY_LABELS[amenity]}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        className="mt-5 w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white"
      >
        Aplicar filtros
      </button>
    </form>
  );
}
