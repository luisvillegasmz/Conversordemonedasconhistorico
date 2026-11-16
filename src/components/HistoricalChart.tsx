"use client";

import React, { useState, useEffect } from "react";
import { CodigoMoneda } from "../schemas/monedas";
import { CurrencyCombobox } from "./CurrencyCombobox";
import { PuntoHistorico, RespuestaHistorico } from "../services/historico.service";

interface HistoricalChartProps {
  baseInicial?: CodigoMoneda;
  destinoInicial?: CodigoMoneda;
  diasIniciales?: number;
}

export function HistoricalChart({
  baseInicial = "USD",
  destinoInicial = "EUR",
  diasIniciales = 30,
}: HistoricalChartProps) {
  const [base, setBase] = useState<CodigoMoneda>(baseInicial);
  const [destino, setDestino] = useState<CodigoMoneda>(destinoInicial);
  const [dias, setDias] = useState<number>(diasIniciales);

  const [datos, setDatos] = useState<RespuestaHistorico | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Alternativa de accesibilidad: alternar vista SVG / Tabla (Requisito 5)
  const [mostrarTabla, setMostrarTabla] = useState<boolean>(false);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoHistorico | null>(null);

  useEffect(() => {
    let activo = true;

    async function cargarHistorico() {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/tasas/historico?base=${base}&destino=${destino}&dias=${dias}`
        );
        if (!res.ok) {
          throw new Error("No se pudo obtener el historial de tasas");
        }
        const data = await res.json();
        if (activo) {
          setDatos(data);
          if (data.puntos && data.puntos.length > 0) {
            setPuntoSeleccionado(data.puntos[data.puntos.length - 1]);
          }
        }
      } catch (err: unknown) {
        if (activo) {
          setError(err instanceof Error ? err.message : "Error al cargar datos históricos");
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarHistorico();
    return () => {
      activo = false;
    };
  }, [base, destino, dias]);

  const puntos = datos?.puntos || [];
  const minTasa = datos?.tasaMinima || 0;
  const maxTasa = datos?.tasaMaxima || 1;
  const rango = maxTasa - minTasa || 0.0001;

  // Parámetros para el gráfico SVG responsivo
  const svgWidth = 700;
  const svgHeight = 280;
  const paddingX = 50;
  const paddingY = 30;

  const anchoUtil = svgWidth - paddingX * 2;
  const altoUtil = svgHeight - paddingY * 2;

  const calcularCoords = (p: PuntoHistorico, index: number) => {
    const totalPuntos = Math.max(puntos.length - 1, 1);
    const x = paddingX + (index / totalPuntos) * anchoUtil;
    const y = svgHeight - paddingY - ((p.tasa - minTasa) / rango) * altoUtil;
    return { x, y };
  };

  const pathD =
    puntos.length > 0
      ? puntos
          .map((p, i) => {
            const { x, y } = calcularCoords(p, i);
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ")
      : "";

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
      {/* Controles del par y periodo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end mb-6">
        <div className="lg:col-span-4">
          <CurrencyCombobox
            id="hist-base"
            label="Moneda origen"
            valor={base}
            onChange={setBase}
            monedaExcluida={destino}
          />
        </div>
        <div className="lg:col-span-4">
          <CurrencyCombobox
            id="hist-destino"
            label="Moneda destino"
            valor={destino}
            onChange={setDestino}
            monedaExcluida={base}
          />
        </div>

        {/* Selector de rango de días (RF-03: 7 / 30 / 90 días) */}
        <div className="sm:col-span-2 lg:col-span-4">
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
            Periodo de tiempo
          </label>
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 p-1 bg-zinc-50 dark:bg-zinc-800/50">
            {[7, 30, 90, 180, 365].map((numDias) => (
              <button
                key={numDias}
                type="button"
                onClick={() => setDias(numDias)}
                className={`min-h-[44px] flex-1 rounded-md text-xs font-semibold transition-all ${
                  dias === numDias
                    ? "bg-blue-600 text-white shadow"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
                aria-pressed={dias === numDias}
              >
                {numDias === 365 ? "1 año" : `${numDias}d`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tarjetas resumen de métricas */}
      {datos && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/30">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tasa actual</span>
            <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {datos.tasaActual.toFixed(4)}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/30">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Promedio</span>
            <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {datos.tasaPromedio.toFixed(4)}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 dark:border-emerald-950/40 dark:bg-emerald-950/10">
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Mínimo ({dias}d)</span>
            <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300 font-mono">
              {datos.tasaMinima.toFixed(4)}
            </p>
          </div>
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 dark:border-indigo-950/40 dark:bg-indigo-950/10">
            <span className="text-xs font-medium text-indigo-700 dark:text-indigo-400">Máximo ({dias}d)</span>
            <p className="mt-1 text-lg font-bold text-indigo-700 dark:text-indigo-300 font-mono">
              {datos.tasaMaxima.toFixed(4)}
            </p>
          </div>
        </div>
      )}

      {/* Botón para alternar entre Gráfico y Tabla (Accesibilidad y Requisito 5) */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
          Evolución del par {base}/{destino}
        </h3>
        <button
          type="button"
          onClick={() => setMostrarTabla(!mostrarTabla)}
          className="min-h-[44px] text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          aria-pressed={mostrarTabla}
        >
          {mostrarTabla ? "📊 Ver como Gráfico" : "📋 Ver como Tabla accesible"}
        </button>
      </div>

      {cargando ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
          <p className="text-sm text-zinc-500 animate-pulse">Cargando serie histórica...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      ) : puntos.length === 0 ? (
        <div className="p-8 text-center text-sm text-zinc-500">
          No hay datos disponibles para el periodo seleccionado.
        </div>
      ) : mostrarTabla ? (
        /* Vista de Tabla Alternativa Accesible */
        <div className="overflow-x-auto max-h-80 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm dark:divide-zinc-800">
            <caption className="sr-only">
              Historial de tasas de cambio de {base} a {destino} en los últimos {dias} días
            </caption>
            <thead className="bg-zinc-50 dark:bg-zinc-800 sticky top-0">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">Fecha</th>
                <th scope="col" className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100 text-right">Tasa (1 {base})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
              {puntos.slice().reverse().map((p) => (
                <tr key={p.fecha} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-2.5 font-medium text-zinc-800 dark:text-zinc-200">{p.fecha}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-blue-600 dark:text-blue-400 font-semibold">{p.tasa.toFixed(4)} {destino}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Vista Gráfica con SVG Accesible e Interactivo */
        <div className="relative">
          <div className="w-full overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50/50 p-2 dark:border-zinc-800 dark:bg-zinc-900/50">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none"
              role="img"
              aria-label={`Gráfico de líneas de la tasa de cambio entre ${base} y ${destino} durante los últimos ${dias} días`}
            >
              {/* Líneas guía horizontales */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const y = paddingY + pct * altoUtil;
                const valorTasa = maxTasa - pct * rango;
                return (
                  <g key={pct}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity="0.1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="currentColor"
                      className="fill-zinc-400 font-mono"
                    >
                      {valorTasa.toFixed(3)}
                    </text>
                  </g>
                );
              })}

              {/* Trazado de la línea del gráfico */}
              <path
                d={pathD}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Puntos interactivos */}
              {puntos.map((p, i) => {
                const { x, y } = calcularCoords(p, i);
                const esActivo = puntoSeleccionado?.fecha === p.fecha;
                return (
                  <circle
                    key={p.fecha}
                    cx={x}
                    cy={y}
                    r={esActivo ? 6 : 3.5}
                    fill={esActivo ? "#1d4ed8" : "#3b82f6"}
                    stroke="#ffffff"
                    strokeWidth={esActivo ? 3 : 1.5}
                    className="cursor-pointer transition-all hover:scale-150"
                    onMouseEnter={() => setPuntoSeleccionado(p)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Fecha ${p.fecha}: tasa ${p.tasa}`}
                    onFocus={() => setPuntoSeleccionado(p)}
                  />
                );
              })}
            </svg>
          </div>

          {/* Información del punto enfocado / seleccionado */}
          {puntoSeleccionado && (
            <div
              aria-live="polite"
              className="mt-3 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2 text-xs font-medium text-blue-900 dark:bg-blue-950/50 dark:text-blue-200 border border-blue-200 dark:border-blue-900"
            >
              <span>📅 Fecha: <strong>{puntoSeleccionado.fecha}</strong></span>
              <span>
                1 {base} = <strong>{puntoSeleccionado.tasa.toFixed(4)} {destino}</strong>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
