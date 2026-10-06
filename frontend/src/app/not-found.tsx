import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Habitación no encontrada</h1>
        <Link href="/" className="mt-4 inline-block font-medium text-brand">
          Volver al catálogo
        </Link>
      </main>
    </>
  );
}
