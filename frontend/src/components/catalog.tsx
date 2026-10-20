"use client";

import Image from "next/image";
import { useState } from "react";
import { HomeStory } from "@/components/home-story";
import { RoomCard } from "@/components/room-card";
import { RoomFiltersForm } from "@/components/room-filters";
import { emptyFilters, filterRooms, type Room, type RoomFilters } from "@/lib/rooms";

export function Catalog({ rooms }: { rooms: Room[] }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<RoomFilters>(emptyFilters);
  const [applied, setApplied] = useState<RoomFilters>(emptyFilters);
  const [aviso, setAviso] = useState("");
  const visibleRooms = filterRooms(rooms, applied);

  function verHabitaciones() {
    if (draft.checkIn && draft.checkOut && draft.checkOut <= draft.checkIn) {
      setAviso("La salida debe ser posterior a la llegada.");
      return;
    }
    setAviso(draft.checkIn && draft.checkOut ? "Fechas listas para consultar disponibilidad." : "");
    setApplied(draft);
    document.getElementById("habitaciones")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <section>
        <div className="mx-auto max-w-6xl px-5 pt-10 pb-6">
          <p className="text-[0.72rem] tracking-[0.34em] text-brand uppercase">Zona 10 · Ciudad de Guatemala</p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl leading-[0.9] italic md:text-7xl">
            El lujo de quedarse
          </h1>
        </div>
        <div className="relative aspect-[3/2] overflow-hidden bg-black">
          <div className="kenburns absolute inset-0">
            <Image
              src="/brand/portada-piscina.png"
              alt="Pareja en la piscina de Star Hotel"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        </div>
        <form
          className="relative z-10 mx-auto mt-6 max-w-6xl px-5"
          onSubmit={(event) => {
            event.preventDefault();
            verHabitaciones();
          }}
        >
          <div className="grid overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.28)] md:grid-cols-[1fr_1fr_1fr_auto] md:items-end md:divide-x md:divide-line">
            <label className="grid gap-1 px-6 py-5 text-[0.68rem] tracking-[0.18em] text-stone-500 uppercase">
              Llegada
              <input
                type="date"
                value={draft.checkIn}
                onChange={(event) => setDraft({ ...draft, checkIn: event.target.value })}
                className="bg-transparent py-1 text-base tracking-normal text-black normal-case"
              />
            </label>
            <label className="grid gap-1 px-6 py-5 text-[0.68rem] tracking-[0.18em] text-stone-500 uppercase">
              Salida
              <input
                type="date"
                value={draft.checkOut}
                onChange={(event) => setDraft({ ...draft, checkOut: event.target.value })}
                className="bg-transparent py-1 text-base tracking-normal text-black normal-case"
              />
            </label>
            <label className="grid gap-1 px-6 py-5 text-[0.68rem] tracking-[0.18em] text-stone-500 uppercase">
              Huéspedes
              <input
                type="number"
                min={1}
                placeholder="1"
                value={draft.guests}
                onChange={(event) => setDraft({ ...draft, guests: event.target.value })}
                className="bg-transparent py-1 text-base tracking-normal text-black normal-case"
              />
            </label>
            <div className="px-5 py-5">
              <button type="submit" className="w-full rounded-full bg-brand px-7 py-3.5 text-[0.72rem] tracking-[0.18em] text-white uppercase transition duration-300 hover:-translate-y-0.5 hover:bg-[#541c26]">
                Ver habitaciones
              </button>
            </div>
          </div>
          {aviso ? <p className="mt-3 text-sm text-stone-600">{aviso}</p> : null}
        </form>
      </section>

      <HomeStory />

      <section id="habitaciones" className="scroll-mt-28 mx-auto w-full max-w-6xl px-5 pb-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.68rem] tracking-[0.32em] text-brand uppercase">Alojamiento</p>
            <h2 className="mt-3 font-display text-5xl italic md:text-6xl">Habitaciones</h2>
          </div>
          <button
            type="button"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
            className="rounded-full border border-brand px-5 py-2 text-[0.72rem] tracking-[0.16em] text-brand uppercase transition hover:bg-brand hover:text-white"
          >
            {filtersOpen ? "Ocultar preferencias" : "Preferencias"}
          </button>
        </div>
        {filtersOpen ? (
          <RoomFiltersForm
            value={draft}
            onChange={setDraft}
            onApply={() => {
              setApplied(draft);
              setFiltersOpen(false);
            }}
          />
        ) : null}
        {visibleRooms.length === 0 ? (
          <p className="mt-10 text-center text-stone-500">No hay habitaciones que coincidan con la búsqueda.</p>
        ) : (
          <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2">
            {visibleRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
