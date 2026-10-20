import Link from "next/link";

export function HotelMark() {
  return (
    <Link href="/" className="flex items-center gap-3 text-black">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 text-brand">
        <path
          fill="currentColor"
          d="M12 1.8 14.7 8.4 21.8 9.1 16.5 13.8 18.1 20.8 12 17.2 5.9 20.8 7.5 13.8 2.2 9.1 9.3 8.4 12 1.8Z"
        />
      </svg>
      <span className="leading-none">
        <span className="block font-display text-[1.7rem] tracking-[0.04em]">Star Hotel</span>
        <span className="mt-1 block text-[0.62rem] tracking-[0.28em] text-brand uppercase">El lujo de quedarse</span>
      </span>
    </Link>
  );
}
