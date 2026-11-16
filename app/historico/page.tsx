import React from "react";
import { HistoricalChart } from "@/src/components/HistoricalChart";
import { CodigoMoneda, MONEDAS_PERMITIDAS } from "@/src/schemas/monedas";

interface HistoricoPageProps {
  searchParams: Promise<{
    base?: string;
    destino?: string;
  }>;
}

export default async function HistoricoPage({ searchParams }: HistoricoPageProps) {
  const params = await searchParams;
  const baseParam = (params.base?.toUpperCase() || "USD") as CodigoMoneda;
  const destinoParam = (params.destino?.toUpperCase() || "EUR") as CodigoMoneda;

  const base = MONEDAS_PERMITIDAS.includes(baseParam) ? baseParam : "USD";
  const destino = MONEDAS_PERMITIDAS.includes(destinoParam) ? destinoParam : "EUR";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Histórico de Tasas de Cambio
        </h1>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Analiza el comportamiento y la tendencia de las divisas en gráficos interactivos de 7, 30, 90 y 365 días, con métricas de mínimos, máximos y promedio.
        </p>
      </section>

      <section aria-labelledby="seccion-grafico">
        <h2 id="seccion-grafico" className="sr-only">
          Gráfico y tabla histórica de divisas
        </h2>
        <HistoricalChart baseInicial={base} destinoInicial={destino} diasIniciales={30} />
      </section>
    </div>
  );
}
