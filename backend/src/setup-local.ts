import "./env";
import { assertLocalDatabase } from "./env";
import { connectDb, disconnectDb } from "./db";
import { seedIfEmpty } from "./seed";
import { Unidad } from "./models/unidad";
import { Usuario, type Rol } from "./models/usuario";
import { hashPassword } from "./auth";

async function main() {
  assertLocalDatabase();
  await connectDb();
  await seedIfEmpty();
  const groups = [
    { start: 101, count: 15, catalogo: "sencilla" },
    { start: 116, count: 5, catalogo: "sencilla-deluxe" },
    { start: 121, count: 5, catalogo: "ejecutiva" },
    { start: 201, count: 15, catalogo: "doble" },
    { start: 216, count: 10, catalogo: "doble-vista-al-mar" },
    { start: 301, count: 10, catalogo: "suite-familiar" },
  ];
  for (const group of groups)
    for (let i = 0; i < group.count; i++) {
      await Unidad.updateOne(
        { numero: String(group.start + i) },
        {
          $setOnInsert: {
            catalogo: group.catalogo,
            activa: true,
            estado: "disponible",
          },
        },
        { upsert: true },
      );
    }
  const accounts: { correo: string; nombre: string; rol: Rol }[] = [
    {
      correo: "admin@starhotel.test",
      nombre: "Administración de prueba",
      rol: "administrador",
    },
    {
      correo: "recepcion@starhotel.test",
      nombre: "Recepción de prueba",
      rol: "recepcion",
    },
    {
      correo: "mantenimiento@starhotel.test",
      nombre: "Mantenimiento de prueba",
      rol: "mantenimiento",
    },
    {
      correo: "cliente@starhotel.test",
      nombre: "Cliente de prueba",
      rol: "cliente",
    },
  ];
  for (const account of accounts) {
    if (!(await Usuario.exists({ correo: account.correo })))
      await Usuario.create({
        ...account,
        contrasenaHash: await hashPassword("DemoStar2026!"),
      });
  }
  console.log(
    "Entorno local preparado: catálogo inicial, 60 habitaciones físicas y 4 cuentas de demostración.",
  );
  console.log(
    "Cuentas: admin / recepcion / mantenimiento / cliente @starhotel.test. Contraseña local: DemoStar2026!",
  );
}
main()
  .catch((error) => {
    console.error("No se pudo preparar el entorno:", error.name);
    process.exitCode = 1;
  })
  .finally(disconnectDb);
