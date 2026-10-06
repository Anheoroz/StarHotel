import "dotenv/config";
import { amenidadesSemilla, habitacionesSemilla } from "./data/catalogo";
import { connectDb, disconnectDb } from "./db";
import { Amenidad } from "./models/amenidad";
import { Habitacion } from "./models/habitacion";

export async function seedIfEmpty(): Promise<void> {
  const [habitaciones, amenidades] = await Promise.all([
    Habitacion.countDocuments(),
    Amenidad.countDocuments(),
  ]);

  if (amenidades === 0) {
    await Amenidad.insertMany(amenidadesSemilla);
  }
  if (habitaciones === 0) {
    await Habitacion.insertMany(habitacionesSemilla);
  }
}

async function seedDirect(): Promise<void> {
  await connectDb();
  await Amenidad.deleteMany({});
  await Habitacion.deleteMany({});
  await Amenidad.insertMany(amenidadesSemilla);
  await Habitacion.insertMany(habitacionesSemilla);
  await disconnectDb();
  console.log(
    `Datos cargados: ${habitacionesSemilla.length} habitaciones y ${amenidadesSemilla.length} amenidades.`,
  );
}

if (process.argv[1]?.endsWith("seed.ts")) {
  seedDirect().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
}
