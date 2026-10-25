import "./env";
import { app } from "./app";
import { connectDb, disconnectDb } from "./db";
import { seedIfEmpty } from "./seed";
import { ensureReservaIndexes } from "./reservas";

async function main() {
  await connectDb();
  await seedIfEmpty();
  await ensureReservaIndexes();
  const port = Number(process.env.PORT ?? 4000);
  const server = app.listen(port, "0.0.0.0", () =>
    console.log(
      `API en http://localhost:${port} (${process.env.REQUIRE_LOCAL_DB === "true" ? "MongoDB local" : "base configurada"})`,
    ),
  );
  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.once(signal, () => {
      const timeout = setTimeout(() => process.exit(1), 10_000);
      timeout.unref();
      server.close(() => {
        disconnectDb().finally(() => process.exit(0));
      });
    });
  }
}
main().catch((error: unknown) => {
  console.error(
    "No se pudo iniciar la API:",
    error instanceof Error ? error.name : "Error",
  );
  process.exit(1);
});
