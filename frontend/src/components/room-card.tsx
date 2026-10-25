import Link from "next/link";
import { Gallery } from "@/components/gallery";
import { AmenityIcon } from "@/components/icons";
import {
  capacityLabel,
  formatPrice,
  roomAmenity,
  type Room,
} from "@/lib/rooms";

export function RoomCard({
  room,
  ingreso,
  salida,
}: {
  room: Room;
  ingreso?: string;
  salida?: string;
}) {
  const fechas =
    ingreso && salida ? `?${new URLSearchParams({ ingreso, salida })}` : "";
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
              title={roomAmenity(room, amenity).nombre}
              aria-label={roomAmenity(room, amenity).nombre}
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
            href={`/habitacion/${room.id}${fechas}`}
            className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Ver más
          </Link>
        </div>
      </div>
    </article>
  );
}
