import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { BedIcon } from "@/components/icons";
import { RoomCard } from "@/components/room-card";
import { MyReservations } from "@/components/my-reservations";
import { SiteHeader } from "@/components/site-header";
import { fetchRooms } from "@/lib/api";
import { getCuenta } from "@/lib/session";

export default async function CuentaPage() {
  const cuenta = await getCuenta();
  if (!cuenta) redirect("/acceso");
  if (cuenta.rol === "administrador") redirect("/admin");
  if (cuenta.rol !== "cliente") redirect("/operacion");
  const rooms = await fetchRooms().catch(() => []);
  const initials = cuenta.nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-brand">MI CUENTA</p>
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
            Perfil de cliente
          </span>
        </div>
        <section className="grid overflow-hidden rounded-xl bg-brand text-white md:grid-cols-[1.15fr_1fr]">
          <div className="px-6 py-9 sm:p-10">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/70">
              BIENVENIDO A STAR HOTEL
            </p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Hola, {cuenta.nombre}
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-white/85">
              Tu próxima estancia empieza aquí. Descubre un espacio para
              descansar, viajar en familia o disfrutar de unos días frente al
              mar.
            </p>
            <Link
              href="/reservar"
              className="mt-7 inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-brand transition hover:bg-white/90"
            >
              <BedIcon />
              Reservar mi estancia<span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="relative min-h-48 md:min-h-full">
            <Image
              src="/rooms/mar.jpg"
              alt="Habitación de Star Hotel con vista al mar"
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-5">
              <p className="text-sm font-semibold">
                Encuentra tu lugar para desconectar
              </p>
              <p className="mt-1 text-xs text-white/80">
                Comodidad en cada detalle
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-5 md:grid-cols-[1fr_1.35fr]">
          <section className="min-w-0 rounded-lg border border-zinc-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 font-bold text-brand"
              >
                {initials}
              </span>
              <div>
                <h2 className="text-lg font-bold">Tu perfil</h2>
                <p className="text-xs text-zinc-500">
                  Información de tu cuenta
                </p>
              </div>
            </div>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-xs font-medium text-zinc-500">Nombre</dt>
                <dd className="mt-1 break-words text-sm font-semibold">
                  {cuenta.nombre}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500">
                  Correo electrónico
                </dt>
                <dd className="mt-1 break-words text-sm">{cuenta.correo}</dd>
              </div>
            </dl>
          </section>
          <section className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-bold">Una habitación a tu medida</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Compara las opciones del hotel y encuentra la que mejor se adapte
              a tu viaje.
            </p>
            <ol className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                ["01", "Explora", "Conoce las fotos y los espacios."],
                ["02", "Compara", "Filtra por huéspedes, precio y servicios."],
                ["03", "Reserva", "Elige tus fechas y confirma tu estancia."],
              ].map(([step, title, text]) => (
                <li key={step}>
                  <span className="text-xs font-bold text-brand">{step}</span>
                  <h3 className="mt-1 text-sm font-semibold">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{text}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <MyReservations />

        {rooms.length > 0 && (
          <section className="mt-9">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wider text-brand">
                  DESCUBRE STAR HOTEL
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  Para tu próxima visita
                </h2>
              </div>
              <Link
                href="/habitaciones"
                className="text-sm font-semibold text-brand underline underline-offset-4"
              >
                Ver todas las habitaciones →
              </Link>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {rooms.slice(0, 3).map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
