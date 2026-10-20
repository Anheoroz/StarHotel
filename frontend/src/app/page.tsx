import { Suspense } from "react";
import { Catalog } from "@/components/catalog";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { fetchRooms } from "@/lib/api";

async function RoomCatalog() {
  try {
    const rooms = await fetchRooms();
    return <Catalog rooms={rooms} />;
  } catch {
    return (
      <p className="mx-auto max-w-3xl px-4 py-16 text-center text-zinc-500">
        El servicio de habitaciones no está disponible.
      </p>
    );
  }
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        <Suspense
          fallback={
            <p className="mx-auto max-w-6xl px-5 py-16 text-center text-stone-500">
              Cargando habitaciones…
            </p>
          }
        >
          <RoomCatalog />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
