import Link from "next/link";
import { Gallery } from "@/components/gallery";
import { capacityLabel, formatPrice, type Room } from "@/lib/rooms";

export function RoomCard({ room }: { room: Room }) {
  return (
    <article className="group">
      <Gallery photos={room.fotos} name={room.nombre} />
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] tracking-[0.16em] text-stone-500 uppercase">{room.tipo}</p>
          <h3 className="mt-1 font-display text-4xl leading-none italic">{room.nombre}</h3>
          <p className="mt-1 text-sm text-stone-500">{capacityLabel(room.adultos, room.ninos)}</p>
        </div>
        <p className="pt-6 text-right">
          <span className="font-medium">{formatPrice(room.precio)}</span>
          <span className="block text-xs tracking-[0.12em] text-stone-500 uppercase">por noche</span>
        </p>
      </div>
      <Link href={`/habitacion/${room.id}`} className="mt-5 inline-flex items-center gap-2 text-[0.72rem] tracking-[0.18em] text-brand uppercase">
        Ver habitación
        <span className="transition duration-300 group-hover:translate-x-1">→</span>
      </Link>
    </article>
  );
}
