import dotenv from "dotenv";

// Las variables del proceso tienen prioridad; después .env.local y .env.
dotenv.config({ path: [".env.local", ".env"], quiet: true });

export function assertLocalDatabase(uri = process.env.MONGODB_URI ?? ""): void {
  if (
    !/^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\/starhotel_(sprint3|test)(?:\?|$)/.test(
      uri,
    )
  ) {
    throw new Error(
      "Esta operación requiere una base local starhotel_sprint3 o starhotel_test.",
    );
  }
}
