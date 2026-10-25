"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fechaGuatemala, limiteReservas, sumarDias } from "@/lib/reservas";

export function ReservationBar({
  catalogo,
  ingresoInicial = "",
  salidaInicial = "",
}: {
  catalogo?: string;
  ingresoInicial?: string;
  salidaInicial?: string;
}) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(ingresoInicial);
  const [checkOut, setCheckOut] = useState(salidaInicial);
  const [message, setMessage] = useState("");
  const hoy = fechaGuatemala();
  return (
    <form
      className="fixed inset-x-0 bottom-0 z-20 bg-[#1A2530] px-4 py-4 text-white"
      onSubmit={(event) => {
        event.preventDefault();
        if (!checkIn || !checkOut) {
          setMessage("Selecciona las fechas de ingreso y salida.");
          return;
        }
        if (checkOut <= checkIn) {
          setMessage("La salida debe ser posterior al ingreso.");
          return;
        }
        const parametros = new URLSearchParams({
          ingreso: checkIn,
          salida: checkOut,
        });
        if (catalogo) parametros.set("catalogo", catalogo);
        router.push(`/reservar?${parametros}`);
      }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-2 items-end gap-3 md:grid-cols-[1fr_1fr_auto]">
        <label className="grid min-w-0 gap-1 text-sm">
          Fecha de ingreso
          <input
            type="date"
            name="fechaInicio"
            required
            min={hoy}
            max={limiteReservas(hoy)}
            value={checkIn}
            onChange={(event) => {
              setCheckIn(event.target.value);
              setMessage("");
              if (checkOut && event.target.value >= checkOut) setCheckOut("");
            }}
            className="min-w-0 rounded-md bg-white px-3 py-2 text-foreground"
          />
        </label>
        <label className="grid min-w-0 gap-1 text-sm">
          Fecha de salida
          <input
            type="date"
            name="fechaFinal"
            required
            min={checkIn ? sumarDias(checkIn, 1) : sumarDias(hoy, 1)}
            value={checkOut}
            onChange={(event) => {
              setCheckOut(event.target.value);
              setMessage("");
            }}
            className="min-w-0 rounded-md bg-white px-3 py-2 text-foreground"
          />
        </label>
        <button
          type="submit"
          className="col-span-2 rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white md:col-span-1"
        >
          Consultar y reservar
        </button>
        {message && (
          <p
            role="alert"
            className="col-span-2 text-sm text-zinc-200 md:col-span-3"
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
