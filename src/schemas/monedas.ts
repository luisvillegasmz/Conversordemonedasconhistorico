import { z } from "zod";

export const MONEDAS_PERMITIDAS = [
  "EUR",
  "USD",
  "JPY",
  "BGN",
  "CZK",
  "DKK",
  "GBP",
  "HUF",
  "PLN",
  "RON",
  "SEK",
  "CHF",
  "ISK",
  "NOK",
  "TRY",
  "AUD",
  "BRL",
  "CAD",
  "CNY",
  "HKD",
  "IDR",
  "ILS",
  "INR",
  "KRW",
  "MXN",
  "MYR",
  "NZD",
  "PHP",
  "SGD",
  "THB",
  "ZAR",
  "COP",
] as const;

export type CodigoMoneda = (typeof MONEDAS_PERMITIDAS)[number];

export const NOMBRES_MONEDAS: Record<CodigoMoneda, string> = {
  EUR: "Euro (€)",
  USD: "Dólar estadounidense ($)",
  JPY: "Yen japonés (¥)",
  BGN: "Lev búlgaro (лв)",
  CZK: "Corona checa (Kč)",
  DKK: "Corona danesa (kr)",
  GBP: "Libra esterlina (£)",
  HUF: "Florín húngaro (Ft)",
  PLN: "Złoty polaco (zł)",
  RON: "Leu rumano (lei)",
  SEK: "Corona sueca (kr)",
  CHF: "Franco suizo (CHF)",
  ISK: "Corona islandesa (kr)",
  NOK: "Corona noruega (kr)",
  TRY: "Lira turca (₺)",
  AUD: "Dólar australiano ($)",
  BRL: "Real brasileño (R$)",
  CAD: "Dólar canadiense ($)",
  CNY: "Yuan chino (¥)",
  HKD: "Dólar de Hong Kong ($)",
  IDR: "Rupia indonesia (Rp)",
  ILS: "Nuevo séquel israelí (₪)",
  INR: "Rupia india (₹)",
  KRW: "Won surcoreano (₩)",
  MXN: "Peso mexicano ($)",
  MYR: "Ringgit malayo (RM)",
  NZD: "Dólar neozelandés ($)",
  PHP: "Peso filipino (₱)",
  SGD: "Dólar singapurense ($)",
  THB: "Baht tailandés (฿)",
  ZAR: "Rand sudafricano (R)",
  COP: "Peso colombiano ($)",
};

export const monedaSchema = z.enum(MONEDAS_PERMITIDAS);

export const montoSchema = z
  .number()
  .positive({ message: "El monto debe ser un número positivo" })
  .refine(
    (val) => {
      const str = val.toString();
      const decimales = str.includes(".") ? str.split(".")[1].length : 0;
      return decimales <= 2;
    },
    { message: "El monto puede tener un máximo de 2 decimales" }
  );

export const conversionQuerySchema = z
  .object({
    monto: z.coerce
      .number()
      .positive("El monto debe ser mayor a 0")
      .refine(
        (val) => {
          const str = val.toString();
          const decimales = str.includes(".") ? str.split(".")[1].length : 0;
          return decimales <= 2;
        },
        { message: "El monto puede tener un máximo de 2 decimales" }
      ),
    base: monedaSchema,
    destino: monedaSchema,
  })
  .strict();

export const tasasQuerySchema = z
  .object({
    base: monedaSchema.default("USD"),
  })
  .strict();

export const historicoQuerySchema = z
  .object({
    base: monedaSchema,
    destino: monedaSchema,
    dias: z.coerce
      .number()
      .int("Los días deben ser un número entero")
      .min(1, "El rango mínimo es de 1 día")
      .max(365, "El rango del histórico máximo es de 365 días"),
  })
  .strict();

export const favoritoSchema = z
  .object({
    base: monedaSchema,
    destino: monedaSchema,
  })
  .strict()
  .refine((data) => data.base !== data.destino, {
    message: "La moneda base y de destino no pueden ser iguales",
    path: ["destino"],
  });

export const condicionAlertaSchema = z.enum(["mayor", "menor"]);

export const alertaSchema = z
  .object({
    base: monedaSchema,
    destino: monedaSchema,
    condicion: condicionAlertaSchema,
    valor: z.number().positive("El valor debe ser positivo"),
    activa: z.boolean().optional().default(true),
  })
  .strict()
  .refine((data) => data.base !== data.destino, {
    message: "La moneda base y de destino no pueden ser iguales",
    path: ["destino"],
  });

export const alertaUpdateSchema = z
  .object({
    condicion: condicionAlertaSchema.optional(),
    valor: z.number().positive().optional(),
    activa: z.boolean().optional(),
  })
  .strict();

export const sesionBodySchema = z
  .object({
    idToken: z.string().min(1, "El idToken es requerido"),
  })
  .strict();
