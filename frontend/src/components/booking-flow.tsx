"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/client-api";
import type { Cuenta } from "@/lib/session";
import {
  fechaCorta,
  fechaGuatemala,
  limiteReservas,
  moneda,
  RESERVA_ESTADOS,
  sumarDias,
  type Disponibilidad,
  type HabitacionDisponible,
  type Reserva,
} from "@/lib/reservas";

type Props = {
  cuenta: Cuenta | null;
  ingresoInicial: string;
  salidaInicial: string;
  catalogoInicial: string;
  reservaInicial: string;
  seleccionInicial: string[];
};

type Grupo = { modelo: HabitacionDisponible; unidades: HabitacionDisponible[] };

export function BookingFlow({
  cuenta,
  ingresoInicial,
  salidaInicial,
  catalogoInicial,
  reservaInicial,
  seleccionInicial,
}: Props) {
  const [ingreso, setIngreso] = useState(ingresoInicial);
  const [salida, setSalida] = useState(salidaInicial);
  const [disponibilidad, setDisponibilidad] = useState<Disponibilidad | null>(
    null,
  );
  const [seleccion, setSeleccion] = useState<string[]>(seleccionInicial);
  const [catalogo, setCatalogo] = useState(catalogoInicial);
  const [contacto, setContacto] = useState({
    nombre: cuenta?.nombre ?? "",
    correo: cuenta?.correo ?? "",
    telefono: "",
  });
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [consultando, setConsultando] = useState(
    Boolean(!reservaInicial && ingresoInicial && salidaInicial),
  );
  const [guardando, setGuardando] = useState(false);
  const [cargandoReserva, setCargandoReserva] = useState(
    Boolean(reservaInicial),
  );
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const solicitud = useRef(0);
  const hoy = fechaGuatemala();
  const maximo = limiteReservas(hoy);

  const consultar = useCallback(
    async (entrada: string, salidaConsulta: string, conservar = false) => {
      const actual = ++solicitud.current;
      setConsultando(true);
      setError("");
      setAviso("");
      try {
        const resultado = await api<Disponibilidad>(
          `/disponibilidad?${new URLSearchParams({ ingreso: entrada, salida: salidaConsulta })}`,
        );
        if (actual !== solicitud.current) return;
        setDisponibilidad(resultado);
        setSeleccion((previas) =>
          conservar
            ? previas.filter((id) =>
                resultado.habitaciones.some(
                  (habitacion) => habitacion.id === id,
                ),
              )
            : [],
        );
        if (conservar)
          setAviso(
            "La disponibilidad está actualizada. Revisa tu selección antes de continuar.",
          );
      } catch (err) {
        if (actual !== solicitud.current) return;
        setError((err as Error).message);
        setDisponibilidad(null);
        setSeleccion([]);
      } finally {
        if (actual === solicitud.current) setConsultando(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (reservaInicial || !ingresoInicial || !salidaInicial) return;
    let vigente = true;
    const actual = ++solicitud.current;
    api<Disponibilidad>(
      `/disponibilidad?${new URLSearchParams({ ingreso: ingresoInicial, salida: salidaInicial })}`,
    )
      .then((resultado) => {
        if (!vigente || actual !== solicitud.current) return;
        setDisponibilidad(resultado);
        setSeleccion((previas) =>
          previas.filter((id) =>
            resultado.habitaciones.some((habitacion) => habitacion.id === id),
          ),
        );
      })
      .catch((err: Error) => {
        if (vigente && actual === solicitud.current) setError(err.message);
      })
      .finally(() => {
        if (vigente && actual === solicitud.current) setConsultando(false);
      });
    return () => {
      vigente = false;
    };
  }, [reservaInicial, ingresoInicial, salidaInicial]);

  useEffect(() => {
    if (!reservaInicial) return;
    let vigente = true;
    api<Reserva>(`/reservas/${encodeURIComponent(reservaInicial)}`)
      .then((data) => {
        if (vigente) setReserva(data);
      })
      .catch((err: Error) => {
        if (vigente) setError(err.message);
      })
      .finally(() => {
        if (vigente) setCargandoReserva(false);
      });
    return () => {
      vigente = false;
    };
  }, [reservaInicial]);

  const grupos = useMemo(() => {
    const modelos = new Map<string, Grupo>();
    for (const habitacion of disponibilidad?.habitaciones ?? []) {
      const grupo = modelos.get(habitacion.catalogo);
      if (grupo) grupo.unidades.push(habitacion);
      else
        modelos.set(habitacion.catalogo, {
          modelo: habitacion,
          unidades: [habitacion],
        });
    }
    return [...modelos.values()];
  }, [disponibilidad]);
  const elegidas = (disponibilidad?.habitaciones ?? []).filter((habitacion) =>
    seleccion.includes(habitacion.id),
  );
  const total =
    elegidas.reduce((suma, habitacion) => suma + habitacion.precio, 0) *
    (disponibilidad?.noches ?? 0);
  const fechasActuales =
    disponibilidad?.ingreso === ingreso && disponibilidad?.salida === salida;
  const gruposVisibles = catalogo
    ? grupos.filter((grupo) => grupo.modelo.catalogo === catalogo)
    : grupos;
  const continuar = `/reservar?${new URLSearchParams({ ingreso, salida, ...(catalogo ? { catalogo } : {}), ...(seleccion.length ? { unidades: seleccion.join(",") } : {}) })}`;

  function cambiarFecha(tipo: "ingreso" | "salida", valor: string) {
    solicitud.current += 1;
    setConsultando(false);
    setDisponibilidad(null);
    setSeleccion([]);
    setAviso("");
    setError("");
    if (tipo === "ingreso") {
      setIngreso(valor);
      if (salida && valor >= salida) setSalida("");
    } else setSalida(valor);
  }

  if (cargandoReserva)
    return (
      <p
        role="status"
        className="mt-8 rounded-xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500"
      >
        Cargando tu reserva…
      </p>
    );
  if (reserva)
    return <ReservaConfirmada reserva={reserva} onChange={setReserva} />;

  return (
    <div className="mt-7">
      <Pasos actual={1} />
      {reservaInicial && error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5">
          <p role="alert" className="text-sm text-red-800">
            {error}
          </p>
          {!cuenta && (
            <Link
              href={`/acceso?continuar=${encodeURIComponent(`/reservar?reserva=${reservaInicial}`)}`}
              className="mt-3 inline-block text-sm font-bold text-brand underline"
            >
              Inicia sesión para ver tu reserva
            </Link>
          )}
          <Link
            href="/cuenta"
            className="ml-4 text-sm font-semibold text-brand underline"
          >
            Mis reservas
          </Link>
        </div>
      )}
      <form
        className="mt-6 grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 md:grid-cols-[1fr_1fr_auto] md:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          void consultar(ingreso, salida);
        }}
      >
        <label className="field-label">
          Fecha de ingreso
          <input
            type="date"
            name="ingreso"
            className="field"
            value={ingreso}
            min={hoy}
            max={maximo}
            required
            onChange={(event) => cambiarFecha("ingreso", event.target.value)}
          />
        </label>
        <label className="field-label">
          Fecha de salida
          <input
            type="date"
            name="salida"
            className="field"
            value={salida}
            min={ingreso ? sumarDias(ingreso, 1) : sumarDias(hoy, 1)}
            required
            onChange={(event) => cambiarFecha("salida", event.target.value)}
          />
        </label>
        <button className="btn-primary min-h-11" disabled={consultando}>
          {consultando ? "Consultando…" : "Consultar disponibilidad"}
        </button>
        <p className="text-xs leading-5 text-zinc-500 md:col-span-3">
          Puedes reservar con hasta 3 meses de anticipación. Ingreso desde las
          15:00 · Salida hasta las 12:00.
        </p>
      </form>
      {error && !reservaInicial && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {aviso && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-brand/5 px-4 py-3 text-sm text-brand"
        >
          {aviso}
        </p>
      )}
      {consultando && (
        <p role="status" className="mt-6 text-sm text-zinc-500">
          Buscando habitaciones para tu estancia…
        </p>
      )}
      {!disponibilidad && !consultando && !error && (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
          <p className="text-3xl" aria-hidden="true">
            ☀
          </p>
          <h2 className="mt-3 text-xl font-bold">Un descanso a tu medida</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
            Selecciona tus fechas para conocer las habitaciones disponibles.
            Puedes elegir hasta cuatro para una misma reserva.
          </p>
        </div>
      )}
      {disponibilidad && !consultando && fechasActuales && (
        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="min-w-0" aria-label="Habitaciones disponibles">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Elige tus habitaciones</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {disponibilidad.habitaciones.length} disponibles ·{" "}
                  {disponibilidad.noches}{" "}
                  {disponibilidad.noches === 1 ? "noche" : "noches"}
                </p>
              </div>
              {grupos.length > 0 && (
                <label className="field-label w-full sm:w-auto">
                  Ver opciones
                  <select
                    className="field"
                    value={catalogo}
                    onChange={(event) => setCatalogo(event.target.value)}
                  >
                    <option value="">Todas las habitaciones</option>
                    {grupos.map(({ modelo }) => (
                      <option key={modelo.catalogo} value={modelo.catalogo}>
                        {modelo.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            {gruposVisibles.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 bg-white p-7">
                <h3 className="font-bold">
                  No hay habitaciones disponibles{" "}
                  {catalogo ? "de esta opción " : ""}para estas fechas
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  Prueba con otras fechas
                  {catalogo ? " o consulta los demás tipos de habitación" : ""}.
                </p>
                {catalogo && grupos.length > 0 && (
                  <button
                    type="button"
                    className="btn-secondary mt-4"
                    onClick={() => setCatalogo("")}
                  >
                    Ver otras habitaciones
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-5 xl:grid-cols-2">
                {gruposVisibles.map(({ modelo, unidades }) => (
                  <article
                    key={modelo.catalogo}
                    className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white"
                  >
                    <div className="relative h-44 bg-zinc-100">
                      <Image
                        src={modelo.fotos[0] ?? "/rooms/sencilla.jpg"}
                        alt={modelo.nombre}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 420px"
                        className="object-cover"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand">
                        {modelo.tipo}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold">{modelo.nombre}</h3>
                      <p className="mt-1 text-xs text-zinc-500">
                        Hasta {modelo.adultos}{" "}
                        {modelo.adultos === 1 ? "adulto" : "adultos"}
                        {modelo.ninos > 0
                          ? ` y ${modelo.ninos} ${modelo.ninos === 1 ? "niño" : "niños"}`
                          : ""}
                      </p>
                      <p className="mt-3 text-lg font-bold text-brand">
                        {moneda(modelo.precio)}{" "}
                        <span className="text-xs font-normal text-zinc-500">
                          / noche por habitación
                        </span>
                      </p>
                      <p className="mt-3 text-xs font-medium text-zinc-600">
                        Selecciona el número de habitación:
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {unidades.map((habitacion) => {
                          const activa = seleccion.includes(habitacion.id);
                          const bloqueada = !activa && seleccion.length >= 4;
                          return (
                            <label
                              key={habitacion.id}
                              className={`relative inline-flex min-h-10 min-w-14 items-center justify-center rounded-md border px-2 py-2 text-sm font-semibold transition focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2 ${activa ? "border-brand bg-brand text-white" : bloqueada ? "cursor-not-allowed border-zinc-200 bg-zinc-50 text-zinc-400" : "cursor-pointer border-zinc-300 hover:border-brand hover:text-brand"}`}
                            >
                              <input
                                type="checkbox"
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                                aria-label={`${modelo.nombre}, habitación ${habitacion.numero}`}
                                checked={activa}
                                disabled={bloqueada}
                                onChange={() =>
                                  setSeleccion((actual) =>
                                    activa
                                      ? actual.filter(
                                          (id) => id !== habitacion.id,
                                        )
                                      : actual.length < 4
                                        ? [...actual, habitacion.id]
                                        : actual,
                                  )
                                }
                              />
                              <span aria-hidden="true">
                                {activa ? "✓ " : ""}
                                {habitacion.numero}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
          <aside
            className="min-w-0 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm lg:sticky lg:top-24"
            aria-label="Resumen de tu estancia"
          >
            <p className="text-xs font-bold tracking-widest text-brand">
              TU ESTANCIA
            </p>
            <h2 className="mt-2 text-xl font-bold">Resumen de reserva</h2>
            <dl className="mt-5 grid grid-cols-2 gap-3 rounded-lg bg-zinc-50 p-4 text-sm">
              <div>
                <dt className="text-xs text-zinc-500">Ingreso</dt>
                <dd className="mt-1 font-semibold">
                  {fechaCorta(disponibilidad.ingreso)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Salida</dt>
                <dd className="mt-1 font-semibold">
                  {fechaCorta(disponibilidad.salida)}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="font-semibold">Habitaciones seleccionadas</span>
              <span
                className="rounded-full bg-brand/10 px-2 py-1 text-xs font-bold text-brand"
                aria-live="polite"
              >
                {seleccion.length} de 4
              </span>
            </div>
            {elegidas.length ? (
              <ul className="mt-3 divide-y divide-zinc-100">
                {elegidas.map((habitacion) => (
                  <li
                    key={habitacion.id}
                    className="flex items-start justify-between gap-3 py-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold">{habitacion.nombre}</p>
                      <p className="mt-1 text-zinc-500">
                        N.º {habitacion.numero} · {moneda(habitacion.precio)} ×{" "}
                        {disponibilidad.noches} noches
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Quitar habitación ${habitacion.numero}`}
                      onClick={() =>
                        setSeleccion((previa) =>
                          previa.filter((id) => id !== habitacion.id),
                        )
                      }
                      className="min-h-7 min-w-7 rounded border border-zinc-200 text-zinc-500 hover:text-brand"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Añade de 1 a 4 habitaciones para continuar.
              </p>
            )}
            <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-zinc-200 pt-4">
              <span className="font-bold">Total de la estancia</span>
              <strong className="text-xl text-brand" aria-live="polite">
                {moneda(total)}
              </strong>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {disponibilidad.noches}{" "}
              {disponibilidad.noches === 1 ? "noche" : "noches"} · Pago del 100
              % al confirmar.
            </p>
            {cuenta?.rol === "cliente" ? (
              <form
                className="mt-6 space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!seleccion.length || guardando) return;
                  setGuardando(true);
                  setError("");
                  const datos = new FormData(event.currentTarget);
                  try {
                    const resultado = await api<Reserva>("/reservas", {
                      method: "POST",
                      body: JSON.stringify({
                        ingreso,
                        salida,
                        habitaciones: seleccion,
                        nombre: datos.get("nombre"),
                        correo: datos.get("correo"),
                        telefono: datos.get("telefono"),
                      }),
                    });
                    setReserva(resultado);
                    window.history.replaceState(
                      null,
                      "",
                      `/reservar?reserva=${encodeURIComponent(resultado.id)}`,
                    );
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } catch (err) {
                    const mensaje = (err as Error).message;
                    await consultar(ingreso, salida, true);
                    setError(mensaje);
                  } finally {
                    setGuardando(false);
                  }
                }}
              >
                <h3 className="text-sm font-bold">Datos de contacto</h3>
                <label className="field-label">
                  Nombre completo
                  <input
                    className="field"
                    name="nombre"
                    autoComplete="name"
                    value={contacto.nombre}
                    onChange={(event) =>
                      setContacto({ ...contacto, nombre: event.target.value })
                    }
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </label>
                <label className="field-label">
                  Correo electrónico
                  <input
                    className="field"
                    name="correo"
                    type="email"
                    autoComplete="email"
                    value={contacto.correo}
                    onChange={(event) =>
                      setContacto({ ...contacto, correo: event.target.value })
                    }
                    maxLength={254}
                    required
                  />
                </label>
                <label className="field-label">
                  Teléfono de contacto
                  <input
                    className="field"
                    name="telefono"
                    value={contacto.telefono}
                    onChange={(event) =>
                      setContacto({ ...contacto, telefono: event.target.value })
                    }
                    type="tel"
                    autoComplete="tel"
                    minLength={7}
                    maxLength={25}
                    required
                    placeholder="Ej. +502 5555 5555"
                  />
                </label>
                {error && (
                  <p
                    role="alert"
                    className="rounded-md border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800"
                  >
                    {error}
                  </p>
                )}
                <button
                  className="btn-primary w-full"
                  disabled={guardando || seleccion.length === 0}
                >
                  {guardando
                    ? "Guardando reserva…"
                    : "Crear reserva y continuar al pago"}
                </button>
              </form>
            ) : cuenta ? (
              <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                Para reservar, ingresa con una cuenta de cliente. Tu cuenta
                actual es de personal del hotel.
              </p>
            ) : (
              <div className="mt-5">
                <Link
                  href={`/acceso?continuar=${encodeURIComponent(continuar)}`}
                  className="btn-primary block text-center"
                >
                  Ingresa o crea una cuenta para reservar
                </Link>
                <p className="mt-2 text-xs leading-5 text-zinc-500">
                  Al regresar, consultaremos la disponibilidad de tus
                  habitaciones nuevamente.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function Pasos({ actual }: { actual: number }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Pasos de la reserva">
      {["Fechas y habitaciones", "Reserva creada", "Pago y confirmación"].map(
        (titulo, index) => (
          <li
            key={titulo}
            aria-current={index + 1 === actual ? "step" : undefined}
            className={`flex items-center gap-2 rounded-lg px-2 py-3 text-xs sm:px-4 sm:text-sm ${index + 1 <= actual ? "bg-brand/10 font-semibold text-brand" : "bg-zinc-100 text-zinc-500"}`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${index + 1 <= actual ? "bg-brand text-white" : "bg-white"}`}
            >
              {index + 1 < actual ? "✓" : index + 1}
            </span>
            <span>{titulo}</span>
          </li>
        ),
      )}
    </ol>
  );
}

function ReservaConfirmada({
  reserva,
  onChange,
}: {
  reserva: Reserva;
  onChange: (reserva: Reserva) => void;
}) {
  const [pagando, setPagando] = useState(false);
  const [error, setError] = useState("");
  const [tipoTarjeta, setTipoTarjeta] = useState("credito");
  const [numero, setNumero] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [cvv, setCvv] = useState("");
  const pagada = reserva.estado === "pagada";
  return (
    <div className="mt-7">
      <Pasos actual={pagada ? 3 : 2} />
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div
            className={`px-6 py-7 ${pagada ? "bg-emerald-50" : "bg-brand/5"}`}
          >
            <span
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-xl font-bold ${pagada ? "bg-emerald-100 text-emerald-800" : "bg-brand/10 text-brand"}`}
              aria-hidden="true"
            >
              ✓
            </span>
            <p className="mt-4 text-xs font-bold tracking-widest text-brand">
              {pagada ? "ESTANCIA CONFIRMADA" : "RESERVA CREADA"}
            </p>
            <h2 className="mt-2 text-2xl font-bold">
              {pagada
                ? "¡Tu pago fue exitoso!"
                : reserva.estado === "vencida"
                  ? "El plazo de pago terminó"
                  : "Ya tienes tu número de reserva"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {pagada
                ? "Tu reserva quedó pagada y confirmada. Puedes consultar sus datos cuando quieras desde tu cuenta."
                : reserva.estado === "vencida"
                  ? "Las habitaciones fueron liberadas. Consulta nuevamente la disponibilidad para crear otra reserva."
                  : "Completa el pago para confirmar tu estancia. Las habitaciones se guardan temporalmente mientras realizas este paso."}
            </p>
            <p className="mt-5 inline-block break-all rounded-md border border-zinc-200 bg-white px-4 py-2 font-mono text-lg font-bold tracking-wide text-brand">
              {reserva.codigo}
            </p>
          </div>
          <div className="p-6">
            <dl className="grid gap-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-zinc-500">Titular de la reserva</dt>
                <dd className="mt-1 font-semibold">{reserva.nombre}</dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">Contacto</dt>
                <dd className="mt-1 break-words">
                  {reserva.correo}
                  <br />
                  {reserva.telefono}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">
                  Ingreso · desde las 15:00
                </dt>
                <dd className="mt-1 font-semibold">
                  {fechaCorta(reserva.ingreso)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-zinc-500">
                  Salida · hasta las 12:00
                </dt>
                <dd className="mt-1 font-semibold">
                  {fechaCorta(reserva.salida)}
                </dd>
              </div>
            </dl>
            <h3 className="mt-7 text-sm font-bold">Tus habitaciones</h3>
            <ul className="mt-2 divide-y divide-zinc-100">
              {reserva.habitaciones.map((habitacion) => (
                <li
                  key={habitacion.id}
                  className="flex items-start justify-between gap-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold">{habitacion.nombre}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Habitación {habitacion.numero}
                    </p>
                  </div>
                  <p className="text-right text-xs text-zinc-500">
                    {moneda(habitacion.precio)}
                    <br />
                    por noche
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between gap-4 border-t border-zinc-200 pt-5">
              <span className="font-bold">
                Total · {reserva.noches}{" "}
                {reserva.noches === 1 ? "noche" : "noches"}
              </span>
              <strong className="text-xl text-brand">
                {moneda(reserva.total)}
              </strong>
            </div>
          </div>
        </section>
        <aside className="min-w-0 rounded-xl border border-zinc-200 bg-white p-6 lg:sticky lg:top-24">
          {reserva.estado === "pendiente-pago" ? (
            <>
              <h2 className="text-xl font-bold">Completa tu pago</h2>
              <p className="mt-2 text-sm text-zinc-500">
                Crédito o débito · 100 % de la reserva
              </p>
              {!error && reserva.pago?.estado === "rechazado" && (
                <p
                  role="status"
                  className="mt-3 rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-800"
                >
                  El último pago fue rechazado. Puedes volver a intentarlo con
                  la tarjeta de prueba aprobada.
                </p>
              )}
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
                <p className="font-bold">Demostración: pago simulado</p>
                <p className="mt-1">
                  No se realiza ningún cobro. Usa únicamente estas tarjetas de
                  prueba:
                </p>
                <p className="mt-2 break-all font-mono">4242 4242 4242 4242</p>
                <p>Resultado: pago aprobado.</p>
                <p className="mt-2 break-all font-mono">4000 0000 0000 0002</p>
                <p>Resultado: pago rechazado.</p>
                <p className="mt-2">
                  Usa una fecha futura y cualquier código de seguridad de 3
                  dígitos.
                </p>
              </div>
              <p className="mt-3 text-xs leading-5 text-zinc-500">
                Paga antes del{" "}
                {new Intl.DateTimeFormat("es-GT", {
                  dateStyle: "short",
                  timeStyle: "short",
                  timeZone: "America/Guatemala",
                }).format(new Date(reserva.expira))}{" "}
                (hora de Guatemala).
              </p>
              <form
                className="mt-5 space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (pagando) return;
                  setPagando(true);
                  setError("");
                  const datos = new FormData(event.currentTarget);
                  try {
                    const resultado = await api<Reserva>(
                      `/reservas/${encodeURIComponent(reserva.id)}/pago`,
                      {
                        method: "POST",
                        body: JSON.stringify({
                          tipoTarjeta,
                          titular: datos.get("titular"),
                          numero,
                          vencimiento,
                          cvv,
                        }),
                      },
                    );
                    setNumero("");
                    setVencimiento("");
                    setCvv("");
                    onChange(resultado);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } catch (err) {
                    setError((err as Error).message);
                    setCvv("");
                    try {
                      onChange(
                        await api<Reserva>(
                          `/reservas/${encodeURIComponent(reserva.id)}`,
                        ),
                      );
                    } catch {
                      /* El mensaje del pago permite reintentar. */
                    }
                  } finally {
                    setPagando(false);
                  }
                }}
              >
                <label className="field-label">
                  Tipo de tarjeta
                  <select
                    className="field"
                    value={tipoTarjeta}
                    onChange={(event) => setTipoTarjeta(event.target.value)}
                  >
                    <option value="credito">Crédito</option>
                    <option value="debito">Débito</option>
                  </select>
                </label>
                <label className="field-label">
                  Nombre en la tarjeta
                  <input
                    className="field"
                    name="titular"
                    minLength={2}
                    maxLength={100}
                    required
                    autoComplete="off"
                    placeholder="Nombre de prueba"
                  />
                </label>
                <label className="field-label">
                  Número de tarjeta de prueba
                  <input
                    className="field"
                    name="numero"
                    inputMode="numeric"
                    autoComplete="off"
                    value={numero}
                    onChange={(event) =>
                      setNumero(event.target.value.replace(/[^\d ]/g, ""))
                    }
                    minLength={16}
                    maxLength={19}
                    required
                    placeholder="4242 4242 4242 4242"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="field-label">
                    Vencimiento
                    <input
                      className="field"
                      name="vencimiento"
                      inputMode="numeric"
                      autoComplete="off"
                      value={vencimiento}
                      onChange={(event) => {
                        const digitos = event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4);
                        setVencimiento(
                          digitos.length > 2
                            ? `${digitos.slice(0, 2)}/${digitos.slice(2)}`
                            : digitos,
                        );
                      }}
                      maxLength={5}
                      pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                      required
                      placeholder="MM/AA"
                    />
                  </label>
                  <label className="field-label">
                    Código de seguridad
                    <input
                      className="field"
                      name="cvv"
                      type="password"
                      inputMode="numeric"
                      autoComplete="off"
                      value={cvv}
                      onChange={(event) =>
                        setCvv(
                          event.target.value.replace(/\D/g, "").slice(0, 3),
                        )
                      }
                      minLength={3}
                      maxLength={3}
                      required
                      placeholder="3 dígitos"
                    />
                  </label>
                </div>
                {error && (
                  <p
                    role="alert"
                    className="rounded-md bg-red-50 p-3 text-sm leading-6 text-red-800"
                  >
                    {error}
                  </p>
                )}
                <button className="btn-primary w-full" disabled={pagando}>
                  {pagando
                    ? "Procesando pago…"
                    : `Pagar ${moneda(reserva.total)} · Simulación`}
                </button>
                <p className="text-xs leading-5 text-zinc-500">
                  Los datos completos de la tarjeta no se guardan en tu cuenta.
                </p>
              </form>
            </>
          ) : (
            <>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${pagada ? "bg-emerald-50 text-emerald-800" : "bg-zinc-100 text-zinc-600"}`}
              >
                {RESERVA_ESTADOS[reserva.estado]}
              </span>
              <h2 className="mt-4 text-xl font-bold">
                {pagada
                  ? "Todo listo para tu visita"
                  : "Encuentra una nueva estancia"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                {pagada
                  ? "Conserva tu número de reserva para consultar tu estancia. Este pago corresponde a una demostración, sin cobro real."
                  : "Puedes seleccionar de nuevo tus fechas y habitaciones disponibles."}
              </p>
              {pagada && reserva.pago?.referencia && (
                <p className="mt-4 break-all text-xs text-zinc-500">
                  Referencia de pago:{" "}
                  <span className="font-mono">{reserva.pago.referencia}</span>
                </p>
              )}
              <Link
                href={pagada ? "/cuenta#mis-reservas" : "/reservar"}
                className="btn-primary mt-6 block text-center"
              >
                {pagada ? "Ver mis reservas" : "Consultar disponibilidad"}
              </Link>
            </>
          )}
          <Link
            href="/cuenta#mis-reservas"
            className="mt-5 block text-center text-sm font-semibold text-brand underline underline-offset-4"
          >
            Volver a mi cuenta
          </Link>
        </aside>
      </div>
    </div>
  );
}
