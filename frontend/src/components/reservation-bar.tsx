"use client";

import { useState } from "react";

export function ReservationBar() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [message, setMessage] = useState("");

  return (
    <form
      className="fixed inset-x-0 bottom-0 z-20 bg-panel px-4 py-4 text-white"
      onSubmit={(event) => {
        event.preventDefault();
        if (!checkIn || !checkOut) {
          setMessage("Selecciona la fecha de inicio y la fecha final.");
          return;
        }
        if (checkOut <= checkIn) {
          setMessage("La fecha final debe ser posterior a la de inicio.");
          return;
        }
        setMessage("Fechas seleccionadas. La reserva todavía no se guarda.");
      }}
    >
      <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Fecha de inicio
          <input
            type="date"
            name="fechaInicio"
            value={checkIn}
            onChange={(event) => setCheckIn(event.target.value)}
            className="rounded-lg bg-white px-3 py-2 text-foreground"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Fecha final
          <input
            type="date"
            name="fechaFinal"
            value={checkOut}
            onChange={(event) => setCheckOut(event.target.value)}
            className="rounded-lg bg-white px-3 py-2 text-foreground"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-3 text-base font-semibold text-white sm:col-span-2"
        >
          Reservar
        </button>
        {message ? <p className="text-sm text-zinc-200 sm:col-span-2">{message}</p> : null}
      </div>
    </form>
  );
}
