import mongoose from "mongoose";

export async function connectDb(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Falta MONGODB_URI. Copia backend/.env.example a backend/.env.");
  }
  await mongoose.connect(uri);
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
