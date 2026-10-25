import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking-flow";
import { SiteHeader } from "@/components/site-header";
import { getCuenta } from "@/lib/session";
import { fechaParametro } from "@/lib/reservas";

export const metadata: Metadata = { title: "Reserva tu estancia | Star Hotel" };

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReservarPage({ searchParams }: Props) {
  const [cuenta, parametros] = await Promise.all([getCuenta(), searchParams]);
  const valor = (nombre: string) =>
    typeof parametros[nombre] === "string"
      ? (parametros[nombre] as string)
      : "";
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-xs font-bold tracking-[0.18em] text-brand">
          TU PRÓXIMA ESTANCIA
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Reserva tu lugar en Star Hotel
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
          Elige tus fechas, encuentra tus habitaciones y completa la reserva en
          un solo lugar.
        </p>
        <BookingFlow
          key={JSON.stringify(parametros)}
          cuenta={cuenta}
          ingresoInicial={fechaParametro(parametros.ingreso)}
          salidaInicial={fechaParametro(parametros.salida)}
          catalogoInicial={valor("catalogo")}
          reservaInicial={valor("reserva")}
          seleccionInicial={[
            ...new Set(valor("unidades").split(",").filter(Boolean)),
          ].slice(0, 4)}
        />
      </main>
    </>
  );
}
