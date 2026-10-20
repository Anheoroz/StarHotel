"use client";

import Link from "next/link";
import { Accordion } from "@/components/accordion";

export function SiteFooter() {
  return (
    <footer className="bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-5 pt-16">
        <p className="text-[0.68rem] tracking-[0.22em] text-stone-500 uppercase">Star Hotel · Zona 10 · Ciudad de Guatemala</p>
        <div className="mt-8">
          <Accordion
            tono="oscuro"
            items={[
              {
                id: "casa",
                titulo: "La casa",
                contenido: "Zona 10, Ciudad de Guatemala. Llegada desde las 15:00. Salida hasta las 12:00.",
              },
              {
                id: "huespedes",
                titulo: "Para huéspedes",
                contenido: (
                  <span className="grid gap-2">
                    <Link href="/#habitaciones" className="hover:text-white">Habitaciones</Link>
                    <Link href="/#ofertas" className="hover:text-white">Ofertas</Link>
                    <Link href="/#preguntas" className="hover:text-white">Preguntas</Link>
                  </span>
                ),
              },
              {
                id: "visita",
                titulo: "Visita",
                contenido: (
                  <span className="grid gap-2">
                    <Link href="/" className="hover:text-white">Inicio</Link>
                    <Link href="/#eventos" className="hover:text-white">Eventos</Link>
                    <Link href="/entrar" className="hover:text-white">Ingresar</Link>
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="font-display text-5xl italic">Star Hotel</p>
          <p className="mt-3 text-[0.68rem] tracking-[0.28em] text-brand uppercase">El lujo de quedarse</p>
          <p className="mt-6 max-w-md text-sm leading-7 text-stone-400">
            Te invitamos a Zona 10, en la Ciudad de Guatemala. Habitaciones para dormir, desayuno, piscina y un salón para congresos, charlas y eventos.
          </p>
        </div>
        <div className="md:pt-2 md:text-right">
          <p className="text-[0.68rem] tracking-[0.22em] text-stone-500 uppercase">Dirección</p>
          <p className="mt-3 font-display text-3xl leading-tight">Zona 10</p>
          <p className="font-display text-3xl leading-tight">Ciudad de Guatemala</p>
        </div>
      </div>
    </footer>
  );
}
