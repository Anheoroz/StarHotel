import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h1 className="font-display text-4xl">Habitación no encontrada</h1>
        <Link href="/" className="mt-4 inline-block font-medium text-brand">
          Volver al catálogo
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
