"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import type { Cuenta } from "@/lib/session";

export function AccountNav() {
  const router = useRouter();
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    api<Cuenta>("/auth/me")
      .then(setCuenta)
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  if (!ready) return null;
  if (!cuenta)
    return (
      <Link
        href="/acceso"
        className="rounded-md bg-brand px-2 py-2 text-sm font-semibold text-white sm:px-3"
      >
        Ingresar
      </Link>
    );
  return (
    <div className="flex items-center gap-2 text-sm">
      <Link
        href={
          cuenta.rol === "administrador"
            ? "/admin"
            : cuenta.rol === "cliente"
              ? "/cuenta"
              : "/operacion"
        }
        className="rounded-md px-2 py-2 font-semibold text-brand"
      >
        {cuenta.rol === "administrador"
          ? "Administración"
          : cuenta.rol === "cliente"
            ? "Mi cuenta"
            : cuenta.rol === "recepcion"
              ? "Recepción"
              : "Mantenimiento"}
      </Link>
      <button
        type="button"
        className="text-zinc-500 hover:text-brand"
        onClick={async () => {
          await api("/auth/logout", { method: "POST" });
          setCuenta(null);
          router.push("/");
          router.refresh();
        }}
      >
        Salir
      </button>
    </div>
  );
}
