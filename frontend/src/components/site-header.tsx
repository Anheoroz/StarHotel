"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountNav } from "@/components/account-nav";
import { BedIcon, BuildingIcon, HomeIcon } from "@/components/icons";

type SiteHeaderProps = {
  title?: string;
};

export function SiteHeader({ title = "HOTEL 5 ESTRELLAS" }: SiteHeaderProps) {
  const pathname = usePathname();
  const roomsActive =
    pathname === "/habitaciones" || pathname.startsWith("/habitacion/");
  function navClass(active: boolean) {
    return `flex items-center gap-1.5 rounded-md px-2 py-2 font-medium transition ${active ? "bg-brand/5 text-brand" : "text-zinc-500 hover:text-brand"}`;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold tracking-wide text-brand sm:text-xl"
        >
          <BuildingIcon />
          <span>{title}</span>
        </Link>
        <nav
          aria-label="Navegación principal"
          className="flex flex-wrap items-center gap-1 text-sm sm:gap-2"
        >
          <Link
            href="/"
            aria-label="Inicio"
            aria-current={pathname === "/" ? "page" : undefined}
            title="Inicio"
            className={navClass(pathname === "/")}
          >
            <HomeIcon />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
          <Link
            href="/reservar"
            aria-current={pathname === "/reservar" ? "page" : undefined}
            className={navClass(pathname === "/reservar")}
          >
            Reservar
          </Link>
          <Link
            href="/habitaciones"
            aria-label="Habitaciones"
            aria-current={roomsActive ? "page" : undefined}
            title="Habitaciones"
            className={navClass(roomsActive)}
          >
            <BedIcon />
            <span className="hidden sm:inline">Habitaciones</span>
          </Link>
          <AccountNav />
        </nav>
      </div>
    </header>
  );
}
