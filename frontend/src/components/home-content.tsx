import Image from "next/image";
import Link from "next/link";
import { HomeSearch } from "@/components/home-search";
import { AmenityIcon } from "@/components/icons";
import { RoomCard } from "@/components/room-card";
import type { Amenity } from "@/lib/amenities";
import type { Room } from "@/lib/rooms";

const experiences = [
  {
    src: "/brand/habitacion-casa.jpg",
    alt: "Habitación del hotel con cama amplia y luz natural",
    title: "Tu espacio para descansar",
    text: "Habitaciones sencillas, dobles y suites. Compara sus espacios, servicios y capacidad para encontrar la tuya.",
  },
  {
    src: "/brand/desayuno-casa.png",
    alt: "Comedor del hotel con mesas preparadas y área de buffet",
    title: "Una mañana sin prisa",
    text: "Empieza el día en el comedor. Consulta los servicios de tu habitación para saber si incluye desayuno.",
  },
  {
    src: "/brand/piscina-casa.jpg",
    alt: "Una familia disfrutando de la piscina",
    title: "Un momento para ti",
    text: "Haz una pausa junto a la piscina y disfruta los espacios del hotel durante tu estancia.",
  },
];

const questions = [
  {
    title: "¿Cómo puedo hacer una reserva?",
    text: "Elige tus fechas y consulta las habitaciones disponibles. Puedes reservar de una a cuatro habitaciones en una misma reserva. Inicia sesión o crea una cuenta de cliente para continuar.",
  },
  {
    title: "¿Con cuánta anticipación puedo reservar?",
    text: "Puedes reservar con hasta tres meses de anticipación. Al seleccionar tus fechas verás las opciones disponibles para ese periodo.",
  },
  {
    title: "¿Cómo funciona el pago?",
    text: "En esta versión el pago es simulado. Puedes probar una aprobación o un rechazo y volver a intentarlo. No se realiza ningún cobro real ni necesitas ingresar datos de tu tarjeta.",
  },
  {
    title: "¿A qué hora son la llegada y la salida?",
    text: "El ingreso es a partir de las 15:00 y la salida es hasta las 12:00. Las noches de tu reserva se calculan con las fechas de ingreso y salida que selecciones.",
  },
  {
    title: "¿Qué servicios incluye cada habitación?",
    text: "Los servicios dependen de la habitación que elijas. En su ficha puedes revisar las fotografías, la capacidad y las amenidades incluidas, como el desayuno, antes de reservar.",
  },
];

function ArrowRight() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
    >
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </svg>
  );
}

export function HomeContent({
  rooms,
  amenities,
}: {
  rooms: Room[];
  amenities: Amenity[];
}) {
  const featuredRooms = rooms.slice(0, 3);
  const roomAmenities = new Set(rooms.flatMap((room) => room.amenidades));
  const availableAmenities = amenities.filter((amenity) =>
    roomAmenities.has(amenity.codigo),
  );

  return (
    <>
      <section className="relative isolate min-h-[510px] overflow-hidden bg-brand text-white sm:min-h-[570px]">
        <Image
          src="/brand/portada-piscina.png"
          alt="Dos personas compartiendo un momento en la piscina"
          fill
          preload
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />
        <div className="mx-auto max-w-[1440px] px-5 pt-16 pb-28 sm:px-8 sm:pt-24 sm:pb-32 lg:px-12">
          <p className="inline-flex rounded-md border border-white/30 bg-black/15 px-3 py-1.5 text-xs font-medium tracking-wide">
            Zona 10 · Ciudad de Guatemala
          </p>
          <h1 className="mt-6 max-w-2xl text-[40px] leading-[1.12] font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Tu próximo descanso empieza aquí.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/90 sm:text-lg">
            Un espacio para viajar, descansar y disfrutar. Encuentra la
            habitación ideal para tu estancia en Star Hotel.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/habitaciones"
              className="btn-primary inline-flex items-center gap-3 px-5 py-3"
            >
              Explorar habitaciones <ArrowRight />
            </Link>
            <Link
              href="/reservar"
              className="inline-flex items-center rounded-md border border-white/65 bg-black/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/15"
            >
              Hacer una reserva
            </Link>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-12 max-w-[1344px] px-5 sm:px-8">
        <HomeSearch />
      </div>

      <section
        id="el-hotel"
        className="mx-auto grid max-w-[1344px] scroll-mt-28 items-center gap-9 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16"
      >
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-brand uppercase">
            Bienvenido a Star Hotel
          </p>
          <h2 className="mt-3 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
            La comodidad de sentirte en tu lugar.
          </h2>
          <p className="mt-5 max-w-xl leading-7 text-zinc-600">
            En Zona 10 de Ciudad de Guatemala, te recibimos con espacios para
            descansar y disfrutar cada momento de tu viaje. Ya sea una visita de
            trabajo o unos días en familia, tenemos una habitación para ti.
          </p>
          <div className="mt-7 grid grid-cols-2 gap-5 border-y border-zinc-200 py-5">
            <div>
              <p className="text-xs font-medium text-zinc-500">
                Hora de ingreso
              </p>
              <p className="mt-1 text-xl font-bold text-brand">
                Desde las 15:00
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500">
                Hora de salida
              </p>
              <p className="mt-1 text-xl font-bold text-brand">
                Hasta las 12:00
              </p>
            </div>
          </div>
          <Link
            href="/habitaciones"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
          >
            Conoce nuestras habitaciones <ArrowRight />
          </Link>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-200">
          <Image
            src="/brand/lounge.jpg"
            alt="Una pareja descansando en una sala con vista a la ciudad"
            fill
            sizes="(max-width: 1023px) 100vw, 600px"
            className="object-cover"
          />
        </div>
      </section>

      <section
        id="experiencias"
        className="scroll-mt-28 border-y border-zinc-200 bg-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-[1344px] px-5 sm:px-8">
          <p className="text-xs font-semibold tracking-[0.15em] text-brand uppercase">
            Disfruta tu estancia
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Más que una habitación.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-zinc-600">
            Descubre los espacios y pequeños momentos que hacen especial tu
            visita.
          </p>
          <div className="mt-9 grid gap-7 md:grid-cols-3">
            {experiences.map((experience) => (
              <article key={experience.title}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-zinc-100">
                  <Image
                    src={experience.src}
                    alt={experience.alt}
                    fill
                    sizes="(max-width: 767px) 100vw, 420px"
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-5 text-lg font-bold">{experience.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {experience.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {featuredRooms.length > 0 && (
        <section
          id="habitaciones"
          className="mx-auto max-w-[1344px] scroll-mt-28 px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-brand uppercase">
                Encuentra tu habitación
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Descansa a tu manera.
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-zinc-600">
                Conoce algunas opciones del catálogo. Elige tus fechas para
                consultar disponibilidad.
              </p>
            </div>
            <Link
              href="/habitaciones"
              className="btn-secondary inline-flex items-center gap-3"
            >
              Ver todas las habitaciones <ArrowRight />
            </Link>
          </div>
          <div className="mt-9 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </section>
      )}

      {availableAmenities.length > 0 && (
        <section
          id="servicios"
          className="scroll-mt-28 border-y border-zinc-200 bg-white py-14 sm:py-16"
        >
          <div className="mx-auto max-w-[1344px] px-5 sm:px-8">
            <div className="grid items-start gap-6 lg:grid-cols-[1fr_1.5fr] lg:gap-14">
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-brand uppercase">
                  Detalles que acompañan
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">
                  Todo para tu estancia.
                </h2>
                <p className="mt-4 text-sm leading-6 text-zinc-600">
                  Estos son algunos de los servicios del catálogo. Revisa cuáles
                  están incluidos en la habitación que elijas.
                </p>
              </div>
              <ul className="grid gap-x-7 sm:grid-cols-2">
                {availableAmenities.map((amenity) => (
                  <li
                    key={amenity.codigo}
                    className="flex items-start gap-3 border-b border-zinc-200 py-4"
                  >
                    <span className="mt-0.5 rounded-md bg-brand/5 p-2 text-brand">
                      <AmenityIcon id={amenity.codigo} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{amenity.nombre}</p>
                      {amenity.descripcion && (
                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          {amenity.descripcion}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section
        id="preguntas"
        className="mx-auto grid max-w-[1344px] scroll-mt-28 gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_1.5fr] lg:gap-14"
      >
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] text-brand uppercase">
            Antes de reservar
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Resolvemos tus dudas.
          </h2>
          <p className="mt-4 max-w-sm leading-7 text-zinc-600">
            Lo que necesitas saber para planificar tu visita con tranquilidad.
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          {questions.map((question) => (
            <details
              key={question.title}
              className="group border-b border-zinc-200 last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-sm font-semibold transition hover:bg-zinc-50 [&::-webkit-details-marker]:hidden">
                {question.title}
                <span
                  aria-hidden="true"
                  className="text-xl font-normal text-brand transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="px-5 pb-5 text-sm leading-7 text-zinc-600">
                {question.text}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
