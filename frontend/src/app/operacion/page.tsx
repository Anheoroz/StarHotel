import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { OperationPanel } from "@/components/operation-panel";
import { getCuenta } from "@/lib/session";

export default async function OperacionPage() {
  const cuenta = await getCuenta();
  if (!cuenta) redirect("/acceso");
  if (cuenta.rol === "cliente") redirect("/cuenta");
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-zinc-200 bg-white p-6 sm:p-8">
          <div>
            <p className="mb-2 text-xs font-bold tracking-wider text-brand">
              STAR HOTEL ·{" "}
              {cuenta.rol === "mantenimiento"
                ? "MANTENIMIENTO"
                : cuenta.rol === "administrador"
                  ? "ADMINISTRACIÓN"
                  : "RECEPCIÓN"}
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {cuenta.rol === "mantenimiento"
                ? "Estado de habitaciones"
                : "Recepción y habitaciones"}
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-500">
              Hola, {cuenta.nombre}. Consulta el estado actual de cada
              habitación.
            </p>
          </div>
          <div className="rounded-lg bg-background px-4 py-3">
            <p className="text-xs font-medium text-zinc-500">
              Tu área de trabajo
            </p>
            <p className="mt-1 text-sm font-semibold text-brand">
              {cuenta.rol === "mantenimiento"
                ? "Limpieza y preparación"
                : "Consulta del hotel"}
            </p>
          </div>
        </section>
        <OperationPanel />
      </main>
    </>
  );
}
