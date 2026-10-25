"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import {
  fechaCorta,
  moneda,
  RESERVA_ESTADOS,
  type Reserva,
} from "@/lib/reservas";

export function MyReservations() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      setReservas(await api<Reserva[]>("/reservas"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  }, []);
  useEffect(() => {
    let vigente = true;
    api<Reserva[]>("/reservas")
      .then((data) => {
        if (vigente) setReservas(data);
      })
      .catch((err: Error) => {
        if (vigente) setError(err.message);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, []);
  return (
    <section id="mis-reservas" className="mt-9 scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wider text-brand">
            TUS ESTANCIAS EN STAR HOTEL
          </p>
          <h2 className="mt-1 text-2xl font-bold">Mis reservas</h2>
        </div>
        <Link href="/reservar" className="btn-primary">
          Nueva reserva
        </Link>
      </div>
      {cargando ? (
        <p
          role="status"
          className="mt-5 rounded-xl border border-zinc-200 bg-white p-7 text-sm text-zinc-500"
        >
          Cargando tus reservas…
        </p>
      ) : error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5">
          <p role="alert" className="text-sm text-red-800">
            {error}
          </p>
          <button
            className="btn-secondary mt-3"
            type="button"
            onClick={() => void cargar()}
          >
            Volver a intentar
          </button>
        </div>
      ) : reservas.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-9 text-center">
          <h3 className="text-lg font-bold">Tu próxima visita empieza aquí</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500">
            Aún no tienes reservas. Elige tus fechas y encuentra el espacio
            ideal para ti y tus acompañantes.
          </p>
          <Link
            href="/reservar"
            className="mt-4 inline-block text-sm font-bold text-brand underline underline-offset-4"
          >
            Consultar disponibilidad →
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {reservas.map((reserva) => (
            <article
              key={reserva.id}
              className="min-w-0 rounded-xl border border-zinc-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="break-all font-mono text-sm font-bold text-brand">
                  {reserva.codigo}
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${reserva.estado === "pagada" ? "bg-emerald-50 text-emerald-800" : reserva.estado === "pendiente-pago" ? "bg-amber-50 text-amber-900" : "bg-zinc-100 text-zinc-600"}`}
                >
                  {RESERVA_ESTADOS[reserva.estado]}
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold">
                {fechaCorta(reserva.ingreso)} — {fechaCorta(reserva.salida)}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                {reserva.habitaciones.length}{" "}
                {reserva.habitaciones.length === 1
                  ? "habitación"
                  : "habitaciones"}{" "}
                · {reserva.noches} {reserva.noches === 1 ? "noche" : "noches"}
              </p>
              <p className="mt-3 text-xs leading-5 text-zinc-500">
                {reserva.habitaciones
                  .map(
                    (habitacion) =>
                      `${habitacion.nombre} (${habitacion.numero})`,
                  )
                  .join(" · ")}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
                <strong className="text-lg text-brand">
                  {moneda(reserva.total)}
                </strong>
                <Link
                  href={`/reservar?reserva=${encodeURIComponent(reserva.id)}`}
                  className={
                    reserva.estado === "pendiente-pago"
                      ? "btn-primary"
                      : "btn-secondary"
                  }
                >
                  {reserva.estado === "pendiente-pago"
                    ? "Completar pago"
                    : "Ver reserva"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
