import dotenv from "dotenv";

// Las variables del proceso tienen prioridad; después .env.local y .env.
dotenv.config({ path: [".env.local", ".env"], quiet: true });

export function assertLocalDatabase(uri = process.env.MONGODB_URI ?? ""): void {
  if (
    !/^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\/starhotel_(sprint3|test(?:_reservas|_amenidades)?)(?:\?|$)/.test(
      uri,
    )
  ) {
    throw new Error(
      "Esta operación requiere starhotel_sprint3 o una base starhotel_test autorizada en localhost.",
    );
  }
}
