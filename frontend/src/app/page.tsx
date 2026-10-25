import type { Metadata } from "next";
import { HomeContent } from "@/components/home-content";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { fetchRooms } from "@/lib/api";
import { roomAmenity } from "@/lib/rooms";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "Conoce Star Hotel en Ciudad de Guatemala. Descubre sus espacios, encuentra tu habitación y consulta disponibilidad para tu estancia.",
};

export default async function HomePage() {
  const rooms = await fetchRooms().catch(() => []);
  const amenities = [
    ...new Map(
      rooms.flatMap((room) =>
        room.amenidades.map((id) => [id, roomAmenity(room, id)] as const),
      ),
    ).values(),
  ];

  return (
    <>
      <SiteHeader />
      <main>
        <HomeContent rooms={rooms} amenities={amenities} />
      </main>
      <SiteFooter />
    </>
  );
}
