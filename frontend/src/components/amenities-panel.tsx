"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/client-api";
import { amenityCode, type Amenity } from "@/lib/amenities";

export function AmenitiesPanel({
  amenities,
  onChange,
}: {
  amenities: Amenity[];
  onChange: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<Amenity | null>(null);
  const [editing, setEditing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Amenity | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function mutate(action: () => Promise<unknown>, success: string) {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await action();
      await onChange();
      setMessage(success);
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    if (
      await mutate(
        () =>
          api(editing ? `/amenidades/${draft.codigo}` : "/amenidades", {
            method: editing ? "PATCH" : "POST",
            body: JSON.stringify(draft),
          }),
        editing
          ? "Amenidad actualizada en las habitaciones que la incluyen."
          : "Amenidad creada. Ya puedes asignarla a los modelos del catálogo.",
      )
    )
      setDraft(null);
  }

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Amenidades y servicios</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Crea los servicios del hotel y asígnalos en Catálogo y fotografías.
          </p>
        </div>
        <button
          className="btn-primary"
          disabled={busy}
          onClick={() => {
            setDraft({ codigo: "", nombre: "", descripcion: "" });
            setEditing(false);
            setPendingDelete(null);
            setError("");
            setMessage("");
          }}
        >
          Agregar amenidad
        </button>
      </div>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          role="status"
          className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800"
        >
          {message}
        </p>
      )}
      {draft && (
        <form
          onSubmit={save}
          className="mt-5 grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 sm:grid-cols-2"
        >
          <h3 className="font-bold sm:col-span-2">
            {editing ? "Editar amenidad" : "Nueva amenidad"}
          </h3>
          <label className="field-label">
            Nombre
            <input
              className="field"
              required
              maxLength={120}
              value={draft.nombre}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  nombre: e.target.value,
                  codigo: editing ? draft.codigo : amenityCode(e.target.value),
                })
              }
            />
          </label>
          <label className="field-label">
            Código
            <input className="field" value={draft.codigo} readOnly />
            <span className="text-xs font-normal text-zinc-500">
              Se genera al crear y se conserva al editar.
            </span>
          </label>
          <label className="field-label sm:col-span-2">
            Descripción del servicio
            <textarea
              className="field min-h-24"
              required
              maxLength={500}
              value={draft.descripcion}
              onChange={(e) =>
                setDraft({ ...draft, descripcion: e.target.value })
              }
            />
          </label>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button className="btn-primary" disabled={busy || !draft.codigo}>
              Guardar amenidad
            </button>
            <button
              className="btn-secondary"
              type="button"
              disabled={busy}
              onClick={() => setDraft(null)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
      {pendingDelete && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-5"
        >
          <p className="font-semibold">¿Eliminar {pendingDelete.nombre}?</p>
          <p className="mt-2 text-sm text-zinc-600">
            Dejará de aparecer en los filtros y en las habitaciones que la
            incluyen. Las habitaciones se conservarán.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              disabled={busy}
              className="btn-primary"
              onClick={async () => {
                if (
                  await mutate(
                    () =>
                      api(`/amenidades/${pendingDelete.codigo}`, {
                        method: "DELETE",
                      }),
                    "Amenidad eliminada del listado y de sus habitaciones.",
                  )
                )
                  setPendingDelete(null);
              }}
            >
              Confirmar eliminación
            </button>
            <button
              disabled={busy}
              className="btn-secondary"
              onClick={() => setPendingDelete(null)}
            >
              Cancelar eliminación
            </button>
          </div>
        </div>
      )}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {amenities.map((amenity) => (
          <article
            key={amenity.codigo}
            className="flex flex-col rounded-lg border border-zinc-200 bg-white p-5"
          >
            <h3 className="font-bold">{amenity.nombre}</h3>
            <p className="mt-2 flex-1 text-sm text-zinc-500">
              {amenity.descripcion ||
                "Sin descripción. Puedes completarla al editar."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="btn-secondary"
                disabled={busy}
                aria-label={`Editar ${amenity.nombre}`}
                onClick={() => {
                  setDraft({ ...amenity });
                  setEditing(true);
                  setPendingDelete(null);
                }}
              >
                Editar
              </button>
              <button
                className="text-sm font-semibold text-red-700 underline"
                disabled={busy}
                aria-label={`Eliminar ${amenity.nombre}`}
                onClick={() => {
                  setPendingDelete(amenity);
                  setDraft(null);
                }}
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
      {amenities.length === 0 && (
        <p className="mt-6 text-zinc-500">
          Todavía no hay amenidades. Agrega la primera para asignarla al
          catálogo.
        </p>
      )}
    </section>
  );
}
