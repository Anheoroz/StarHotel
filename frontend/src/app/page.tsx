import { Catalog } from "@/components/catalog";
import { SiteHeader } from "@/components/site-header";
import { fetchRooms } from "@/lib/api";

export default async function HomePage() {
  let rooms;
  try {
    rooms = await fetchRooms();
  } catch {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold">No se pudo cargar el catálogo</h1>
          <p className="mt-3 text-zinc-500">
            La API tiene que estar en marcha en el puerto 4000.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main>
        <Catalog rooms={rooms} />
      </main>
    </>
  );
}
