import { favoritosRepository, ParFavorito } from "../repositories/favoritos.repository";
import { BadRequestError } from "../lib/errors";

const MAX_FAVORITOS_POR_USUARIO = 20;

export class FavoritosService {
  async listarFavoritos(uid: string): Promise<ParFavorito[]> {
    return favoritosRepository.listar(uid);
  }

  async agregarFavorito(uid: string, base: string, destino: string): Promise<ParFavorito> {
    if (base === destino) {
      throw new BadRequestError("La moneda base y de destino no pueden ser iguales");
    }

    const existentes = await favoritosRepository.listar(uid);
    if (existentes.length >= MAX_FAVORITOS_POR_USUARIO) {
      throw new BadRequestError(
        `Ha alcanzado el límite máximo de ${MAX_FAVORITOS_POR_USUARIO} pares favoritos`
      );
    }

    return favoritosRepository.crear(uid, base, destino);
  }

  async eliminarFavorito(uid: string, id: string): Promise<void> {
    return favoritosRepository.eliminar(uid, id);
  }
}

export const favoritosService = new FavoritosService();
