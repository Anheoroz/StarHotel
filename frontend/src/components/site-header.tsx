import Link from "next/link";
import { BedIcon, BuildingIcon, HomeIcon } from "@/components/icons";

type SiteHeaderProps = {
  title?: string;
};

export function SiteHeader({ title = "HOTEL 5 ESTRELLAS" }: SiteHeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-wide text-brand sm:text-base"
        >
          <BuildingIcon />
          <span>{title}</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/" className="flex items-center gap-1.5 font-medium text-brand">
            <HomeIcon />
            Inicio
          </Link>
          <Link
            href="/#habitaciones"
            className="flex items-center gap-1.5 font-medium text-zinc-500"
          >
            <BedIcon />
            Habitaciones
          </Link>
        </nav>
      </div>
    </header>
  );
}
