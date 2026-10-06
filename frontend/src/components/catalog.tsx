"use client";

import { useState } from "react";
import { SlidersIcon } from "@/components/icons";
import { RoomCard } from "@/components/room-card";
import { RoomFiltersForm } from "@/components/room-filters";
import { emptyFilters, filterRooms, type Room, type RoomFilters } from "@/lib/rooms";

export function Catalog({ rooms }: { rooms: Room[] }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<RoomFilters>(emptyFilters);
  const [applied, setApplied] = useState<RoomFilters>(emptyFilters);
  const visibleRooms = filterRooms(rooms, applied);

  return (
    <section id="habitaciones" className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">Habitaciones disponibles</h1>
      <button
        type="button"
        aria-expanded={filtersOpen}
        onClick={() => setFiltersOpen((open) => !open)}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white"
      >
        <SlidersIcon />
        {filtersOpen ? "Ocultar filtros" : "Mostrar Filtros"}
      </button>
      {filtersOpen ? (
        <RoomFiltersForm
          value={draft}
          onChange={setDraft}
          onApply={() => setApplied(draft)}
        />
      ) : null}
      {visibleRooms.length === 0 ? (
        <p className="mt-8 text-center text-zinc-500">
          No hay habitaciones que coincidan con los filtros.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {visibleRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </section>
  );
}
