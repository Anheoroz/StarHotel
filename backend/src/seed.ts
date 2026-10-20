import "dotenv/config";
import { amenidadesSemilla, habitacionesSemilla } from "./data/catalogo";
import { connectDb, disconnectDb } from "./db";
import { Amenidad } from "./models/amenidad";
import { Habitacion } from "./models/habitacion";
import { Usuario } from "./models/usuario";
import bcrypt from "bcryptjs";

export async function seedIfEmpty(): Promise<void> {
  const [habitaciones, amenidades] = await Promise.all([
    Habitacion.countDocuments(),
    Amenidad.countDocuments(),
  ]);

  if (amenidades === 0) {
    await Amenidad.insertMany(amenidadesSemilla);
  }
  if (habitaciones === 0) {
    await Habitacion.insertMany(habitacionesSemilla.map((habitacion) => ({ ...habitacion, activa: true })));
  }
  await Habitacion.updateMany({ activa: { $exists: false } }, { $set: { activa: true } });

  const cuentas = await Usuario.countDocuments();
  if (cuentas === 0) {
    const personal = [
      { nombre: "Administración", correo: "admin@starhotel.com", contrasena: "Admin1234!", rol: "administrador" },
      { nombre: "Recepción", correo: "recepcion@starhotel.com", contrasena: "Recepcion1234!", rol: "recepcion" },
      { nombre: "Mantenimiento", correo: "mantenimiento@starhotel.com", contrasena: "Mantenimiento1234!", rol: "mantenimiento" },
    ];
    await Usuario.insertMany(
      await Promise.all(
        personal.map(async (cuenta) => ({
          nombre: cuenta.nombre,
          correo: cuenta.correo,
          rol: cuenta.rol,
          contrasenaHash: await bcrypt.hash(cuenta.contrasena, 10),
        })),
      ),
    );
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
