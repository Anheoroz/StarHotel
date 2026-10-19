import "server-only";
import { cookies } from "next/headers";

export type Cuenta = {
  id: string;
  nombre: string;
  correo: string;
  rol: "cliente" | "administrador" | "recepcion" | "mantenimiento";
};

export async function getCuenta(): Promise<Cuenta | null> {
  const token = (await cookies()).get("starhotel_session")?.value;
  if (!token) return null;
  try {
    const response = await fetch(
      `${process.env.API_URL ?? "http://localhost:4000"}/api/auth/me`,
      { headers: { Cookie: `starhotel_session=${token}` }, cache: "no-store" },
    );
    return response.ok ? response.json() : null;
  } catch {
    return null;
  }
}
