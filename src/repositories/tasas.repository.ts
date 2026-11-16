import { getAdminDb } from "../lib/firebase/admin";

export interface RegistroTasas {
  base: string;
  fecha: string; // YYYY-MM-DD
  valores: Record<string, number>;
  actualizadoEn?: string;
}

// Respaldo estático inicial para cuando no haya conexión con Firestore ni Frankfurter
const RESPALDO_ESTATICO_TASAS: Record<string, Record<string, number>> = {
  USD: {
    EUR: 0.92,
    GBP: 0.79,
    JPY: 154.5,
    COP: 4120.5,
    MXN: 18.25,
    CAD: 1.36,
    CHF: 0.89,
    BRL: 5.45,
    AUD: 1.51,
    CNY: 7.24,
  },
  EUR: {
    USD: 1.087,
    GBP: 0.858,
    JPY: 167.9,
    COP: 4478.8,
    MXN: 19.83,
    CAD: 1.478,
    CHF: 0.967,
    BRL: 5.92,
    AUD: 1.64,
    CNY: 7.87,
  },
};

export class TasasRepository {
  private coleccion = "tasas";

  /**
   * Guarda o actualiza un registro de tasas en Firestore
   * Document ID: {base}_{fecha}
   */
  async guardar(registro: RegistroTasas): Promise<void> {
    try {
      const db = getAdminDb();
      const docId = `${registro.base}_${registro.fecha}`;
      await db.collection(this.coleccion).doc(docId).set(
        {
          base: registro.base,
          fecha: registro.fecha,
          valores: registro.valores,
          actualizadoEn: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn("[TasasRepository.guardar] Error al guardar en Firestore:", error);
    }
  }

  /**
   * Obtiene la tasa para una base y fecha específica
   */
  async obtenerPorBaseYFecha(base: string, fecha: string): Promise<RegistroTasas | null> {
    try {
      const db = getAdminDb();
      const docId = `${base}_${fecha}`;
      const doc = await db.collection(this.coleccion).doc(docId).get();
      if (doc.exists) {
        return doc.data() as RegistroTasas;
      }
    } catch (error) {
      console.warn("[TasasRepository.obtenerPorBaseYFecha] Error de lectura:", error);
    }
    return null;
  }

  /**
   * Obtiene la última tasa guardada para la base dada.
   * Si Firestore falla o no tiene datos, retorna el respaldo de emergencia.
   */
  async obtenerUltimaTasa(base: string): Promise<RegistroTasas> {
    try {
      const db = getAdminDb();
      const snapshot = await db
        .collection(this.coleccion)
        .where("base", "==", base)
        .orderBy("fecha", "desc")
        .limit(1)
        .get();

      if (!snapshot.empty) {
        return snapshot.docs[0].data() as RegistroTasas;
      }
    } catch (error) {
      console.warn("[TasasRepository.obtenerUltimaTasa] Error consultando Firestore:", error);
    }

    // Respaldo de contingencia
    const hoy = new Date().toISOString().split("T")[0];
    const valoresFallback = RESPALDO_ESTATICO_TASAS[base] || {
      USD: base === "USD" ? 1 : 1.08,
      EUR: base === "EUR" ? 1 : 0.92,
      COP: 4120.0,
      GBP: 0.79,
      JPY: 154.0,
      MXN: 18.2,
    };

    return {
      base,
      fecha: hoy,
      valores: valoresFallback,
      actualizadoEn: new Date().toISOString(),
    };
  }
}

export const tasasRepository = new TasasRepository();
