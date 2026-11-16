import { NextResponse } from "next/server";
import { manejar, BadRequestError } from "@/src/lib/errors";
import { requerirUsuario } from "@/src/lib/auth";
import { alertaUpdateSchema } from "@/src/schemas/monedas";
import { alertasService } from "@/src/services/alertas.service";

export const PATCH = manejar(
  async (req: Request, context: { params: Promise<{ id: string }> }) => {
    const usuario = await requerirUsuario(req);
    const { id } = await context.params;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new BadRequestError("Cuerpo de solicitud JSON inválido");
    }

    const cambios = alertaUpdateSchema.parse(body);
    const alerta = await alertasService.actualizarAlerta(usuario.uid, id, cambios);

    return NextResponse.json(
      { alerta },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
);

export const DELETE = manejar(
  async (req: Request, context: { params: Promise<{ id: string }> }) => {
    const usuario = await requerirUsuario(req);
    const { id } = await context.params;

    await alertasService.eliminarAlerta(usuario.uid, id);

    return new NextResponse(null, { status: 204 });
  }
);
