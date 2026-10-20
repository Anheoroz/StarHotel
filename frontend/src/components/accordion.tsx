"use client";

import { useState, type ReactNode } from "react";

export type AccordionItem = {
  id: string;
  titulo: string;
  contenido: ReactNode;
};

export function Accordion({
  items,
  tono = "claro",
}: {
  items: AccordionItem[];
  tono?: "claro" | "oscuro";
}) {
  const [abierto, setAbierto] = useState<string | null>(null);
  const linea = tono === "oscuro" ? "border-white/15" : "border-line";
  const titulo = tono === "oscuro" ? "text-white" : "text-black";
  const cuerpo = tono === "oscuro" ? "text-stone-400" : "text-stone-600";

  return (
    <div>
      {items.map((item) => {
        const activo = abierto === item.id;
        return (
          <div key={item.id} className={`border-b ${linea}`}>
            <button
              type="button"
              aria-expanded={activo}
              className={`flex w-full items-center justify-between gap-6 py-5 text-left ${titulo}`}
              onClick={() => setAbierto(activo ? null : item.id)}
            >
              <span className="font-display text-[1.65rem] leading-none">{item.titulo}</span>
              <span
                aria-hidden="true"
                className={`text-sm tracking-widest transition duration-500 ${activo ? "rotate-180 text-brand" : ""}`}
              >
                ⌄
              </span>
            </button>
            <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${activo ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden" inert={activo ? undefined : true}>
                <div className={`max-w-2xl pb-5 text-sm leading-7 ${cuerpo}`}>{item.contenido}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
