import { NextResponse } from "next/server";
import { manejar, BadRequestError } from "@/src/lib/errors";
import { requerirUsuario } from "@/src/lib/auth";
import { favoritoSchema } from "@/src/schemas/monedas";
import { favoritosService } from "@/src/services/favoritos.service";

export const GET = manejar(async (req: Request) => {
  const usuario = await requerirUsuario(req);
  const items = await favoritosService.listarFavoritos(usuario.uid);

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

  const { base, destino } = favoritoSchema.parse(body);
  const favorito = await favoritosService.agregarFavorito(usuario.uid, base, destino);

  return NextResponse.json(
    { favorito },
    {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
});
