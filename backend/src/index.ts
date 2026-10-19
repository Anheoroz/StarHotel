import "./env";
import { app } from "./app";
import { connectDb } from "./db";
import { seedIfEmpty } from "./seed";

async function main() {
  await connectDb();
  await seedIfEmpty();
  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () =>
    console.log(
      `API en http://localhost:${port} (${process.env.REQUIRE_LOCAL_DB === "true" ? "MongoDB local" : "base configurada"})`,
    ),
  );
}
main().catch((error: unknown) => {
  console.error(
    "No se pudo iniciar la API:",
    error instanceof Error ? error.name : "Error",
  );
  process.exit(1);
});
