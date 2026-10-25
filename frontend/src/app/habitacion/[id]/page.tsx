import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/gallery";
import { AmenityIcon } from "@/components/icons";
import { ReservationBar } from "@/components/reservation-bar";
import { SiteHeader } from "@/components/site-header";
import { fetchRoom } from "@/lib/api";
import { capacityLabel, formatPrice, roomAmenity } from "@/lib/rooms";
import { fechaParametro } from "@/lib/reservas";

type HabitacionPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: HabitacionPageProps): Promise<Metadata> {
  const { id } = await params;
  const room = await fetchRoom(id).catch(() => null);
  if (!room) {
    return { title: "Habitación no encontrada" };
  }
  return {
    title: room.nombre,
    description: room.descripcion,
  };
}

export default async function HabitacionPage({
  params,
  searchParams,
}: HabitacionPageProps) {
  const [{ id }, fechas] = await Promise.all([params, searchParams]);
  const ingreso = fechaParametro(fechas.ingreso);
  const salida = fechaParametro(fechas.salida);
  let room;
  try {
    room = await fetchRoom(id);
  } catch {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold">
            No se pudo cargar la habitación
          </h1>
          <p className="mt-3 text-zinc-500">
            La API tiene que estar en marcha en el puerto 4000.
          </p>
        </main>
      </>
    );
  }
  if (!room) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-44 sm:px-6">
        <h1 className="text-[26px] font-bold sm:text-[28px]">{room.nombre}</h1>
        <p className="mt-2 text-zinc-500">
          {capacityLabel(room.adultos, room.ninos)}
        </p>
        <div className="mt-6">
          <Gallery photos={room.fotos} name={room.nombre} rounded />
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="text-2xl font-semibold">Descripción</h2>
            <p className="mt-3 leading-7 text-zinc-600">{room.descripcion}</p>
            <p className="mt-4 text-lg">
              <span className="font-semibold">{formatPrice(room.precio)}</span>
              <span className="text-zinc-500"> / noche</span>
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold">Amenidades y servicios</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {room.amenidades.map((amenity) => (
                <li key={amenity} className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 text-brand">
                    <AmenityIcon id={amenity} />
                  </span>
                  <span>
                    <span className="font-medium">
                      {roomAmenity(room, amenity).nombre}
                    </span>
                    {roomAmenity(room, amenity).descripcion && (
                      <span className="mt-1 block text-sm text-zinc-500">
                        {roomAmenity(room, amenity).descripcion}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <ReservationBar
        key={`${room.id}-${ingreso}-${salida}`}
        catalogo={room.id}
        ingresoInicial={ingreso}
        salidaInicial={salida}
      />
    </>
  );
}
