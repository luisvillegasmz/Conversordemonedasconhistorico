import React from "react";
import { ConversionCard } from "@/src/components/ConversionCard";
import { MultipleConversionTable } from "@/src/components/MultipleConversionTable";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado semántico con un solo h1 */}
      <section className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Conversor de Monedas en Tiempo Real
        </h1>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Convierte divisas al instante con tasas del Banco Central Europeo, almacena tus pares favoritos y analiza el histórico cambiario.
        </p>
      </section>

      {/* Componente principal de conversión */}
      <section aria-labelledby="seccion-conversor" className="mb-12">
        <h2 id="seccion-conversor" className="sr-only">
          Calculadora de conversión de divisas
        </h2>
        <ConversionCard />
      </section>

      {/* Reto Opcional: Tabla de conversión múltiple */}
      <section aria-labelledby="seccion-multiple" className="mb-8">
        <MultipleConversionTable montoBase={100} monedaBase="USD" />
      </section>
    </div>
  );
}
