import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/gallery";
import { AmenityIcon } from "@/components/icons";
import { ReservationBar } from "@/components/reservation-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { fetchRoom } from "@/lib/api";
import { AMENITY_LABELS, capacityLabel, formatPrice } from "@/lib/rooms";

type HabitacionPageProps = {
  params: Promise<{ id: string }>;
};

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

async function HabitacionContent({ params }: HabitacionPageProps) {
  const { id } = await params;
  let room;
  try {
    room = await fetchRoom(id);
  } catch {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-5 py-16 text-center">
          <h1 className="text-2xl font-semibold">No se pudo cargar la habitación</h1>
          <p className="mt-3 text-zinc-500">El servicio de habitaciones no está disponible.</p>
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
      <main className="mx-auto w-full max-w-6xl px-5 py-10">
        <p className="text-[0.68rem] tracking-[0.16em] text-stone-500 uppercase">{room.tipo}</p>
        <h1 className="mt-2 font-display text-5xl italic md:text-6xl">{room.nombre}</h1>
        <p className="mt-2 text-stone-500">{capacityLabel(room.adultos, room.ninos)}</p>
        <ReservationBar />
        <div className="mt-8">
          <Gallery photos={room.fotos} name={room.nombre} />
        </div>
        <section className="mt-10 grid gap-10 md:grid-cols-[1.4fr_0.8fr]">
          <div>
            <h2 className="font-display text-3xl">La habitación</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">{room.descripcion}</p>
          </div>
          <p className="md:text-right">
            <span className="font-display text-4xl">{formatPrice(room.precio)}</span>
            <span className="mt-1 block text-[0.68rem] tracking-[0.16em] text-stone-500 uppercase">por noche</span>
          </p>
        </section>
        <section className="mt-12">
          <h2 className="font-display text-3xl">Servicios</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {room.amenidades.map((amenity) => (
              <li key={amenity} className="flex items-center gap-3 border-b border-line py-3">
                <AmenityIcon id={amenity} />
                {AMENITY_LABELS[amenity]}
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export default function HabitacionPage({ params }: HabitacionPageProps) {
  return (
    <Suspense
      fallback={
        <>
          <SiteHeader />
          <p className="mx-auto max-w-6xl px-5 py-16 text-center text-stone-500">
            Cargando habitación…
          </p>
        </>
      }
    >
      <HabitacionContent params={params} />
    </Suspense>
  );
}
