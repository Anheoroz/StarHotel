import Link from "next/link";
import { Gallery } from "@/components/gallery";
import { AmenityIcon } from "@/components/icons";
import {
  AMENITY_LABELS,
  capacityLabel,
  formatPrice,
  type Room,
} from "@/lib/rooms";

export function RoomCard({ room }: { room: Room }) {
  return (
    <article className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm">
      <Gallery photos={room.fotos} name={room.nombre} />
      <div className="space-y-3 p-5">
        <div>
          <h2 className="text-[19px] font-bold">{room.nombre}</h2>
          <p className="mt-1 text-xs font-medium text-brand">{room.tipo}</p>
          <p className="mt-2 text-[15px] text-zinc-500">
            Capacidad: {capacityLabel(room.adultos, room.ninos)}
          </p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {room.amenidades.slice(0, 5).map((amenity) => (
            <li
              key={amenity}
              title={AMENITY_LABELS[amenity]}
              aria-label={AMENITY_LABELS[amenity]}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-zinc-500"
            >
              <AmenityIcon id={amenity} />
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between gap-4">
          <p className="text-[15px]">
            <span className="text-[19px] font-bold">
              {formatPrice(room.precio)}
            </span>
            <span className="text-zinc-500"> / noche</span>
          </p>
          <Link
            href={`/habitacion/${room.id}`}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Ver más
          </Link>
        </div>
      </div>
    </article>
  );
}
