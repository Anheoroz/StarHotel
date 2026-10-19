"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import { ESTADO_LABELS, type Unidad } from "@/lib/inventory";

const STATE_COLORS: Record<string, string> = {
  disponible: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  ocupada: "bg-blue-50 text-blue-800 ring-blue-200",
  "pendiente-limpieza": "bg-amber-50 text-amber-900 ring-amber-200",
  mantenimiento: "bg-violet-50 text-violet-800 ring-violet-200",
};

export function OperationPanel() {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    api<Unidad[]>("/operacion")
      .then((data) => {
        if (active) setUnidades(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      setUnidades(await api<Unidad[]>("/operacion"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const summary = [
    { label: "Habitaciones", value: unidades.length, color: "bg-brand" },
    {
      label: "Disponibles",
      value: unidades.filter((u) => u.disponible).length,
      color: "bg-emerald-600",
    },
    {
      label: "Ocupadas",
      value: unidades.filter((u) => u.estado === "ocupada").length,
      color: "bg-blue-600",
    },
    {
      label: "Por limpiar",
      value: unidades.filter((u) => u.estado === "pendiente-limpieza").length,
      color: "bg-amber-500",
    },
  ];
  const query = search.trim().toLocaleLowerCase("es");
  const visible = unidades.filter((u) => {
    const retired = !u.activa || !u.catalogoActivo;
    const matchesState =
      !filter ||
      (filter === "retiradas"
        ? retired
        : filter === "disponible"
          ? u.disponible
          : u.estado === filter);
    return (
      matchesState &&
      `${u.numero} ${u.nombre} ${u.tipo}`
        .toLocaleLowerCase("es")
        .includes(query)
    );
  });

  return (
    <section className="mt-6" aria-label="Consulta de habitaciones">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summary.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5"
          >
            <p className="flex items-center gap-2 text-sm text-zinc-500">
              <span
                aria-hidden="true"
                className={`h-2 w-2 shrink-0 rounded-full ${item.color}`}
              />
              {item.label}
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums">
              {loading ? "—" : item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Consulta de habitaciones</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Encuentra un cuarto y revisa su estado.
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            className="btn-secondary"
            onClick={refresh}
          >
            {loading ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_260px]">
          <label className="field-label">
            Buscar habitación
            <input
              className="field"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Número, tipo o nombre"
            />
          </label>
          <label className="field-label">
            Filtrar por estado
            <select
              className="field"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="">Todos los estados</option>
              {Object.entries(ESTADO_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
              <option value="retiradas">Retiradas temporalmente</option>
            </select>
          </label>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {loading ? (
        <p role="status" className="py-10 text-center text-sm text-zinc-500">
          Consultando habitaciones…
        </p>
      ) : (
        <>
          <p role="status" className="mt-5 text-sm text-zinc-500">
            {visible.length}{" "}
            {visible.length === 1
              ? "habitación encontrada"
              : "habitaciones encontradas"}
          </p>
          {visible.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-12 text-center">
              <h3 className="font-semibold">No se encontraron habitaciones</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Prueba con otro número o cambia el estado seleccionado.
              </p>
              <button
                type="button"
                className="btn-secondary mt-5"
                onClick={() => {
                  setSearch("");
                  setFilter("");
                }}
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((u) => {
                const retired = !u.activa || !u.catalogoActivo;
                const color = retired
                  ? "bg-zinc-100 text-zinc-700 ring-zinc-200"
                  : (STATE_COLORS[u.estado] ?? STATE_COLORS.mantenimiento);
                return (
                  <article
                    key={u._id}
                    className="rounded-lg border border-zinc-200 bg-white p-5 transition hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                          {u.tipo}
                        </p>
                        <h3 className="mt-1 text-xl font-bold">
                          Habitación {u.numero}
                        </h3>
                      </div>
                      <span
                        aria-hidden="true"
                        className="rounded-md bg-brand/5 px-3 py-2 text-sm font-semibold text-brand"
                      >
                        {u.numero}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-zinc-500">{u.nombre}</p>
                    <div className="mt-5 border-t border-zinc-100 pt-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${color}`}
                      >
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 rounded-full bg-current"
                        />
                        {retired
                          ? "Retirada temporalmente"
                          : ESTADO_LABELS[u.estado]}
                      </span>
                      {retired && (
                        <p className="mt-2 text-xs text-zinc-500">
                          Estado: {ESTADO_LABELS[u.estado]}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
