"use client";

import React, { useState, useEffect } from "react";
import { CodigoMoneda, NOMBRES_MONEDAS } from "../schemas/monedas";
import { convertirMultiple } from "../services/conversion.service";

interface MultipleConversionTableProps {
  montoBase?: number;
  monedaBase?: CodigoMoneda;
}

const MONEDAS_DESTINO_PREDETERMINADAS: CodigoMoneda[] = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "COP",
  "MXN",
  "CAD",
  "CHF",
  "BRL",
];

export function MultipleConversionTable({
  montoBase = 100,
  monedaBase = "USD",
}: MultipleConversionTableProps) {
  const [tasas, setTasas] = useState<Record<string, number>>({});
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    let activo = true;
    async function obtenerTasas() {
      setCargando(true);
      try {
        const res = await fetch(`/api/tasas?base=${monedaBase}`);
        if (res.ok) {
          const data = await res.json();
          if (activo) {
            setTasas(data.valores || {});
          }
        }
      } catch (err) {
        console.error("Error al obtener tasas múltiples:", err);
      } finally {
        if (activo) setCargando(false);
      }
    }

    obtenerTasas();
    return () => {
      activo = false;
    };
  }, [monedaBase]);

  const destinosFiltrados = MONEDAS_DESTINO_PREDETERMINADAS.filter(
    (m) => m !== monedaBase
  );

  const resultados = convertirMultiple(montoBase, tasas, destinosFiltrados);

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Conversión múltiple simultánea
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Equivalencia de <strong>{montoBase} {monedaBase}</strong> en las principales divisas internacionales
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
          <caption className="sr-only">
            Tabla de conversión simultánea de divisas para el monto {montoBase} en moneda {monedaBase}
          </caption>
          <thead className="bg-zinc-50 dark:bg-zinc-800/60 font-semibold text-zinc-700 dark:text-zinc-300">
            <tr>
              <th scope="col" className="px-4 py-3.5">Divisa</th>
              <th scope="col" className="px-4 py-3.5">Nombre</th>
              <th scope="col" className="px-4 py-3.5 text-right">Tasa de cambio</th>
              <th scope="col" className="px-4 py-3.5 text-right">Monto convertido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {cargando && resultados.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  Cargando conversiones simultáneas...
                </td>
              </tr>
            ) : resultados.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  No hay datos de tasas disponibles para esta combinación.
                </td>
              </tr>
            ) : (
              resultados.map((item) => (
                <tr
                  key={item.moneda}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="whitespace-nowrap px-4 py-3.5 font-bold text-zinc-900 dark:text-zinc-100">
                    {item.moneda}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-zinc-600 dark:text-zinc-400">
                    {NOMBRES_MONEDAS[item.moneda as CodigoMoneda] || item.moneda}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right font-mono text-zinc-700 dark:text-zinc-300">
                    {item.tasa.toFixed(4)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-blue-600 dark:text-blue-400">
                    {item.formateado}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
