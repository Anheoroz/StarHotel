"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import type { Room } from "@/lib/rooms";
import { leerSesionTexto, sesionDesdeTexto, solicitar, suscribirSesion, type Rol, type Sesion } from "@/lib/sesion";

const TIPOS = ["Sencilla", "Doble", "Suite"] as const;
const ficha = "grid gap-4 border border-line bg-white p-7 shadow-[0_22px_55px_rgba(26,26,26,0.08)]";
const campo = "border border-line bg-white px-3 py-2.5";
const accion = "bg-brand px-4 py-3 text-[0.72rem] tracking-[0.16em] text-white uppercase";

function SelectorArchivo({ nombre, onElegir }: { nombre: string; onElegir: (nombre: string) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-4 border border-line bg-[#f6f3ee] px-4 py-3.5">
      <input
        name="foto"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => onElegir(event.target.files?.[0]?.name ?? "")}
      />
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center bg-brand text-white" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
          <path d="M3 7.5h6l2 2.5h10V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7.5z" />
          <path d="M3 7.5V6a1 1 0 0 1 1-1h4l2 2.5" />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block text-[0.72rem] tracking-[0.16em] text-brand uppercase">{nombre ? "Archivo elegido" : "Elegir archivo"}</span>
        <span className="mt-1 block truncate text-sm text-stone-600">{nombre || "Abre el Finder y elige una fotografía"}</span>
      </span>
    </label>
  );
}

type Permisos = {
  verInventario: boolean;
  verEstado: boolean;
  editar: boolean;
};

function permisosDe(rol: Rol): Permisos {
  switch (rol) {
    case "administrador":
      return { verInventario: true, verEstado: true, editar: true };
    case "recepcion":
      return { verInventario: true, verEstado: true, editar: false };
    case "mantenimiento":
      return { verInventario: false, verEstado: true, editar: false };
    case "huesped":
      return { verInventario: false, verEstado: false, editar: false };
    default: {
      const desconocido: never = rol;
      return desconocido;
    }
  }
}

export function StaffPanel() {
  const router = useRouter();
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [habitaciones, setHabitaciones] = useState<Room[]>([]);
  const [seleccion, setSeleccion] = useState<string>("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [fotoNombre, setFotoNombre] = useState("");

  useEffect(() => {
    const sincronizar = () => {
      const actual = sesionDesdeTexto(leerSesionTexto());
      if (!actual) {
        setSesion(null);
        router.replace("/entrar");
        return;
      }
      setSesion(actual);
    };
    sincronizar();
    return suscribirSesion(sincronizar);
  }, [router]);

  useEffect(() => {
    if (!sesion || !permisosDe(sesion.usuario.rol).verEstado) {
      return;
    }
    solicitar<Room[]>(`/api/habitaciones?incluirInactivas=true`, sesion.token)
      .then(setHabitaciones)
      .catch((causa: Error) => setError(causa.message));
  }, [sesion]);

  if (!sesion) {
    return null;
  }

  const permisos = permisosDe(sesion.usuario.rol);
  const actual = habitaciones.find((habitacion) => habitacion.id === seleccion) ?? null;

  async function recargar() {
    if (!sesion) {
      return;
    }
    setHabitaciones(await solicitar<Room[]>("/api/habitaciones?incluirInactivas=true", sesion.token));
  }

  async function crear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sesion) {
      return;
    }
    const datos = new FormData(event.currentTarget);
    setError("");
    try {
      const creada = await solicitar<Room>("/api/habitaciones", sesion.token, {
        method: "POST",
        body: JSON.stringify({
          codigo: datos.get("codigo"),
          nombre: datos.get("nombre"),
          tipo: datos.get("tipo"),
          activa: true,
        }),
      });
      event.currentTarget.reset();
      setSeleccion(creada.id);
      setMensaje("Habitación creada.");
      await recargar();
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No se pudo crear la habitación.");
    }
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sesion || !actual) {
      return;
    }
    const datos = new FormData(event.currentTarget);
    setError("");
    try {
      await solicitar<Room>(`/api/habitaciones/${actual.id}`, sesion.token, {
        method: "PATCH",
        body: JSON.stringify({
          nombre: datos.get("nombre"),
          tipo: datos.get("tipo"),
          descripcion: datos.get("descripcion"),
          precio: Number(datos.get("precio")),
          activa: datos.get("activa") === "on",
        }),
      });
      setMensaje("Habitación actualizada.");
      await recargar();
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No se pudo actualizar la habitación.");
    }
  }

  async function agregarFoto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sesion || !actual) {
      return;
    }
    const datos = new FormData(event.currentTarget);
    const archivo = datos.get("foto");
    const cuerpo = archivo instanceof File && archivo.size > 0 ? datos : JSON.stringify({ url: datos.get("url") });
    setError("");
    try {
      await solicitar<Room>(`/api/habitaciones/${actual.id}/fotos`, sesion.token, {
        method: "POST",
        body: cuerpo,
      });
      event.currentTarget.reset();
      setFotoNombre("");
      setMensaje("Fotografía agregada.");
      await recargar();
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No se pudo agregar la fotografía.");
    }
  }

  async function quitarFoto(url: string) {
    if (!sesion || !actual) {
      return;
    }
    setError("");
    try {
      await solicitar<Room>(`/api/habitaciones/${actual.id}/fotos`, sesion.token, {
        method: "DELETE",
        body: JSON.stringify({ url }),
      });
      setMensaje("Fotografía quitada.");
      await recargar();
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No se pudo quitar la fotografía.");
    }
  }

  async function crearPersonal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sesion) {
      return;
    }
    const datos = new FormData(event.currentTarget);
    setError("");
    try {
      await solicitar("/api/usuarios", sesion.token, {
        method: "POST",
        body: JSON.stringify({
          nombre: datos.get("nombre"),
          correo: datos.get("correo"),
          contrasena: datos.get("contrasena"),
          rol: datos.get("rol"),
        }),
      });
      event.currentTarget.reset();
      setMensaje("Cuenta de personal creada.");
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No se pudo crear la cuenta.");
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-14">
        <h1 className="font-display text-5xl text-black italic">Panel de {sesion.usuario.nombre}</h1>
        {!permisos.verEstado ? (
          <p>Esta pantalla no está disponible para tu perfil.</p>
        ) : (
          <>
            {mensaje ? <p className="text-sm text-brand">{mensaje}</p> : null}
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <ul className="divide-y divide-line border border-line bg-white shadow-[0_22px_55px_rgba(26,26,26,0.08)]">
              {habitaciones.map((habitacion) => (
                <li key={habitacion.id} className="flex items-center justify-between gap-4 px-6 py-4 text-sm">
                  <div>
                    <p className="font-medium">{habitacion.nombre}</p>
                    <p className="text-zinc-500">
                      {habitacion.activa ? "Habilitada" : "Deshabilitada"}
                      {permisos.verInventario ? ` · ${habitacion.tipo} · Q${habitacion.precio}` : ""}
                    </p>
                  </div>
                  {permisos.editar ? (
                    <button type="button" className="text-brand" onClick={() => setSeleccion(habitacion.id)}>
                      Editar
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </>
        )}
        {permisos.editar ? (
          <>
            <form onSubmit={crear} className={ficha}>
              <h2 className="font-display text-3xl italic">Nueva habitación</h2>
              <input name="codigo" placeholder="Código" className={campo} required />
              <input name="nombre" placeholder="Nombre" className={campo} required />
              <select name="tipo" className={campo}>
                {TIPOS.map((tipo) => (
                  <option key={tipo}>{tipo}</option>
                ))}
              </select>
              <button className={accion}>Crear</button>
            </form>
            {actual ? (
              <form key={actual.id} onSubmit={guardar} className={ficha}>
                <h2 className="font-display text-3xl italic">Editar {actual.nombre}</h2>
                <input name="nombre" defaultValue={actual.nombre} className={campo} required />
                <select name="tipo" defaultValue={actual.tipo} className={campo}>
                  {TIPOS.map((tipo) => (
                    <option key={tipo}>{tipo}</option>
                  ))}
                </select>
                <textarea name="descripcion" defaultValue={actual.descripcion} rows={4} className={campo} />
                <input name="precio" type="number" min="0" step="1" defaultValue={actual.precio} className={campo} />
                <label className="flex items-center gap-2 text-sm">
                  <input name="activa" type="checkbox" defaultChecked={actual.activa} />
                  Habilitada
                </label>
                <button className={accion}>Guardar</button>
              </form>
            ) : null}
            {actual ? (
              <section className={ficha}>
                <h2 className="font-display text-3xl italic">Fotografías</h2>
                <ul className="grid gap-3">
                  {actual.fotos.map((foto) => (
                    <li key={foto} className="flex items-center justify-between gap-4 border border-line bg-[#f6f3ee] p-2">
                      <img src={foto} alt="" className="h-16 w-24 object-cover" />
                      <button type="button" className="px-3 text-[0.72rem] tracking-[0.14em] text-brand uppercase" onClick={() => quitarFoto(foto)}>
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
                <form onSubmit={agregarFoto} className="grid gap-3">
                  <SelectorArchivo nombre={fotoNombre} onElegir={setFotoNombre} />
                  <input name="url" placeholder="O pega una dirección de imagen" className={campo} />
                  <button className={accion}>Agregar fotografía</button>
                </form>
              </section>
            ) : null}
            <form onSubmit={crearPersonal} className={ficha}>
              <h2 className="font-display text-3xl italic">Cuenta de personal</h2>
              <input name="nombre" placeholder="Nombre" required className={campo} />
              <input name="correo" type="email" placeholder="Correo" required className={campo} />
              <input name="contrasena" type="password" placeholder="Contraseña" required className={campo} />
              <select name="rol" className={campo}>
                <option value="administrador">Administrador</option>
                <option value="recepcion">Recepción</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
              <button className={accion}>Crear cuenta</button>
            </form>
          </>
        ) : null}
      </main>
    </>
  );
}
