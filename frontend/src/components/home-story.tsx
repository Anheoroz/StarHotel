import Image from "next/image";
import Link from "next/link";
import { Accordion } from "@/components/accordion";
import { AmenityIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { AMENITY_IDS, AMENITY_LABELS } from "@/lib/rooms";

const ofertas = [
  {
    src: "/brand/habitacion-casa.jpg",
    href: "/#habitaciones",
    fecha: "Para hospedarse",
    titulo: "La habitación",
    texto: "Cama amplia, luz de día y desayuno incluido.",
  },
  {
    src: "/brand/desayuno-casa.png",
    href: "/#experiencias",
    fecha: "Cada mañana",
    titulo: "El desayuno",
    texto: "El comedor de la casa, servido con la estadía.",
  },
] as const;

const momentos = [
  {
    src: "/brand/desayuno-casa.png",
    titulo: "Desayuno",
    texto: "El comedor abre la mañana, con la mesa puesta para quien se queda.",
  },
  {
    src: "/brand/habitacion-casa.jpg",
    titulo: "Habitación",
    texto: "El cuarto para descansar, con luz de día y la ciudad cerca.",
  },
] as const;

const escenas = [
  {
    src: "/brand/desayuno.jpg",
    titulo: "Mesa afuera",
    texto: "Otra forma de tomar el desayuno.",
  },
  {
    src: "/brand/piscina.jpg",
    titulo: "En el agua",
    texto: "La piscina, con gente alrededor.",
  },
  {
    src: "/brand/lounge.jpg",
    titulo: "La tarde",
    texto: "Un rato quieto al final del día.",
  },
] as const;

const actividades = [
  { titulo: "Congresos", texto: "Una sala para reunir a un grupo y trabajar el día." },
  { titulo: "Charlas", texto: "Un lugar para hablar frente a la gente, con atención y calma." },
  { titulo: "Eventos", texto: "Encuentros y celebraciones de la casa, aparte de donde se duerme." },
] as const;

const preguntas = [
  {
    id: "donde",
    titulo: "¿Dónde está Star Hotel?",
    contenido: "En Zona 10, Ciudad de Guatemala. La invitación es a quedarse: habitación, desayuno y un ritmo más lento.",
  },
  {
    id: "horarios",
    titulo: "¿A qué hora es la llegada y la salida?",
    contenido: "La llegada es desde las 15:00. La salida es hasta las 12:00.",
  },
  {
    id: "desayuno",
    titulo: "¿El desayuno está incluido?",
    contenido: "Sí. Las habitaciones del catálogo incluyen desayuno.",
  },
  {
    id: "salon",
    titulo: "¿Para qué es el salón?",
    contenido: "El salón es para congresos, charlas y eventos. No es una habitación: quien se hospeda duerme en las habitaciones del catálogo.",
  },
] as const;

function Encabezado({ kicker, titulo }: { kicker: string; titulo: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-[0.68rem] tracking-[0.32em] text-brand uppercase">{kicker}</p>
      <h2 className="mt-3 font-display text-5xl leading-none italic md:text-6xl">{titulo}</h2>
    </div>
  );
}

export function HomeStory() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <p className="text-[0.68rem] tracking-[0.32em] text-brand uppercase">La casa</p>
          <h2 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] italic md:text-7xl">
            Una estadía para quedarse.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">
            Star Hotel está en Zona 10, Ciudad de Guatemala. Hay habitaciones para dormir, desayuno en el comedor, piscina y un salón aparte para congresos, charlas y eventos.
          </p>
        </Reveal>
      </section>

      <section id="ofertas" className="scroll-mt-28 bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <Encabezado kicker="Para esta estadía" titulo="Ofertas de la casa" />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {ofertas.map((oferta, index) => (
              <Reveal key={oferta.titulo} delay={index * 120}>
                <Link href={oferta.href} className="group relative block aspect-[3/4] overflow-hidden rounded-3xl">
                  <Image
                    src={oferta.src}
                    alt={oferta.titulo}
                    fill
                    className="object-cover transition duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 380px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/10" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <p className="text-[0.62rem] tracking-[0.22em] uppercase">{oferta.fecha}</p>
                    <h3 className="mt-2 font-display text-3xl leading-none italic">{oferta.titulo}</h3>
                    <p className="mt-2 text-sm text-white/80">{oferta.texto}</p>
                  </div>
                  <span className="absolute top-5 right-5 grid h-10 w-10 place-items-center rounded-full border border-white/50 text-white transition duration-500 group-hover:border-brand group-hover:bg-brand">
                    →
                  </span>
                </Link>
              </Reveal>
            ))}
            <Reveal delay={240}>
              <Link href="/#eventos" className="group flex aspect-[3/4] flex-col justify-between rounded-3xl bg-brand p-7 text-white transition duration-500 hover:-translate-y-1">
                <p className="text-[0.62rem] tracking-[0.22em] uppercase">El salón</p>
                <div>
                  <h3 className="font-display text-4xl leading-none italic">Congresos y charlas</h3>
                  <p className="mt-3 text-sm text-white/80">El espacio de la casa para congresos, charlas y eventos.</p>
                  <span className="mt-6 inline-grid h-10 w-10 place-items-center rounded-full border border-white/50 transition group-hover:bg-white group-hover:text-brand">→</span>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="experiencias" className="scroll-mt-28 mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <Encabezado kicker="En la casa" titulo="Momentos para quedarse" />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {momentos.map((momento, index) => (
            <Reveal key={momento.titulo} delay={index * 140}>
              <article className="group">
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl">
                  <Image
                    src={momento.src}
                    alt={momento.titulo}
                    fill
                    className="object-cover transition duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 380px"
                  />
                </div>
                <h3 className="mt-5 font-display text-3xl italic">{momento.titulo}</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-stone-600">{momento.texto}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[0.68rem] tracking-[0.32em] text-brand uppercase">En la habitación</p>
                <h2 className="mt-3 font-display text-5xl italic">Servicios de la casa</h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-stone-500">
                Lo que acompaña la estadía. El desayuno va incluido en el catálogo.
              </p>
            </div>
          </Reveal>
          <ul className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {AMENITY_IDS.map((id) => (
              <li key={id} className="flex items-center gap-4 border-b border-line py-4">
                <span className="text-brand">
                  <AmenityIcon id={id} />
                </span>
                <span className="tracking-wide">{AMENITY_LABELS[id]}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="la-casa" className="scroll-mt-28 mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <Encabezado kicker="Antes de llegar" titulo="Información del hotel" />
        </Reveal>
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
          {[
            {
              titulo: "Horarios",
              filas: [
                { etiqueta: "Llegada", valor: "15:00" },
                { etiqueta: "Salida", valor: "12:00" },
              ],
            },
            {
              titulo: "La casa",
              filas: [
                { etiqueta: "Zona", valor: "10" },
                { etiqueta: "Ciudad", valor: "Guatemala" },
              ],
            },
            {
              titulo: "En la estadía",
              filas: [
                { etiqueta: "Mañana", valor: "Desayuno" },
                { etiqueta: "Salón", valor: "Eventos" },
              ],
            },
          ].map((bloque) => (
            <article key={bloque.titulo} className="bg-[#f6f3ee] px-8 py-10">
              <p className="text-[0.68rem] tracking-[0.28em] text-brand uppercase">{bloque.titulo}</p>
              {bloque.filas.map((fila) => (
                <p key={fila.etiqueta} className="mt-5">
                  <span className="block text-[0.68rem] tracking-[0.18em] text-stone-500 uppercase">{fila.etiqueta}</span>
                  <span className="mt-1 block font-display text-4xl leading-none">{fila.valor}</span>
                </p>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section id="eventos" className="scroll-mt-28 bg-brand text-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <p className="text-[0.68rem] tracking-[0.32em] text-white/70 uppercase">El salón</p>
            <h2 className="mt-3 max-w-3xl font-display text-5xl leading-none italic md:text-6xl">Congresos, charlas y eventos</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/80">
              El salón de Star Hotel es un espacio para reunirse. Sirve para congresos, charlas y eventos. Las habitaciones son otra cosa: ahí se duerme.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {actividades.map((actividad, index) => (
              <Reveal key={actividad.titulo} delay={index * 100}>
                <article className="h-full rounded-3xl border border-white/20 px-6 py-8">
                  <h3 className="font-display text-4xl italic">{actividad.titulo}</h3>
                  <p className="mt-4 text-sm leading-6 text-white/75">{actividad.texto}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <Encabezado kicker="Otras escenas" titulo="También en la casa" />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {escenas.map((escena, index) => (
            <Reveal key={escena.titulo} delay={index * 120}>
              <article className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                  <Image
                    src={escena.src}
                    alt={escena.titulo}
                    fill
                    className="object-cover transition duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 380px"
                  />
                </div>
                <h3 className="mt-5 font-display text-3xl italic">{escena.titulo}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{escena.texto}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="preguntas" className="scroll-mt-28 mx-auto max-w-3xl px-5 py-24">
        <Reveal>
          <Encabezado kicker="Antes de reservar" titulo="Preguntas" />
          <div className="mt-10">
            <Accordion items={[...preguntas]} />
          </div>
        </Reveal>
      </section>
    </>
  );
}
