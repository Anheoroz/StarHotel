"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { API_URL, guardarSesion, type Usuario } from "@/lib/sesion";

type CuentaFormProps = {
  modo: "registro" | "sesion";
};

export function CuentaForm({ modo }: CuentaFormProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const registro = modo === "registro";

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (registro && !nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!correo.trim() || !contrasena) {
      setError(registro ? "Nombre, correo y contraseña son obligatorios." : "Correo y contraseña son obligatorios.");
      return;
    }
    setEnviando(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/${registro ? "registro" : "sesion"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registro ? { nombre, correo, contrasena } : { correo, contrasena }),
      });
      const data = (await response.json()) as { error?: string; token?: string; usuario?: Usuario };
      if (!response.ok || !data.token || !data.usuario) {
        setError(data.error ?? "No se pudo completar la solicitud.");
        return;
      }
      guardarSesion({ token: data.token, usuario: data.usuario });
      router.push("/");
    } catch {
      setError("El servicio de cuentas no está disponible.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="flex w-full max-w-md flex-col gap-4 border border-line bg-white px-8 py-10 shadow-[0_28px_70px_rgba(107,36,48,0.1)]">
      <h1 className="font-display text-5xl text-black italic">{registro ? "Crear cuenta" : "Iniciar sesión"}</h1>
      {registro ? (
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            className="mt-2 border border-line px-3 py-2"
            autoComplete="name"
          />
        </label>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        Correo
        <input
          type="email"
          value={correo}
          onChange={(event) => setCorreo(event.target.value)}
          className="border border-line px-3 py-2"
          autoComplete="email"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Contraseña
        <input
          type="password"
          value={contrasena}
          onChange={(event) => setContrasena(event.target.value)}
          className="border border-line px-3 py-2"
          autoComplete={registro ? "new-password" : "current-password"}
        />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={enviando} className="mt-2 bg-brand px-4 py-3 text-[0.72rem] tracking-[0.16em] text-white uppercase">
        {enviando ? "Guardando…" : registro ? "Registrarme" : "Entrar"}
      </button>
      <p className="text-sm text-zinc-500">
        {registro ? (
          <Link href="/entrar" className="text-brand">
            Ya tengo cuenta
          </Link>
        ) : (
          <Link href="/registro" className="text-brand">
            Crear una cuenta
          </Link>
        )}
      </p>
    </form>
  );
}
