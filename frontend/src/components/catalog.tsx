"use client";

import { useRef, useState } from "react";
import { SlidersIcon } from "@/components/icons";
import { RoomCard } from "@/components/room-card";
import { RoomFiltersForm } from "@/components/room-filters";
import {
  emptyFilters,
  filterRooms,
  type Room,
  type RoomFilters,
} from "@/lib/rooms";

export function Catalog({ rooms }: { rooms: Room[] }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<RoomFilters>(emptyFilters);
  const [applied, setApplied] = useState<RoomFilters>(emptyFilters);
  const dialog = useRef<HTMLDialogElement>(null);
  const visibleRooms = filterRooms(rooms, applied);

  return (
    <div className="mx-auto flex w-full max-w-[1600px]">
      <aside
        aria-label="Filtros de habitaciones"
        className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[300px] shrink-0 overflow-y-auto border-r border-zinc-200 bg-white px-6 py-8 md:block lg:w-[320px]"
      >
        <RoomFiltersForm
          value={draft}
          onChange={setDraft}
          onApply={() => setApplied(draft)}
        />
      </aside>
      <section id="habitaciones" className="min-w-0 flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-[22px] font-bold sm:text-2xl">
          Habitaciones disponibles
        </h1>
        <button
          type="button"
          aria-expanded={filtersOpen}
          onClick={() => {
            setFiltersOpen(true);
            dialog.current?.showModal();
          }}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white md:hidden"
        >
          <SlidersIcon />
          {filtersOpen ? "Ocultar filtros" : "Mostrar Filtros"}
        </button>
        <dialog
          ref={dialog}
          onClose={() => setFiltersOpen(false)}
          className="fixed inset-y-0 left-0 m-0 h-dvh max-h-dvh w-[88vw] max-w-sm overflow-y-auto border-0 bg-white p-6 text-foreground backdrop:bg-black/40"
        >
          <button
            type="button"
            className="mb-6 block ml-auto text-sm font-semibold text-brand"
            onClick={() => dialog.current?.close()}
          >
            Cerrar filtros ×
          </button>
          <RoomFiltersForm
            value={draft}
            onChange={setDraft}
            onApply={() => {
              setApplied(draft);
              dialog.current?.close();
            }}
          />
        </dialog>
        {visibleRooms.length === 0 ? (
          <p className="mt-8 text-center text-zinc-500">
            No hay habitaciones que coincidan con los filtros.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {visibleRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
