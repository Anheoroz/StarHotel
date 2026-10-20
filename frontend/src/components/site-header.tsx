"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HotelMark } from "@/components/hotel-mark";
import { cerrarSesion, leerSesionTexto, sesionDesdeTexto, suscribirSesion, type Rol, type Sesion } from "@/lib/sesion";

function etiquetaRol(rol: Rol): string {
  switch (rol) {
    case "administrador":
      return "Administración";
    case "recepcion":
      return "Recepción";
    case "mantenimiento":
      return "Mantenimiento";
    case "huesped":
      return "Huésped";
    default: {
      const desconocido: never = rol;
      return desconocido;
    }
  }
}

function puedeVerPanel(rol: Rol): boolean {
  switch (rol) {
    case "administrador":
    case "recepcion":
    case "mantenimiento":
      return true;
    case "huesped":
      return false;
    default: {
      const desconocido: never = rol;
      return desconocido;
    }
  }
}

const enlaces = [
  { href: "/", texto: "Inicio" },
  { href: "/#habitaciones", texto: "Habitaciones" },
  { href: "/#ofertas", texto: "Ofertas" },
  { href: "/#eventos", texto: "Eventos" },
  { href: "/#la-casa", texto: "La casa" },
] as const;

export function SiteHeader() {
  const router = useRouter();
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const leer = () => setSesion(sesionDesdeTexto(leerSesionTexto()));
    leer();
    return suscribirSesion(leer);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-[#f6f3ee]/88 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3.5">
        <HotelMark />
        <button
          type="button"
          className="text-[0.72rem] tracking-[0.18em] uppercase lg:hidden"
          aria-expanded={abierto}
          onClick={() => setAbierto((valor) => !valor)}
        >
          Menú
        </button>
        <nav className={`${abierto ? "flex" : "hidden"} absolute inset-x-0 top-full z-30 flex-col gap-4 border-b border-line bg-[#f6f3ee] px-5 py-5 lg:static lg:flex lg:flex-row lg:items-center lg:gap-6 lg:border-0 lg:bg-transparent lg:p-0`}>
          {enlaces.map((enlace) => (
            <Link key={enlace.href} href={enlace.href} className="nav-link text-[0.68rem] tracking-[0.18em] text-stone-700 uppercase" onClick={() => setAbierto(false)}>
              {enlace.texto}
            </Link>
          ))}
          {sesion && puedeVerPanel(sesion.usuario.rol) ? (
            <Link href="/panel" className="nav-link text-[0.68rem] tracking-[0.18em] text-stone-700 uppercase" onClick={() => setAbierto(false)}>
              Panel
            </Link>
          ) : null}
          {sesion ? (
            <button
              type="button"
              className="rounded-full border border-brand px-4 py-2 text-[0.68rem] tracking-[0.16em] text-brand uppercase transition hover:bg-brand hover:text-white"
              onClick={() => {
                cerrarSesion();
                router.push("/");
              }}
            >
              Salir · {etiquetaRol(sesion.usuario.rol)}
            </button>
          ) : (
            <Link href="/entrar" className="rounded-full border border-brand px-4 py-2 text-center text-[0.68rem] tracking-[0.16em] text-brand uppercase transition hover:bg-brand hover:text-white">
              Ingresar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
