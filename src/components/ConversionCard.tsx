"use client";

import React, { useState, useEffect, useDeferredValue } from "react";
import Link from "next/link";
import { CodigoMoneda } from "../schemas/monedas";
import { CurrencyCombobox } from "./CurrencyCombobox";
import { convertir, formatearMoneda } from "../services/conversion.service";
import { useAuth } from "./AuthContext";

interface ConversionCardProps {
  tasaInicial?: number;
  fechaInicial?: string;
}

export function ConversionCard({ tasaInicial = 0.92, fechaInicial = "" }: ConversionCardProps) {
  const { usuario } = useAuth();

  const [monto, setMonto] = useState<string>("100");
  const [base, setBase] = useState<CodigoMoneda>("USD");
  const [destino, setDestino] = useState<CodigoMoneda>("EUR");

  const [tasa, setTasa] = useState<number>(tasaInicial);
  const [fechaTasa, setFechaTasa] = useState<string>(fechaInicial || new Date().toISOString().split("T")[0]);
  const [cargandoTasa, setCargandoTasa] = useState<boolean>(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Copiado y estado de favorito
  const [copiado, setCopiado] = useState(false);
  const [guardandoFavorito, setGuardandoFavorito] = useState(false);
  const [mensajeFavorito, setMensajeFavorito] = useState<string | null>(null);

  // Técnica React Requisito 6: useDeferredValue para convertir mientras se escribe
  const deferredMonto = useDeferredValue(monto);

  // Efecto para obtener la tasa al cambiar moneda base o destino
  useEffect(() => {
    let activo = true;

    async function cargarTasa() {
      if (base === destino) {
        setTasa(1);
        setFechaTasa(new Date().toISOString().split("T")[0]);
        return;
      }

      setCargandoTasa(true);
      setErrorCarga(null);

      try {
        const res = await fetch(`/api/tasas?base=${base}`);
        if (!res.ok) throw new Error("Error al obtener las tasas");
        const data = await res.json();

        if (activo) {
          const tasaObtenida = data.valores[destino];
          if (typeof tasaObtenida === "number") {
            setTasa(tasaObtenida);
          } else {
            setTasa(1);
          }
          setFechaTasa(data.fecha || new Date().toISOString().split("T")[0]);
        }
      } catch {
        if (activo) {
          setErrorCarga("No se pudo obtener la tasa más reciente. Se usa la última tasa en caché.");
        }
      } finally {
        if (activo) setCargandoTasa(false);
      }
    }

    cargarTasa();

    return () => {
      activo = false;
    };
  }, [base, destino]);

  // Cálculo del resultado usando lógica pura libre de errores de coma flotante
  const montoNumerico = parseFloat(deferredMonto) || 0;
  const resultado = convertir(montoNumerico, tasa);

  const resultadoFormateado = formatearMoneda(resultado, destino);
  const montoFormateado = formatearMoneda(montoNumerico, base);

  // RF-02: Intercambiar monedas con un botón
  const handleIntercambiar = () => {
    const temp = base;
    setBase(destino);
    setDestino(temp);
  };

  // API del navegador: Clipboard API con fallback (Requisito 5)
  const copiarResultado = async () => {
    const textoACopiar = `${montoFormateado} = ${resultadoFormateado} (Tasa: ${tasa} al ${fechaTasa})`;
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(textoACopiar);
        setCopiado(true);
      } else {
        // Fallback para navegadores sin Clipboard API
        const inputOculto = document.createElement("textarea");
        inputOculto.value = textoACopiar;
        inputOculto.style.position = "fixed";
        inputOculto.style.opacity = "0";
        document.body.appendChild(inputOculto);
        inputOculto.focus();
        inputOculto.select();
        document.execCommand("copy");
        document.body.removeChild(inputOculto);
        setCopiado(true);
      }
    } catch {
      setCopiado(false);
    }

    setTimeout(() => setCopiado(false), 2500);
  };

  // RF-04: Guardar par favorito
  const handleGuardarFavorito = async () => {
    if (!usuario) {
      setMensajeFavorito("Inicia sesión para guardar pares favoritos");
      setTimeout(() => setMensajeFavorito(null), 3000);
      return;
    }

    setGuardandoFavorito(true);
    setMensajeFavorito(null);

    try {
      const res = await fetch("/api/favoritos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base, destino }),
      });

      if (res.status === 201) {
        setMensajeFavorito(`¡Par ${base}/${destino} agregado a favoritos!`);
      } else if (res.status === 409) {
        setMensajeFavorito("Este par ya está en tus favoritos");
      } else {
        const errorData = await res.json();
        setMensajeFavorito(errorData.error || "No se pudo guardar el favorito");
      }
    } catch {
      setMensajeFavorito("Error de conexión al guardar favorito");
    } finally {
      setGuardandoFavorito(false);
      setTimeout(() => setMensajeFavorito(null), 3000);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
      <form onSubmit={(e) => e.preventDefault()} aria-label="Formulario de conversión de monedas">
        <fieldset className="border-0 p-0 m-0">
          <legend className="sr-only">Parámetros de conversión de divisas</legend>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end">
            {/* Monto a convertir */}
            <div className="md:col-span-4">
              <label
                htmlFor="monto-input"
                className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-1"
              >
                Monto
              </label>
              <div className="relative">
                <input
                  id="monto-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="0.00"
                  required
                  aria-describedby="monto-ayuda"
                  className="min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-lg font-semibold text-zinc-900 shadow-sm transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
              <span id="monto-ayuda" className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block">
                Máximo 2 decimales
              </span>
            </div>

            {/* Moneda Base */}
            <div className="md:col-span-3">
              <CurrencyCombobox
                id="moneda-base"
                label="Moneda origen"
                valor={base}
                onChange={setBase}
                monedaExcluida={destino}
              />
            </div>

            {/* Botón de Intercambio (RF-02) */}
            <div className="flex justify-center md:col-span-2">
              <button
                type="button"
                onClick={handleIntercambiar}
                aria-label={`Intercambiar ${base} por ${destino}`}
                title="Intercambiar monedas"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-zinc-300 bg-zinc-50 p-2.5 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-transform active:scale-95 shadow-sm"
              >
                <span className="text-xl" aria-hidden="true">⇄</span>
              </button>
            </div>

            {/* Moneda Destino */}
            <div className="md:col-span-3">
              <CurrencyCombobox
                id="moneda-destino"
                label="Moneda destino"
                valor={destino}
                onChange={setDestino}
                monedaExcluida={base}
              />
            </div>
          </div>
        </fieldset>
      </form>

      {/* Mensaje de error de carga */}
      {errorCarga && (
        <div
          role="alert"
          className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
        >
          {errorCarga}
        </div>
      )}

      {/* Caja de Resultado (RF-01, RF-05, Intl API, Clipboard API) */}
      <div className="mt-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-100 dark:border-blue-900/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 block">
              {montoFormateado} equivale a:
            </span>
            <div
              aria-live="polite"
              aria-atomic="true"
              className="mt-1 text-3xl font-extrabold tracking-tight text-blue-700 dark:text-blue-300 sm:text-4xl"
            >
              {cargandoTasa ? (
                <span className="inline-block animate-pulse text-zinc-400">Calculando...</span>
              ) : (
                resultadoFormateado
              )}
            </div>
            {/* RF-05: Mostrar siempre la fecha de la tasa */}
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <span>📅</span>
              <span>
                1 {base} = {tasa.toFixed(4)} {destino} · Tasa oficial del <strong>{fechaTasa}</strong>
              </span>
            </p>
          </div>

          {/* Acciones: Copiar y Favorito */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <button
              type="button"
              onClick={copiarResultado}
              aria-label="Copiar resultado de conversión al portapapeles"
              className="min-h-[44px] min-w-[44px] inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <span aria-hidden="true">{copiado ? "✓" : "📋"}</span>
              <span>{copiado ? "¡Copiado!" : "Copiar"}</span>
            </button>

            <button
              type="button"
              onClick={handleGuardarFavorito}
              disabled={guardandoFavorito}
              aria-label={`Guardar par ${base} a ${destino} en favoritos`}
              className="min-h-[44px] min-w-[44px] inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 border border-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              <span aria-hidden="true">⭐</span>
              <span>Guardar</span>
            </button>

            <Link
              href={`/historico?base=${base}&destino=${destino}`}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
              title="Ver gráfico histórico de este par"
            >
              <span aria-hidden="true">📈</span>
              <span>Histórico</span>
            </Link>
          </div>
        </div>

        {mensajeFavorito && (
          <div
            role="status"
            aria-live="polite"
            className="mt-3 rounded-md bg-blue-100 p-2 text-xs font-semibold text-blue-900 dark:bg-blue-900/40 dark:text-blue-200"
          >
            {mensajeFavorito}
          </div>
        )}
      </div>
    </div>
  );
}
