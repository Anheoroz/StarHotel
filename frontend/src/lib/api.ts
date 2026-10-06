import type { Room } from "@/lib/rooms";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

export async function fetchRooms(): Promise<Room[]> {
  const response = await fetch(`${API_URL}/api/habitaciones`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("No se pudieron cargar las habitaciones.");
  }
  return response.json() as Promise<Room[]>;
}

export async function fetchRoom(id: string): Promise<Room | null> {
  const response = await fetch(`${API_URL}/api/habitaciones/${id}`, { cache: "no-store" });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("No se pudo cargar la habitación.");
  }
  return response.json() as Promise<Room>;
}
