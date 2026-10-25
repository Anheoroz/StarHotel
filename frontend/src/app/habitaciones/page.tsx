import type { Metadata } from "next";
import Link from "next/link";
import { Catalog } from "@/components/catalog";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { fetchAvailability, fetchRooms } from "@/lib/api";
import { fechaParametro } from "@/lib/reservas";
import { emptyFilters, type RoomFilters } from "@/lib/rooms";

export const metadata: Metadata = {
  title: "Habitaciones disponibles",
  description:
    "Explora las habitaciones de Star Hotel y consulta disponibilidad por fechas, huéspedes, precio y servicios.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HabitacionesPage({ searchParams }: Props) {
  const params = await searchParams;
  const ingreso = fechaParametro(params.ingreso);
  const salida = fechaParametro(params.salida);
  const guests = typeof params.huespedes === "string" ? params.huespedes : "";
  let initialError = "";
  if (
    (params.ingreso && !ingreso) ||
    (params.salida && !salida) ||
    Boolean(ingreso) !== Boolean(salida)
  )
    initialError = "Selecciona fechas válidas de ingreso y salida.";
  if (guests && (!Number.isSafeInteger(Number(guests)) || Number(guests) < 1))
    initialError = "Indica una cantidad válida de huéspedes por habitación.";

  const filters: RoomFilters = {
    ...emptyFilters,
    checkIn: ingreso,
    checkOut: salida,
    guests:
      guests && Number.isSafeInteger(Number(guests)) && Number(guests) > 0
        ? guests
        : "",
  };
  const [rooms, availability] = await Promise.allSettled([
    fetchRooms(),
    ingreso && salida && !initialError
      ? fetchAvailability(ingreso, salida)
      : Promise.resolve(null),
  ]);

  if (rooms.status === "rejected")
    return (
      <>
        <SiteHeader />
        <main className="mx-auto min-h-[55vh] max-w-xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">No se pudo cargar el catálogo</h1>
          <p className="mt-3 leading-7 text-zinc-500">
            Inténtalo de nuevo en unos instantes para consultar las
            habitaciones.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <form action="/habitaciones" method="get">
              <button className="btn-primary">Volver a intentar</button>
            </form>
            <Link href="/" className="btn-secondary">
              Volver al inicio
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );

  if (availability.status === "rejected")
    initialError =
      availability.reason instanceof Error
        ? availability.reason.message
        : "No se pudo consultar la disponibilidad. Vuelve a intentarlo.";
  const availableCatalogs =
    availability.status === "fulfilled" && availability.value
      ? [
          ...new Set(
            availability.value.habitaciones.map((room) => room.catalogo),
          ),
        ]
      : null;

  return (
    <>
      <SiteHeader />
      <main>
        <Catalog
          key={JSON.stringify(params)}
          rooms={rooms.value}
          initialFilters={filters}
          initialAvailableCatalogs={availableCatalogs}
          initialError={initialError}
        />
      </main>
      <SiteFooter />
    </>
  );
}
