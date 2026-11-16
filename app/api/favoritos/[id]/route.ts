import { NextResponse } from "next/server";
import { manejar } from "@/src/lib/errors";
import { requerirUsuario } from "@/src/lib/auth";
import { favoritosService } from "@/src/services/favoritos.service";

export const DELETE = manejar(
  async (req: Request, context: { params: Promise<{ id: string }> }) => {
    const usuario = await requerirUsuario(req);
    const { id } = await context.params;

    await favoritosService.eliminarFavorito(usuario.uid, id);

    return new NextResponse(null, { status: 204 });
  }
);
