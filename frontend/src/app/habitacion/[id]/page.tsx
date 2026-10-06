import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/gallery";
import { AmenityIcon } from "@/components/icons";
import { ReservationBar } from "@/components/reservation-bar";
import { SiteHeader } from "@/components/site-header";
import { fetchRoom } from "@/lib/api";
import { AMENITY_LABELS, capacityLabel, formatPrice } from "@/lib/rooms";

type HabitacionPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: HabitacionPageProps): Promise<Metadata> {
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

export default async function HabitacionPage({ params }: HabitacionPageProps) {
  const { id } = await params;
  let room;
  try {
    room = await fetchRoom(id);
  } catch {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold">No se pudo cargar la habitación</h1>
          <p className="mt-3 text-zinc-500">La API tiene que estar en marcha en el puerto 4000.</p>
        </main>
      </>
    );
  }
  if (!room) {
    notFound();
  }

  return (
    <>
      <SiteHeader title={`Detalles Habitación No. ${room.id}`} />
      <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-44">
        <h1 className="text-3xl font-semibold tracking-tight">{room.nombre}</h1>
        <p className="mt-2 text-zinc-500">{capacityLabel(room.adultos, room.ninos)}</p>
        <div className="mt-6">
          <Gallery photos={room.fotos} name={room.nombre} rounded />
        </div>
        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Descripción</h2>
          <p className="mt-3 leading-7 text-zinc-600">{room.descripcion}</p>
          <p className="mt-4 text-lg">
            <span className="font-semibold">{formatPrice(room.precio)}</span>
            <span className="text-zinc-500"> / noche</span>
          </p>
        </section>
        <section className="mt-8">
          <h2 className="text-2xl font-semibold">Amenidades y servicios</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {room.amenidades.map((amenity) => (
              <li key={amenity} className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 text-brand">
                  <AmenityIcon id={amenity} />
                </span>
                {AMENITY_LABELS[amenity]}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <ReservationBar />
    </>
  );
}
