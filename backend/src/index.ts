import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDb } from "./db";
import { amenidadesRouter } from "./routes/amenidades";
import { habitacionesRouter } from "./routes/habitaciones";
import { seedIfEmpty } from "./seed";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, servicio: "star-hotel-api" });
});
app.use("/api/amenidades", amenidadesRouter);
app.use("/api/habitaciones", habitacionesRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Error interno del servidor." });
});

async function main(): Promise<void> {
  await connectDb();
  await seedIfEmpty();
  app.listen(port, () => {
    console.log(`API en http://localhost:${port}`);
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
