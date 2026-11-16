import { NextResponse } from "next/server";
import { manejar, BadRequestError } from "@/src/lib/errors";
import { requerirUsuario } from "@/src/lib/auth";
import { alertaSchema } from "@/src/schemas/monedas";
import { alertasService } from "@/src/services/alertas.service";

export const GET = manejar(async (req: Request) => {
  const usuario = await requerirUsuario(req);
  const items = await alertasService.evaluarAlertasUsuario(usuario.uid);

  return NextResponse.json(
    { items },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
});

export const POST = manejar(async (req: Request) => {
  const usuario = await requerirUsuario(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new BadRequestError("Cuerpo de solicitud JSON inválido");
  }

  const datos = alertaSchema.parse(body);
  const alerta = await alertasService.crearAlerta(usuario.uid, datos);

  return NextResponse.json(
    { alerta },
    {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
});
