import { Schema, model, type InferSchemaType } from "mongoose";

const habitacionReservaSchema = new Schema(
  {
    unidad: { type: Schema.Types.ObjectId, required: true, ref: "Unidad" },
    numero: { type: String, required: true },
    catalogo: { type: String, required: true },
    nombre: { type: String, required: true },
    precioCentavos: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const pagoSchema = new Schema(
  {
    modo: { type: String, enum: ["simulado"], required: true },
    tipoTarjeta: { type: String, enum: ["credito", "debito"], required: true },
    estado: { type: String, enum: ["aprobado", "rechazado"], required: true },
    referencia: { type: String, required: true },
    fecha: { type: Date, required: true },
    montoCentavos: { type: Number, required: true, min: 0 },
    ultimos4: { type: String, required: true, match: /^\d{4}$/ },
  },
  { _id: false },
);

const reservaSchema = new Schema(
  {
    codigo: { type: String, required: true, unique: true },
    usuario: { type: Schema.Types.ObjectId, required: true, ref: "Usuario", index: true },
    ingreso: { type: String, required: true },
    salida: { type: String, required: true },
    noches: { type: Number, required: true, min: 1 },
    habitaciones: { type: [habitacionReservaSchema], required: true },
    nombre: { type: String, required: true, maxlength: 100 },
    correo: { type: String, required: true, maxlength: 254 },
    telefono: { type: String, required: true, maxlength: 30 },
    totalCentavos: { type: Number, required: true, min: 0 },
    moneda: { type: String, required: true, enum: ["GTQ"], default: "GTQ" },
    estado: {
      type: String,
      enum: ["pendiente-pago", "pagada", "vencida"],
      required: true,
      default: "pendiente-pago",
    },
    expira: { type: Date, required: true },
    // Una entrada por cuarto y noche. El índice impide la sobreventa incluso
    // entre procesos distintos, sin depender de transacciones de MongoDB.
    // Al vencer un apartado se retira el campo; se conserva la reserva histórica.
    nochesOcupadas: { type: [String], default: undefined, select: false },
    pago: { type: pagoSchema, default: undefined },
  },
  { collection: "reservas", timestamps: true, versionKey: false },
);

reservaSchema.index(
  { nochesOcupadas: 1 },
  { unique: true, sparse: true, name: "cuarto_noche_sin_sobreventa" },
);
reservaSchema.index({ estado: 1, expira: 1 });
reservaSchema.index({ ingreso: 1, salida: 1 });

export type ReservaDatos = InferSchemaType<typeof reservaSchema>;
export const Reserva = model("Reserva", reservaSchema);
