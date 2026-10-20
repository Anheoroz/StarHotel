"use client";

import { useState } from "react";

export function ReservationBar() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [message, setMessage] = useState("");

  return (
    <form
      className="mt-8 border border-line bg-white"
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
        setMessage("Fechas seleccionadas.");
      }}
    >
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="grid gap-1 text-[0.68rem] tracking-[0.16em] text-stone-500 uppercase">
          Llegada
          <input
            type="date"
            name="fechaInicio"
            value={checkIn}
            onChange={(event) => setCheckIn(event.target.value)}
            className="border border-line px-3 py-2 text-base tracking-normal text-black"
          />
        </label>
        <label className="grid gap-1 text-[0.68rem] tracking-[0.16em] text-stone-500 uppercase">
          Salida
          <input
            type="date"
            name="fechaFinal"
            value={checkOut}
            onChange={(event) => setCheckOut(event.target.value)}
            className="border border-line px-3 py-2 text-base tracking-normal text-black"
          />
        </label>
        <button type="submit" className="bg-brand px-6 py-3 text-[0.72rem] tracking-[0.16em] text-white uppercase">
          Reservar
        </button>
        {message ? <p className="text-sm text-stone-600 md:col-span-3">{message}</p> : null}
      </div>
    </form>
  );
}
