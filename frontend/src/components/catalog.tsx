"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client-api";
import type { Amenity } from "@/lib/amenities";
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
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [availableCatalogs, setAvailableCatalogs] = useState<string[] | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const requestVersion = useRef(0);
  const visibleRooms = filterRooms(rooms, applied).filter(
    (room) => !availableCatalogs || availableCatalogs.includes(room.id),
  );
  useEffect(() => {
    let active = true;
    api<Amenity[]>("/amenidades")
      .then((result) => {
        if (active) setAmenities(result);
      })
      .catch(() => {
        if (active)
          setError(
            "No se pudieron cargar las amenidades. Vuelve a cargar la página.",
          );
      });
    return () => {
      active = false;
    };
  }, []);

  async function applyFilters() {
    const version = ++requestVersion.current;
    setError("");
    if (Boolean(draft.checkIn) !== Boolean(draft.checkOut)) {
      setError(
        "Selecciona la fecha de ingreso y la de salida para consultar disponibilidad.",
      );
      return;
    }
    setBusy(true);
    try {
      let catalogos: string[] | null = null;
      if (draft.checkIn && draft.checkOut) {
        const query = new URLSearchParams({
          ingreso: draft.checkIn,
          salida: draft.checkOut,
        });
        const result = await api<{ habitaciones: { catalogo: string }[] }>(
          `/disponibilidad?${query}`,
        );
        catalogos = [
          ...new Set(result.habitaciones.map((room) => room.catalogo)),
        ];
      }
      if (version !== requestVersion.current) return;
      setAvailableCatalogs(catalogos);
      setApplied({
        ...draft,
        amenities: draft.amenities.filter((codigo) =>
          amenities.some((a) => a.codigo === codigo),
        ),
      });
      dialog.current?.close();
    } catch (err) {
      if (version === requestVersion.current) setError((err as Error).message);
    } finally {
      if (version === requestVersion.current) setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px]">
      <aside
        aria-label="Filtros de habitaciones"
        className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[300px] shrink-0 overflow-y-auto border-r border-zinc-200 bg-white px-6 py-8 md:block lg:w-[320px]"
      >
        <RoomFiltersForm
          value={draft}
          onChange={setDraft}
          onApply={applyFilters}
          amenities={amenities}
          busy={busy}
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
            onApply={applyFilters}
            amenities={amenities}
            busy={busy}
          />
          {error && (
            <p role="alert" className="mt-4 text-sm text-red-700">
              {error}
            </p>
          )}
        </dialog>
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        {applied.checkIn && applied.checkOut && (
          <p className="mt-4 text-sm text-zinc-500">
            Disponibilidad del {applied.checkIn} al {applied.checkOut}. Se
            confirma nuevamente al reservar.
          </p>
        )}
        {visibleRooms.length === 0 ? (
          <p className="mt-8 text-center text-zinc-500">
            No hay habitaciones que coincidan con los filtros.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {visibleRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                ingreso={applied.checkIn}
                salida={applied.checkOut}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
