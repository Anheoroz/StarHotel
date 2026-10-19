import mongoose from "mongoose";
import { assertLocalDatabase } from "./env";

export async function connectDb(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Falta MONGODB_URI. Copia backend/.env.example a backend/.env.",
    );
  }
  if (process.env.REQUIRE_LOCAL_DB === "true") assertLocalDatabase(uri);
  const expected = process.env.EXPECTED_DB_NAME;
  if (uri.includes(".mongodb.net") && !expected) {
    throw new Error(
      "Para Atlas configura EXPECTED_DB_NAME y selecciona el perfil correspondiente.",
    );
  }
  if (expected) {
    const configured = new mongoose.mongo.MongoClient(uri).db().databaseName;
    if (configured !== expected)
      throw new Error("La base configurada no coincide con EXPECTED_DB_NAME.");
  }
  await mongoose.connect(uri);
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
