"use client";

export type Rol = "administrador" | "recepcion" | "mantenimiento" | "huesped";

export type Usuario = {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
};

export type Sesion = {
  token: string;
  usuario: Usuario;
};

const CLAVE = "starhotel-sesion";
const EVENTO = "starhotel-sesion";

export function guardarSesion(sesion: Sesion): void {
  localStorage.setItem(CLAVE, JSON.stringify(sesion));
  window.dispatchEvent(new Event(EVENTO));
}

export function cerrarSesion(): void {
  localStorage.removeItem(CLAVE);
  window.dispatchEvent(new Event(EVENTO));
}

export function suscribirSesion(onChange: () => void): () => void {
  window.addEventListener(EVENTO, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENTO, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function leerSesionTexto(): string | null {
  return localStorage.getItem(CLAVE);
}

export function sesionDesdeTexto(texto: string | null): Sesion | null {
  if (!texto) {
    return null;
  }
  try {
    const valor = JSON.parse(texto) as Sesion;
    if (!valor.token || !valor.usuario?.rol) {
      return null;
    }
    return valor;
  } catch {
    return null;
  }
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function solicitar<T>(ruta: string, token: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const response = await fetch(`${API_URL}${ruta}`, { ...init, headers });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? "No se pudo completar la solicitud.");
  }
  return data;
}
