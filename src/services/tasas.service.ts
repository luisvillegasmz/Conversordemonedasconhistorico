import { tasasRepository, RegistroTasas } from "../repositories/tasas.repository";

export interface RespuestaTasas {
  base: string;
  fecha: string;
  valores: Record<string, number>;
  origen: "frankfurter" | "firestore_cache" | "fallback";
}

const FRANKFURTER_BASE_URL = "https://api.frankfurter.dev/v1";

export class TasasService {
  /**
   * Obtiene las tasas actuales para una moneda base.
   * Consulta Frankfurter con timeout y manejo de errores.
   * Si Frankfurter falla, recurre a la última tasa guardada en Firestore (Criterio de aceptación 2).
   */
  async obtenerTasas(base: string): Promise<RespuestaTasas> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // Si la base es COP, como Frankfurter no la tiene como base del BCE, usamos USD y calculamos
      const baseParaApi = base === "COP" ? "USD" : base;

      const res = await fetch(`${FRANKFURTER_BASE_URL}/latest?base=${baseParaApi}`, {
        signal: controller.signal,
        next: { revalidate: 3600 }, // Caché de Next.js por 1 hora
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const fecha = data.date || new Date().toISOString().split("T")[0];
        let valores: Record<string, number> = { ...data.rates };

        // Añadir COP si no está en Frankfurter (tasa de referencia aprox)
        if (!valores["COP"]) {
          const tasaUsdCop = 4120.5;
          if (baseParaApi === "USD") {
            valores["COP"] = tasaUsdCop;
          } else if (valores["USD"]) {
            valores["COP"] = Math.round(valores["USD"] * tasaUsdCop * 100) / 100;
          }
        }

        // Si la base original era COP
        if (base === "COP") {
          const valoresCop: Record<string, number> = {};
          const copEnUsd = 1 / 4120.5;
          for (const [moneda, valor] of Object.entries(valores)) {
            valoresCop[moneda] = valor * copEnUsd;
          }
          valoresCop["USD"] = copEnUsd;
          valores = valoresCop;
        }

        // Asegurar que la propia moneda base tenga tasa 1
        valores[base] = 1;

        const registro: RegistroTasas = {
          base,
          fecha,
          valores,
        };

        // Guardar de forma asíncrona en Firestore sin bloquear la respuesta
        tasasRepository.guardar(registro).catch((err) => {
          console.warn("[TasasService] Error al guardar en repositorio:", err);
        });

        return {
          base,
          fecha,
          valores,
          origen: "frankfurter",
        };
      }
    } catch (error) {
      console.warn("[TasasService] Fallo al consultar Frankfurter API:", error);
    }

    // Fallback: usar la última tasa guardada en Firestore
    const respaldo = await tasasRepository.obtenerUltimaTasa(base);
    return {
      base: respaldo.base,
      fecha: respaldo.fecha,
      valores: respaldo.valores,
      origen: "firestore_cache",
    };
  }

  /**
   * Obtiene la tasa específica entre dos monedas
   */
  async obtenerTasaPar(
    base: string,
    destino: string
  ): Promise<{ tasa: number; fecha: string; origen: string }> {
    if (base === destino) {
      return { tasa: 1, fecha: new Date().toISOString().split("T")[0], origen: "identidad" };
    }

    const { valores, fecha, origen } = await this.obtenerTasas(base);
    const tasa = valores[destino];

    if (typeof tasa !== "number") {
      // Si la tasa directa no existe, intentar inversa o referencia
      const { valores: valoresDestino } = await this.obtenerTasas(destino);
      if (typeof valoresDestino[base] === "number" && valoresDestino[base] > 0) {
        return { tasa: 1 / valoresDestino[base], fecha, origen };
      }
      return { tasa: 1, fecha, origen: "default" };
    }

    return { tasa, fecha, origen };
  }
}

export const tasasService = new TasasService();
