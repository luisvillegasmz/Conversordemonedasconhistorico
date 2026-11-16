import { NextResponse } from "next/server";
import { manejar } from "@/src/lib/errors";
import { tasasQuerySchema } from "@/src/schemas/monedas";
import { tasasService } from "@/src/services/tasas.service";

export const GET = manejar(async (req) => {
  const { searchParams } = new URL(req.url);
  const baseParam = searchParams.get("base") || "USD";

  const { base } = tasasQuerySchema.parse({ base: baseParam });
  const resultado = await tasasService.obtenerTasas(base);

  return NextResponse.json(resultado, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
});
