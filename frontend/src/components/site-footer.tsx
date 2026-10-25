import Link from "next/link";
import { BuildingIcon } from "@/components/icons";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-9 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-bold text-brand"
          >
            <BuildingIcon /> Star Hotel
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">
            Un espacio para descansar y disfrutar tu estancia en la Ciudad de
            Guatemala.
          </p>
          <p className="mt-4 text-xs font-medium text-zinc-500">
            Zona 10 · Ciudad de Guatemala
          </p>
        </div>
        <nav aria-label="Enlaces del pie de página">
          <h2 className="text-sm font-bold">Explora el hotel</h2>
          <ul className="mt-4 space-y-3 text-sm text-zinc-500">
            <li>
              <Link href="/" className="hover:text-brand">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/habitaciones" className="hover:text-brand">
                Habitaciones
              </Link>
            </li>
            <li>
              <Link href="/reservar" className="hover:text-brand">
                Reservar una estancia
              </Link>
            </li>
            <li>
              <Link href="/#preguntas" className="hover:text-brand">
                Preguntas frecuentes
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className="text-sm font-bold">Para tu llegada</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <dt className="text-zinc-500">Ingreso</dt>
              <dd className="font-medium">Desde las 15:00</dd>
            </div>
            <div className="flex items-center gap-3">
              <dt className="text-zinc-500">Salida</dt>
              <dd className="font-medium">Hasta las 12:00</dd>
            </div>
          </dl>
          <Link
            href="/acceso"
            className="mt-5 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Accede a tu cuenta →
          </Link>
        </div>
      </div>
      <div className="border-t border-zinc-100 px-4 py-5 text-center text-xs text-zinc-500">
        Star Hotel · Grupo No. 1
      </div>
    </footer>
  );
}
