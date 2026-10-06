import Link from "next/link";
import { Gallery } from "@/components/gallery";
import { AmenityIcon } from "@/components/icons";
import { capacityLabel, formatPrice, type Room } from "@/lib/rooms";

export function RoomCard({ room }: { room: Room }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <Gallery photos={room.fotos} name={room.nombre} />
      <div className="space-y-4 p-5">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{room.nombre}</h2>
          <p className="mt-1 text-zinc-500">Capacidad: {capacityLabel(room.adultos, room.ninos)}</p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {room.amenidades.map((amenity) => (
            <li
              key={amenity}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500"
            >
              <AmenityIcon id={amenity} />
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between gap-4">
          <p className="text-lg">
            <span className="font-semibold">{formatPrice(room.precio)}</span>
            <span className="text-zinc-500"> / noche</span>
          </p>
          <Link
            href={`/habitacion/${room.id}`}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Ver más
          </Link>
        </div>
      </div>
    </article>
  );
}
