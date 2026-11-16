import { describe, it, expect } from "vitest";
import {
  convertir,
  formatearMoneda,
  convertirMultiple,
} from "@/src/services/conversion.service";

describe("Lógica Pura: Servicio de Conversión (Aritmética en enteros)", () => {
  it("Criterio 1: Dado un monto 100 y una tasa 4.000, el resultado es 400.00 sin errores de coma flotante", () => {
    const resultado = convertir(100, 4.0);
    expect(resultado).toBe(400);
    // Verificamos formato exacto
    const formateado = formatearMoneda(resultado, "COP");
    expect(formateado).toContain("400");
  });

  it("Maneja sumas y multiplicaciones decimales propensas a errores IEEE 754 con precisión exacta", () => {
    // 0.1 * 0.2 suele dar 0.020000000000000004 en JS
    const resultado = convertir(0.1, 0.2);
    expect(resultado).toBe(0.02);
  });

  it("Calcula conversiones con tasas de 4 decimales correctamente", () => {
    const resultado = convertir(150.5, 0.9234);
    // 150.5 * 0.9234 = 138.9717 -> redondeo a 2 decimales = 138.97
    expect(resultado).toBe(138.97);
  });

  it("Retorna 0 si el monto es 0 o la tasa es 0", () => {
    expect(convertir(0, 4120)).toBe(0);
    expect(convertir(100, 0)).toBe(0);
  });

  it("Lanza error si el monto o la tasa son negativos", () => {
    expect(() => convertir(-50, 1.2)).toThrow();
    expect(() => convertir(50, -1.2)).toThrow();
  });

  it("Convierte simultáneamente a múltiples monedas (Reto Opcional)", () => {
    const tasas = {
      EUR: 0.92,
      GBP: 0.79,
      COP: 4120.0,
    };
    const destinos = ["EUR", "GBP", "COP"];
    const resultados = convertirMultiple(100, tasas, destinos);

    expect(resultados).toHaveLength(3);
    expect(resultados[0].resultado).toBe(92);
    expect(resultados[1].resultado).toBe(79);
    expect(resultados[2].resultado).toBe(412000);
  });
});
