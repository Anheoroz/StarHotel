import Link from "next/link";
import { AccountNav } from "@/components/account-nav";
import { BedIcon, BuildingIcon, HomeIcon } from "@/components/icons";

type SiteHeaderProps = {
  title?: string;
};

export function SiteHeader({ title = "HOTEL 5 ESTRELLAS" }: SiteHeaderProps) {
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
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            aria-label="Inicio"
            className="flex items-center gap-1.5 px-2 py-2 font-medium text-brand"
          >
            <HomeIcon />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
          <Link
            href="/#habitaciones"
            aria-label="Habitaciones"
            className="flex items-center gap-1.5 px-2 py-2 font-medium text-zinc-500"
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
