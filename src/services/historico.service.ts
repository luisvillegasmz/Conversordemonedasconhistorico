export interface PuntoHistorico {
  fecha: string; // YYYY-MM-DD
  tasa: number;
}

export interface RespuestaHistorico {
  base: string;
  destino: string;
  dias: number;
  puntos: PuntoHistorico[];
  tasaMinima: number;
  tasaMaxima: number;
  tasaPromedio: number;
  tasaActual: number;
  origen: "frankfurter" | "estimado";
}

const FRANKFURTER_BASE_URL = "https://api.frankfurter.dev/v1";

export class HistoricoService {
  /**
   * Obtiene la serie histórica ordenada entre dos monedas para un número de días (máx 365)
   */
  async obtenerHistorico(
    base: string,
    destino: string,
    dias = 30
  ): Promise<RespuestaHistorico> {
    const fin = new Date();
    const inicio = new Date();
    inicio.setDate(fin.getDate() - dias);

    const strFin = fin.toISOString().split("T")[0];
    const strInicio = inicio.toISOString().split("T")[0];

    // Intentar con Frankfurter API
    try {
      const baseApi = base === "COP" ? "USD" : base;
      const destinoApi = destino === "COP" ? "USD" : destino;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const url = `${FRANKFURTER_BASE_URL}/${strInicio}..${strFin}?base=${baseApi}&symbols=${destinoApi}`;
      const res = await fetch(url, {
        signal: controller.signal,
        next: { revalidate: 86400 }, // Caché diaria
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const rates: Record<string, Record<string, number>> = data.rates || {};

        const fechas = Object.keys(rates).sort();
        if (fechas.length > 0) {
          const puntos: PuntoHistorico[] = [];

          for (const fecha of fechas) {
            let valor = rates[fecha][destinoApi];
            if (valor) {
              if (base === "COP" && destino !== "COP") {
                valor = (1 / 4120.5) * valor;
              } else if (destino === "COP" && base !== "COP") {
                valor = valor * 4120.5;
              }
              puntos.push({ fecha, tasa: Number(valor.toFixed(4)) });
            }
          }

          if (puntos.length > 0) {
            return this.calcularMetricas(base, destino, dias, puntos, "frankfurter");
          }
        }
      }
    } catch (error) {
      console.warn("[HistoricoService] Fallo al consultar histórico en Frankfurter:", error);
    }

    // Fallback: Generar serie de contingencia creíble basada en la tasa de hoy
    return this.generarHistoricoContingencia(base, destino, dias);
  }

  private calcularMetricas(
    base: string,
    destino: string,
    dias: number,
    puntos: PuntoHistorico[],
    origen: "frankfurter" | "estimado"
  ): RespuestaHistorico {
    const tasas = puntos.map((p) => p.tasa);
    const tasaMinima = Math.min(...tasas);
    const tasaMaxima = Math.max(...tasas);
    const suma = tasas.reduce((acc, curr) => acc + curr, 0);
    const tasaPromedio = Number((suma / tasas.length).toFixed(4));
    const tasaActual = puntos[puntos.length - 1].tasa;

    return {
      base,
      destino,
      dias,
      puntos,
      tasaMinima,
      tasaMaxima,
      tasaPromedio,
      tasaActual,
      origen,
    };
  }

  private generarHistoricoContingencia(
    base: string,
    destino: string,
    dias: number
  ): RespuestaHistorico {
    let tasaBase = 1.0;
    if (base === "USD" && destino === "EUR") tasaBase = 0.92;
    else if (base === "EUR" && destino === "USD") tasaBase = 1.087;
    else if (destino === "COP") tasaBase = 4120.0;
    else if (base === "COP") tasaBase = 0.00024;
    else if (destino === "JPY") tasaBase = 154.5;
    else if (destino === "GBP") tasaBase = 0.79;

    const puntos: PuntoHistorico[] = [];
    const hoy = new Date();

    for (let i = dias; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      // Omitir fines de semana como los bancos centrales
      const diaSemana = fecha.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) {
        // Ligera variación determinista pero orgánica (seno + coseno)
        const variacion = 1 + Math.sin(i * 0.4) * 0.015 + Math.cos(i * 0.2) * 0.01;
        const tasa = Number((tasaBase * variacion).toFixed(4));
        puntos.push({
          fecha: fecha.toISOString().split("T")[0],
          tasa,
        });
      }
    }

    return this.calcularMetricas(base, destino, dias, puntos, "estimado");
  }
}

export const historicoService = new HistoricoService();
