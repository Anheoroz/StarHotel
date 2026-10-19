import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function endpoint(
  handler: (req: Request, res: Response) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res)).catch(next);
  };
}

export function texto(value: unknown, nombre: string, max = 200): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw new HttpError(
      400,
      `${nombre} es obligatorio y admite hasta ${max} caracteres.`,
    );
  }
  return value.trim();
}

export function numero(
  value: unknown,
  nombre: string,
  min = 0,
  integer = false,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    (integer && !Number.isInteger(value))
  ) {
    throw new HttpError(
      400,
      `${nombre} debe ser ${integer ? "un entero" : "un número"} mayor o igual a ${min}.`,
    );
  }
  return value;
}
