import type { ReactNode } from "react";
import type { AmenityId } from "@/lib/rooms";

type IconProps = {
  className?: string;
  children: ReactNode;
};

function Icon({ className, children }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function BuildingIcon() {
  return (
    <Icon className="h-5 w-5">
      <path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16" />
      <path d="M14 9h5a1 1 0 0 1 1 1v11" />
      <path d="M3 21h18" />
      <path d="M8 8h2" />
      <path d="M8 12h2" />
      <path d="M8 16h2" />
      <path d="M17 13h1" />
      <path d="M17 17h1" />
    </Icon>
  );
}

export function HomeIcon() {
  return (
    <Icon className="h-4 w-4">
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 10v9h12v-9" />
    </Icon>
  );
}

export function BedIcon() {
  return (
    <Icon className="h-4 w-4">
      <path d="M3 18V9" />
      <path d="M3 14h18v4" />
      <path d="M21 18V11a2 2 0 0 0-2-2H10" />
      <path d="M7 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
    </Icon>
  );
}

export function SlidersIcon() {
  return (
    <Icon className="h-4 w-4">
      <path d="M4 6h10" />
      <path d="M18 6h2" />
      <path d="M4 12h4" />
      <path d="M12 12h8" />
      <path d="M4 18h8" />
      <path d="M16 18h4" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="14" cy="18" r="2" />
    </Icon>
  );
}

function amenityPaths(id: AmenityId) {
  switch (id) {
    case "wifi":
      return (
        <>
          <path d="M12 18h.01" />
          <path d="M8.5 15.5a5 5 0 0 1 7 0" />
          <path d="M5 12a10 10 0 0 1 14 0" />
          <path d="M2 8.5a15 15 0 0 1 20 0" />
        </>
      );
    case "aire":
      return (
        <>
          <path d="M4 8h16v8H4z" />
          <path d="M7 12h10" />
          <path d="M8 18v2" />
          <path d="M16 18v2" />
        </>
      );
    case "desayuno":
      return (
        <>
          <path d="M6 8h8v6a4 4 0 0 1-8 0V8z" />
          <path d="M14 9h2a2 2 0 0 1 0 4h-2" />
          <path d="M8 20h8" />
        </>
      );
    case "tina":
      return (
        <>
          <path d="M5 12h14v3a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4v-3z" />
          <path d="M7 12V7a2 2 0 0 1 2-2" />
          <path d="M6 19v1" />
          <path d="M18 19v1" />
        </>
      );
    case "ducha":
      return (
        <>
          <path d="M8 6h8" />
          <path d="M12 6v3" />
          <path d="M8 13v.01" />
          <path d="M12 14v.01" />
          <path d="M16 13v.01" />
          <path d="M9 18v.01" />
          <path d="M15 18v.01" />
        </>
      );
    case "tv":
      return (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M8 21h8" />
        </>
      );
    case "balcon":
      return (
        <>
          <path d="M4 20V10" />
          <path d="M20 20V10" />
          <path d="M4 14h16" />
          <path d="M4 10h16" />
          <path d="M12 10V4" />
        </>
      );
    case "cocina":
      return (
        <>
          <path d="M6 3v8" />
          <path d="M10 3v8" />
          <path d="M6 7h4" />
          <path d="M15 3v6a2 2 0 0 0 2 2h1V3" />
          <path d="M8 14v7" />
          <path d="M16 14v7" />
        </>
      );
    case "escritorio":
      return (
        <>
          <path d="M4 10h16" />
          <path d="M6 10v8" />
          <path d="M18 10v8" />
          <path d="M9 14h6" />
        </>
      );
    case "minibar":
      return (
        <>
          <rect x="6" y="3" width="12" height="18" rx="2" />
          <path d="M6 10h12" />
          <path d="M10 14h.01" />
          <path d="M14 14h.01" />
        </>
      );
    default: {
      const unreachable: never = id;
      return unreachable;
    }
  }
}

export function AmenityIcon({ id }: { id: AmenityId }) {
  return <Icon>{amenityPaths(id)}</Icon>;
}
