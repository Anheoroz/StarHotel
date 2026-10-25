"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fechaGuatemala, limiteReservas, sumarDias } from "@/lib/reservas";

export function HomeSearch() {
  const router = useRouter();
  const [ingreso, setIngreso] = useState("");
  const [salida, setSalida] = useState("");
  const [huespedes, setHuespedes] = useState("1");
  const [error, setError] = useState("");
  const hoy = fechaGuatemala();

  return (
    <form
      action="/habitaciones"
      method="get"
      aria-label="Buscar una estancia"
      className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-lg sm:p-6 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        if (
          Boolean(ingreso) !== Boolean(salida) ||
          (ingreso && salida <= ingreso)
        ) {
          setError("Indica la fecha de ingreso y una salida posterior.");
          return;
        }
        const params = new URLSearchParams({ huespedes });
        if (ingreso && salida) {
          params.set("ingreso", ingreso);
          params.set("salida", salida);
        }
        router.push(`/habitaciones?${params}`);
      }}
    >
      <label className="field-label min-w-0">
        Fecha de ingreso
        <input
          type="date"
          name="ingreso"
          className="field min-h-11"
          min={hoy}
          max={limiteReservas(hoy)}
          required={Boolean(salida)}
          value={ingreso}
          onChange={(event) => {
            setIngreso(event.target.value);
            if (salida && event.target.value >= salida) setSalida("");
            setError("");
          }}
        />
      </label>
      <label className="field-label min-w-0">
        Fecha de salida
        <input
          type="date"
          name="salida"
          className="field min-h-11"
          min={ingreso ? sumarDias(ingreso, 1) : sumarDias(hoy, 1)}
          required={Boolean(ingreso)}
          value={salida}
          onChange={(event) => {
            setSalida(event.target.value);
            setError("");
          }}
        />
      </label>
      <label className="field-label min-w-0">
        Huéspedes por habitación
        <input
          type="number"
          name="huespedes"
          className="field min-h-11"
          min={1}
          step={1}
          required
          value={huespedes}
          onChange={(event) => setHuespedes(event.target.value)}
        />
      </label>
      <button type="submit" className="btn-primary min-h-11 px-6">
        Buscar habitaciones <span aria-hidden="true">→</span>
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-700 lg:col-span-4">
          {error}
        </p>
      )}
    </form>
  );
}
