import { getAdminDb } from "../lib/firebase/admin";
import { NotFoundError } from "../lib/errors";

export interface Alerta {
  id: string;
  base: string;
  destino: string;
  condicion: "mayor" | "menor";
  valor: number;
  activa: boolean;
  creadaEn: string;
  ultimaEvaluacion?: string;
  disparada?: boolean;
}

const memoriaAlertas: Map<string, Map<string, Alerta>> = new Map();

export class AlertasRepository {
  private obtenerColeccion(uid: string) {
    const db = getAdminDb();
    return db.collection("usuarios").doc(uid).collection("alertas");
  }

  async listar(uid: string): Promise<Alerta[]> {
    try {
      const snapshot = await this.obtenerColeccion(uid).orderBy("creadaEn", "desc").get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Alerta, "id">),
        }));
      }
    } catch {
      // Usar respaldo en memoria
    }

    const mapa = memoriaAlertas.get(uid);
    return mapa ? Array.from(mapa.values()) : [];
  }

  async obtenerPorId(uid: string, id: string): Promise<Alerta> {
    try {
      const doc = await this.obtenerColeccion(uid).doc(id).get();
      if (doc.exists) {
        return {
          id: doc.id,
          ...(doc.data() as Omit<Alerta, "id">),
        };
      }
    } catch {
      // Chequear memoria
    }

    const mapa = memoriaAlertas.get(uid);
    const alerta = mapa?.get(id);
    if (!alerta) {
      throw new NotFoundError("La alerta solicitada no existe");
    }
    return alerta;
  }

  async crear(uid: string, datos: Omit<Alerta, "id" | "creadaEn">): Promise<Alerta> {
    const id = `alt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nuevaAlerta: Alerta = {
      id,
      ...datos,
      creadaEn: new Date().toISOString(),
    };

    try {
      await this.obtenerColeccion(uid).doc(id).set(nuevaAlerta);
      return nuevaAlerta;
    } catch {
      if (!memoriaAlertas.has(uid)) {
        memoriaAlertas.set(uid, new Map());
      }
      memoriaAlertas.get(uid)!.set(id, nuevaAlerta);
      return nuevaAlerta;
    }
  }

  async actualizar(
    uid: string,
    id: string,
    cambios: Partial<Pick<Alerta, "condicion" | "valor" | "activa" | "disparada" | "ultimaEvaluacion">>
  ): Promise<Alerta> {
    const actual = await this.obtenerPorId(uid, id);
    const actualizada: Alerta = {
      ...actual,
      ...cambios,
    };

    try {
      await this.obtenerColeccion(uid).doc(id).update(cambios);
      return actualizada;
    } catch {
      const mapa = memoriaAlertas.get(uid);
      if (mapa) {
        mapa.set(id, actualizada);
      }
      return actualizada;
    }
  }

  async eliminar(uid: string, id: string): Promise<void> {
    // Verificar primero existencia
    await this.obtenerPorId(uid, id);

    try {
      await this.obtenerColeccion(uid).doc(id).delete();
    } catch {
      const mapa = memoriaAlertas.get(uid);
      if (mapa) {
        mapa.delete(id);
      }
    }
  }
}

export const alertasRepository = new AlertasRepository();
