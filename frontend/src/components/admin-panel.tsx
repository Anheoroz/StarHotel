"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api } from "@/lib/client-api";
import { ROOM_TYPES, type AmenityId } from "@/lib/rooms";
import { type Amenity } from "@/lib/amenities";
import { AmenitiesPanel } from "@/components/amenities-panel";
import { Gallery } from "@/components/gallery";
import { ESTADO_LABELS, type Unidad } from "@/lib/inventory";

type Modelo = {
  codigo: string;
  nombre: string;
  tipo: string;
  capacidad: { adultos: number; ninos: number };
  precioPorNoche: number;
  descripcion: string;
  fotos: string[];
  amenidades: AmenityId[];
  activa: boolean;
};
type Usuario = { _id: string; nombre: string; correo: string; rol: string };
type Draft = {
  codigo: string;
  nombre: string;
  tipo: string;
  adultos: number;
  ninos: number;
  precio: number;
  descripcion: string;
  fotos: string[];
  amenidades: AmenityId[];
};
const blank: Draft = {
  codigo: "",
  nombre: "",
  tipo: "Sencilla",
  adultos: 1,
  ninos: 0,
  precio: 0,
  descripcion: "",
  fotos: [],
  amenidades: [],
};
const ROLE_LABELS: Record<string, string> = {
  cliente: "Cliente",
  administrador: "Administrador",
  recepcion: "Recepción",
  mantenimiento: "Mantenimiento",
};

export function AdminPanel({ cuentaId }: { cuentaId: string }) {
  const [tab, setTab] = useState("inventario");
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [amenidades, setAmenidades] = useState<Amenity[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState(false);
  const [photo, setPhoto] = useState("");
  const [unitDraft, setUnitDraft] = useState<{
    id?: string;
    numero: string;
    catalogo: string;
    activa: boolean;
    estado: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const reload = useCallback(async () => {
    const [m, u, users, amenities] = await Promise.all([
      api<Modelo[]>("/admin/catalogo"),
      api<Unidad[]>("/admin/inventario"),
      api<Usuario[]>("/admin/usuarios"),
      api<Amenity[]>("/amenidades"),
    ]);
    setModelos(m);
    setUnidades(u);
    setUsuarios(users);
    setAmenidades(amenities);
  }, []);
  useEffect(() => {
    let active = true;
    Promise.all([
      api<Modelo[]>("/admin/catalogo"),
      api<Unidad[]>("/admin/inventario"),
      api<Usuario[]>("/admin/usuarios"),
      api<Amenity[]>("/amenidades"),
    ])
      .then(([m, u, users, amenities]) => {
        if (active) {
          setModelos(m);
          setUnidades(u);
          setUsuarios(users);
          setAmenidades(amenities);
        }
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

  async function mutate(action: () => Promise<unknown>, success: string) {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      await action();
      await reload();
      setMessage(success);
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function saveCatalog(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    if (
      await mutate(
        () =>
          api(editing ? `/admin/catalogo/${draft.codigo}` : "/admin/catalogo", {
            method: editing ? "PATCH" : "POST",
            body: JSON.stringify(draft),
          }),
        "Catálogo guardado. Los cambios ya se reflejan en la página pública.",
      )
    )
      setDraft(null);
  }
  const counts = ROOM_TYPES.map((tipo) => ({
    tipo,
    total: unidades.filter((u) => u.tipo === tipo).length,
  }));
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand">STAR HOTEL</p>
          <h1 className="mt-1 text-3xl font-bold">Administración</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Gestiona el catálogo, las habitaciones físicas y los accesos.
          </p>
        </div>
        <span className="rounded-full bg-white px-4 py-2 text-sm shadow-sm">
          {unidades.length} habitaciones físicas
        </span>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {counts.map(({ tipo, total }) => (
          <div
            key={tipo}
            className="rounded-lg border border-zinc-200 bg-white p-4"
          >
            <p className="text-sm text-zinc-500">{tipo}</p>
            <p className="mt-1 text-2xl font-bold">{total}</p>
          </div>
        ))}
      </div>
      <nav
        aria-label="Secciones de administración"
        className="mt-6 flex flex-wrap gap-2 border-b border-zinc-200 pb-3"
      >
        {[
          ["inventario", "Habitaciones físicas"],
          ["catalogo", "Catálogo y fotografías"],
          ["amenidades", "Amenidades"],
          ["usuarios", "Usuarios y roles"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-current={tab === key ? "page" : undefined}
            className={tab === key ? "btn-primary" : "btn-secondary"}
            onClick={() => {
              setTab(key);
              setDraft(null);
              setUnitDraft(null);
              setError("");
              setMessage("");
            }}
          >
            {label}
          </button>
        ))}
      </nav>
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
      {loading ? (
        <p className="mt-8">Cargando administración…</p>
      ) : (
        <>
          {tab === "amenidades" && (
            <AmenitiesPanel amenities={amenidades} onChange={reload} />
          )}
          {tab === "inventario" && (
            <section className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">
                    Inventario de habitaciones
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Cada número corresponde a un cuarto físico. Retirarlo
                    temporalmente conserva su registro.
                  </p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() =>
                    setUnitDraft({
                      numero: "",
                      catalogo: modelos[0]?.codigo ?? "",
                      activa: true,
                      estado: "disponible",
                    })
                  }
                >
                  Agregar habitación
                </button>
              </div>
              {unitDraft && (
                <form
                  className="mt-5 grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 sm:grid-cols-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (
                      await mutate(
                        () =>
                          api(
                            unitDraft.id
                              ? `/admin/inventario/${unitDraft.id}`
                              : "/admin/inventario",
                            {
                              method: unitDraft.id ? "PATCH" : "POST",
                              body: JSON.stringify(unitDraft),
                            },
                          ),
                        "Habitación guardada sin eliminar información.",
                      )
                    )
                      setUnitDraft(null);
                  }}
                >
                  <h3 className="font-bold sm:col-span-2">
                    {unitDraft.id ? "Editar habitación" : "Nueva habitación"}
                  </h3>
                  <label className="field-label">
                    Número de habitación
                    <input
                      className="field"
                      required
                      maxLength={20}
                      value={unitDraft.numero}
                      onChange={(e) =>
                        setUnitDraft({ ...unitDraft, numero: e.target.value })
                      }
                    />
                  </label>
                  <label className="field-label">
                    Modelo del catálogo
                    <select
                      className="field"
                      value={unitDraft.catalogo}
                      onChange={(e) =>
                        setUnitDraft({ ...unitDraft, catalogo: e.target.value })
                      }
                    >
                      {modelos.map((m) => (
                        <option key={m.codigo} value={m.codigo}>
                          {m.nombre}
                          {m.activa === false ? " (retirado)" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-label">
                    Estado
                    <select
                      className="field"
                      value={unitDraft.estado}
                      onChange={(e) =>
                        setUnitDraft({ ...unitDraft, estado: e.target.value })
                      }
                    >
                      {Object.entries(ESTADO_LABELS).map(([v, label]) => (
                        <option key={v} value={v}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={unitDraft.activa}
                      onChange={(e) =>
                        setUnitDraft({ ...unitDraft, activa: e.target.checked })
                      }
                    />
                    Habitación habilitada
                  </label>
                  <div className="flex gap-3 sm:col-span-2">
                    <button disabled={busy} className="btn-primary">
                      Guardar habitación
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setUnitDraft(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
              <label className="field-label mt-5 max-w-sm">
                Buscar por número o modelo
                <input
                  className="field"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ej. 101 o Suite"
                />
              </label>
              <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50">
                    <tr>
                      {[
                        "Número",
                        "Modelo",
                        "Estado",
                        "Habilitada",
                        "Acciones",
                      ].map((h) => (
                        <th key={h} className="px-4 py-3 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {unidades
                      .filter((u) =>
                        `${u.numero} ${u.nombre}`
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                      )
                      .map((u) => (
                        <tr key={u._id} className="border-t border-zinc-100">
                          <td className="px-4 py-3 font-semibold">
                            {u.numero}
                          </td>
                          <td className="px-4 py-3">{u.nombre}</td>
                          <td className="px-4 py-3">
                            {ESTADO_LABELS[u.estado]}
                          </td>
                          <td className="px-4 py-3">
                            {u.activa ? "Sí" : "Retirada temporalmente"}
                            {!u.catalogoActivo && " · Modelo retirado"}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              className="font-semibold text-brand underline"
                              onClick={() => {
                                setUnitDraft({
                                  id: u._id,
                                  numero: u.numero,
                                  catalogo: u.catalogo,
                                  activa: u.activa,
                                  estado: u.estado,
                                });
                                window.scrollTo({
                                  top: 180,
                                  behavior: "smooth",
                                });
                              }}
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {tab === "catalogo" && (
            <section className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Catálogo y fotografías</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Cada modelo reúne las fotos, el precio y los servicios de
                    sus habitaciones físicas.
                  </p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setDraft({ ...blank, fotos: [], amenidades: [] });
                    setEditing(false);
                    setPhoto("");
                  }}
                >
                  Agregar modelo
                </button>
              </div>
              {draft && (
                <form
                  onSubmit={saveCatalog}
                  className="mt-5 grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 sm:grid-cols-2"
                >
                  <h3 className="font-bold sm:col-span-2">
                    {editing ? "Editar modelo" : "Nuevo modelo"}
                  </h3>
                  <label className="field-label">
                    Código
                    <input
                      className="field"
                      required
                      disabled={editing}
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      maxLength={80}
                      value={draft.codigo}
                      onChange={(e) =>
                        setDraft({ ...draft, codigo: e.target.value })
                      }
                      placeholder="ejemplo-deluxe"
                    />
                  </label>
                  <label className="field-label">
                    Nombre
                    <input
                      className="field"
                      required
                      maxLength={120}
                      value={draft.nombre}
                      onChange={(e) =>
                        setDraft({ ...draft, nombre: e.target.value })
                      }
                    />
                  </label>
                  <label className="field-label">
                    Tipo
                    <select
                      className="field"
                      value={draft.tipo}
                      onChange={(e) =>
                        setDraft({ ...draft, tipo: e.target.value })
                      }
                    >
                      {ROOM_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field-label">
                    Precio por noche (Q)
                    <input
                      className="field"
                      type="number"
                      required
                      min={0}
                      step="0.01"
                      value={draft.precio}
                      onChange={(e) =>
                        setDraft({ ...draft, precio: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label className="field-label">
                    Adultos
                    <input
                      className="field"
                      required
                      type="number"
                      min={1}
                      value={draft.adultos}
                      onChange={(e) =>
                        setDraft({ ...draft, adultos: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label className="field-label">
                    Niños
                    <input
                      className="field"
                      required
                      type="number"
                      min={0}
                      value={draft.ninos}
                      onChange={(e) =>
                        setDraft({ ...draft, ninos: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label className="field-label sm:col-span-2">
                    Descripción
                    <textarea
                      className="field min-h-24"
                      required
                      maxLength={5000}
                      value={draft.descripcion}
                      onChange={(e) =>
                        setDraft({ ...draft, descripcion: e.target.value })
                      }
                    />
                  </label>
                  <fieldset className="sm:col-span-2">
                    <legend className="mb-2 text-sm font-semibold">
                      Amenidades
                    </legend>
                    <div className="flex flex-wrap gap-4">
                      {amenidades.map(({ codigo: id, nombre, descripcion }) => (
                        <label
                          key={id}
                          title={descripcion}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={draft.amenidades.includes(id)}
                            onChange={() =>
                              setDraft({
                                ...draft,
                                amenidades: draft.amenidades.includes(id)
                                  ? draft.amenidades.filter((a) => a !== id)
                                  : [...draft.amenidades, id],
                              })
                            }
                          />
                          {nombre}
                        </label>
                      ))}
                    </div>
                    {amenidades.length === 0 && (
                      <p className="text-sm text-zinc-500">
                        Agrega servicios en la sección Amenidades para
                        asignarlos aquí.
                      </p>
                    )}
                  </fieldset>
                  <div className="sm:col-span-2">
                    <label className="field-label">
                      Agregar fotografía por enlace o ruta
                      <input
                        className="field"
                        value={photo}
                        onChange={(e) => setPhoto(e.target.value)}
                        placeholder="https://… o /rooms/sencilla.jpg"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={!photo.trim() || draft.fotos.length >= 10}
                      className="btn-secondary mt-2"
                      onClick={() => {
                        setDraft({
                          ...draft,
                          fotos: [...draft.fotos, photo.trim()],
                        });
                        setPhoto("");
                      }}
                    >
                      Añadir fotografía
                    </button>
                    <p className="mt-2 text-xs text-zinc-500">
                      De 1 a 10 imágenes. Puedes usar las imágenes existentes en
                      /rooms/ o enlaces públicos.
                    </p>
                    <ul className="mt-3 space-y-2">
                      {draft.fotos.map((f, i) => (
                        <li
                          key={`${f}-${i}`}
                          className="flex items-center justify-between gap-3 rounded-md bg-zinc-50 p-2 text-sm"
                        >
                          <span className="min-w-0 truncate">
                            {i + 1}. {f}
                          </span>
                          <button
                            type="button"
                            className="shrink-0 text-red-700 underline"
                            aria-label={`Quitar fotografía ${i + 1}`}
                            onClick={() =>
                              setDraft({
                                ...draft,
                                fotos: draft.fotos.filter((_, n) => n !== i),
                              })
                            }
                          >
                            Quitar
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-3 sm:col-span-2">
                    <button disabled={busy} className="btn-primary">
                      Guardar modelo
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setDraft(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {modelos.map((m) => (
                  <article
                    key={m.codigo}
                    className="overflow-hidden rounded-lg border border-zinc-200 bg-white"
                  >
                    <Gallery photos={m.fotos} name={m.nombre} />
                    <div className="space-y-3 p-4">
                      <h3 className="font-bold">{m.nombre}</h3>
                      <p className="text-sm text-zinc-500">
                        {m.tipo} · Q{m.precioPorNoche} / noche
                      </p>
                      <p className="text-sm">
                        {m.activa === false
                          ? "Retirado temporalmente"
                          : "Habilitado"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            setDraft({
                              codigo: m.codigo,
                              nombre: m.nombre,
                              tipo: m.tipo,
                              adultos: m.capacidad.adultos,
                              ninos: m.capacidad.ninos,
                              precio: m.precioPorNoche,
                              descripcion: m.descripcion,
                              fotos: m.fotos,
                              amenidades: m.amenidades,
                            });
                            setEditing(true);
                            setPhoto("");
                            window.scrollTo({ top: 180, behavior: "smooth" });
                          }}
                        >
                          Editar información
                        </button>
                        <button
                          disabled={busy}
                          className="btn-secondary"
                          onClick={() =>
                            mutate(
                              () =>
                                api(`/admin/catalogo/${m.codigo}`, {
                                  method: "PATCH",
                                  body: JSON.stringify({
                                    activa: m.activa === false,
                                  }),
                                }),
                              m.activa === false
                                ? "Modelo habilitado."
                                : "Modelo retirado del catálogo público; sus datos se conservaron.",
                            )
                          }
                        >
                          {m.activa === false
                            ? "Habilitar"
                            : "Retirar temporalmente"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
          {tab === "usuarios" && (
            <section className="mt-6">
              <h2 className="text-xl font-bold">Usuarios y roles</h2>
              <p className="mt-2 text-sm text-zinc-500">
                Los nuevos registros son clientes. Solo administración puede
                asignar roles de personal. Al cambiar un rol, se cierran las
                sesiones de ese usuario.
              </p>
              <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="p-4">Nombre</th>
                      <th className="p-4">Correo</th>
                      <th className="p-4">Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u._id} className="border-t border-zinc-100">
                        <td className="p-4">
                          {u.nombre}
                          {u._id === cuentaId && " (tú)"}
                        </td>
                        <td className="p-4">{u.correo}</td>
                        <td className="p-4">
                          <select
                            aria-label={`Rol de ${u.nombre}`}
                            className="field"
                            value={u.rol}
                            disabled={u._id === cuentaId || busy}
                            onChange={(e) =>
                              mutate(
                                () =>
                                  api(`/admin/usuarios/${u._id}/rol`, {
                                    method: "PATCH",
                                    body: JSON.stringify({
                                      rol: e.target.value,
                                    }),
                                  }),
                                "Rol actualizado.",
                              )
                            }
                          >
                            {Object.entries(ROLE_LABELS).map(([v, label]) => (
                              <option key={v} value={v}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
