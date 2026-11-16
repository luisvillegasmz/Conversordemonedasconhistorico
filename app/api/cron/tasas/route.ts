import { NextResponse } from "next/server";
import { manejar, UnauthorizedError } from "@/src/lib/errors";
import { tasasService } from "@/src/services/tasas.service";

export const GET = manejar(async (req: Request) => {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "dev-cron-secret";

  if (authHeader !== `Bearer ${cronSecret}`) {
    throw new UnauthorizedError("Cron secret inválido o no suministrado");
  }

  // Actualizar tasas para USD y EUR
  const tasasUsd = await tasasService.obtenerTasas("USD");
  const tasasEur = await tasasService.obtenerTasas("EUR");

  return NextResponse.json({
    mensaje: "Tasas actualizadas exitosamente mediante tarea programada",
    fecha: tasasUsd.fecha,
    fechaEur: tasasEur.fecha,
    basesActualizadas: ["USD", "EUR"],
  });
});

export const POST = GET;
