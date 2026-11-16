import { getAdminDb } from "../lib/firebase/admin";
import { ConflictError, NotFoundError } from "../lib/errors";

export interface ParFavorito {
  id: string; // {base}_{destino}
  base: string;
  destino: string;
  creadoEn: string;
}

// Almacén en memoria por usuario para entornos sin credenciales de Firestore
const memoriaFavoritos: Map<string, Map<string, ParFavorito>> = new Map();

export class FavoritosRepository {
  private obtenerColeccion(uid: string) {
    const db = getAdminDb();
    return db.collection("usuarios").doc(uid).collection("pares");
  }

  async listar(uid: string): Promise<ParFavorito[]> {
    try {
      const snapshot = await this.obtenerColeccion(uid).get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            base: data.base,
            destino: data.destino,
            creadoEn: data.creadoEn || new Date().toISOString(),
          };
        });
      }
    } catch {
      // Usar respaldo en memoria si Firestore falla
    }

    const mapaUsuario = memoriaFavoritos.get(uid);
    return mapaUsuario ? Array.from(mapaUsuario.values()) : [];
  }

  async crear(uid: string, base: string, destino: string): Promise<ParFavorito> {
    const docId = `${base}_${destino}`;
    const nuevoFavorito: ParFavorito = {
      id: docId,
      base,
      destino,
      creadoEn: new Date().toISOString(),
    };

    try {
      const docRef = this.obtenerColeccion(uid).doc(docId);
      const existe = await docRef.get();
      if (existe.exists) {
        throw new ConflictError("El par favorito ya se encuentra registrado");
      }
      await docRef.set(nuevoFavorito);
      return nuevoFavorito;
    } catch (error: any) {
      if (error instanceof ConflictError) throw error;
      // Respaldo en memoria
      if (!memoriaFavoritos.has(uid)) {
        memoriaFavoritos.set(uid, new Map());
      }
      const userMap = memoriaFavoritos.get(uid)!;
      if (userMap.has(docId)) {
        throw new ConflictError("El par favorito ya se encuentra registrado");
      }
      userMap.set(docId, nuevoFavorito);
      return nuevoFavorito;
    }
  }

  async eliminar(uid: string, id: string): Promise<void> {
    let encontrado = false;
    try {
      const docRef = this.obtenerColeccion(uid).doc(id);
      const doc = await docRef.get();
      if (doc.exists) {
        await docRef.delete();
        encontrado = true;
      }
    } catch {
      // Ignorar error de Firestore y verificar memoria
    }

    const userMap = memoriaFavoritos.get(uid);
    if (userMap && userMap.has(id)) {
      userMap.delete(id);
      encontrado = true;
    }

    if (!encontrado) {
      throw new NotFoundError("El par favorito no existe o ya fue eliminado");
    }
  }
}

export const favoritosRepository = new FavoritosRepository();
