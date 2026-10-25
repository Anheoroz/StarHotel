export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/backend${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "No se pudo conectar con el hotel. Revisa tu conexión e inténtalo de nuevo.",
    );
  }
  const data = await response.json().catch(() => {
    throw new Error(
      "El servicio no está disponible en este momento. Inténtalo de nuevo en unos instantes.",
    );
  });
  if (!response.ok)
    throw new Error(data.error ?? "No se pudo completar la operación.");
  return data as T;
}
