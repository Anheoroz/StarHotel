"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client-api";
import type { Cuenta } from "@/lib/session";

export function AuthForm() {
  const router = useRouter();
  const [registro, setRegistro] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-7 shadow-sm">
      <p className="text-sm font-semibold tracking-wider text-brand">
        STAR HOTEL
      </p>
      <h1 className="mt-2 text-2xl font-bold">
        {registro ? "Crea tu cuenta" : "Te damos la bienvenida"}
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        {registro
          ? "Regístrate con tu nombre y correo."
          : "Ingresa con tu correo y contraseña."}
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          const form = new FormData(event.currentTarget);
          try {
            const cuenta = await api<Cuenta>(
              registro ? "/auth/registro" : "/auth/login",
              {
                method: "POST",
                body: JSON.stringify(Object.fromEntries(form)),
              },
            );
            const continuar = new URLSearchParams(window.location.search).get(
              "continuar",
            );
            const retornoSeguro =
              continuar && /^\/reservar(?:\?|$)/.test(continuar)
                ? continuar
                : null;
            router.push(
              cuenta.rol === "administrador"
                ? "/admin"
                : cuenta.rol === "cliente"
                  ? (retornoSeguro ?? "/cuenta")
                  : "/operacion",
            );
            router.refresh();
          } catch (err) {
            setError((err as Error).message);
            setBusy(false);
          }
        }}
      >
        {registro && (
          <label className="field-label">
            Nombre
            <input
              name="nombre"
              required
              maxLength={100}
              autoComplete="name"
              className="field"
            />
          </label>
        )}
        <label className="field-label">
          Correo electrónico
          <input
            name="correo"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className="field"
          />
        </label>
        <label className="field-label">
          Contraseña
          <input
            name="contrasena"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete={registro ? "new-password" : "current-password"}
            className="field"
          />
        </label>
        {registro && (
          <p className="text-xs text-zinc-500">Usa entre 8 y 128 caracteres.</p>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? "Procesando…" : registro ? "Crear cuenta" : "Iniciar sesión"}
        </button>
      </form>
      <button
        type="button"
        className="mt-5 text-sm font-medium text-brand underline"
        onClick={() => {
          setRegistro(!registro);
          setError("");
        }}
      >
        {registro ? "Ya tengo cuenta" : "Crear una cuenta"}
      </button>
      <Link href="/habitaciones" className="mt-4 block text-sm text-zinc-500">
        Volver al catálogo
      </Link>
    </section>
  );
}
