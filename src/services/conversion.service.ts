/**
 * Servicio de Conversión de Monedas
 * Implementa lógica pura de negocio con aritmética en enteros
 * para prevenir errores de coma flotante (IEEE 754).
 */

export function convertir(monto: number, tasa: number, decimales = 2): number {
  if (monto < 0 || tasa < 0) {
    throw new Error("El monto y la tasa deben ser números positivos");
  }
  if (monto === 0 || tasa === 0) {
    return 0;
  }

  // Escalamos a BigInt para operar en enteros
  // Escala para el monto: 10^4 (permite centavos con holgura)
  // Escala para la tasa: 10^6 (permite hasta 6 decimales de tasa cambiaria)
  const ESCALA_MONTO = BigInt(10000);
  const ESCALA_TASA = BigInt(1000000);

  const montoEntero = BigInt(Math.round(monto * Number(ESCALA_MONTO)));
  const tasaEntera = BigInt(Math.round(tasa * Number(ESCALA_TASA)));

  // Producto escalado por (ESCALA_MONTO * ESCALA_TASA)
  const producto = montoEntero * tasaEntera;
  const divisor = ESCALA_MONTO * ESCALA_TASA;

  // Precisión decimal y redondeo simétrico en enteros
  const factorPrecision = BigInt(Math.pow(10, decimales));
  const productoParaDecimales = (producto * factorPrecision + (divisor / BigInt(2))) / divisor;
  
  return Number(productoParaDecimales) / Math.pow(10, decimales);
}

/**
 * Formateo accesible y adaptativo usando Intl.NumberFormat con alternativa a texto simple
 */
export function formatearMoneda(
  monto: number,
  moneda: string,
  locale = "es-CO"
): string {
  try {
    if (typeof Intl !== "undefined" && typeof Intl.NumberFormat === "function") {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: moneda,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(monto);
    }
  } catch {
    // Si la moneda no está en la base de datos de Intl o el locale falla
  }

  // Alternativa simple si Intl no está disponible o falla
  return `${monto.toFixed(2)} ${moneda}`;
}

/**
 * Convierte un monto base a múltiples monedas simultáneamente (Reto Opcional Sección 12)
 */
export interface ConversionMultipleResultado {
  moneda: string;
  tasa: number;
  resultado: number;
  formateado: string;
}

export function convertirMultiple(
  monto: number,
  tasas: Record<string, number>,
  monedasDestino: string[],
  locale = "es-CO"
): ConversionMultipleResultado[] {
  return monedasDestino
    .filter((moneda) => typeof tasas[moneda] === "number")
    .map((moneda) => {
      const tasa = tasas[moneda];
      const resultado = convertir(monto, tasa);
      return {
        moneda,
        tasa,
        resultado,
        formateado: formatearMoneda(resultado, moneda, locale),
      };
    });
}
