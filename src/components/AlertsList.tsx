"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CurrencyCombobox } from "./CurrencyCombobox";
import { CodigoMoneda } from "../schemas/monedas";
import { useAuth } from "./AuthContext";
import { AlertaEvaluada } from "../services/alertas.service";

export function AlertsList() {
  const { usuario } = useAuth();
  const [alertas, setAlertas] = useState<AlertaEvaluada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario nueva alerta
  const [base, setBase] = useState<CodigoMoneda>("USD");
  const [destino, setDestino] = useState<CodigoMoneda>("EUR");
  const [condicion, setCondicion] = useState<"mayor" | "menor">("mayor");
  const [valor, setValor] = useState<string>("0.95");
  const [guardando, setGuardando] = useState(false);
  const [mensajeForm, setMensajeForm] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  const cargarAlertas = async () => {
    setError(null);
    try {
      const res = await fetch("/api/alertas");
      if (!res.ok) {
        throw new Error("No se pudieron cargar tus alertas de tasa");
      }
      const data = await res.json();
      setAlertas(data.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar las alertas");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let activo = true;
    async function inicializar() {
      if (!usuario) {
        setCargando(false);
        return;
      }
      try {
        const res = await fetch("/api/alertas");
        if (res.ok && activo) {
          const data = await res.json();
          setAlertas(data.items || []);
        }
      } catch (err: unknown) {
        if (activo) setError(err instanceof Error ? err.message : "Error");
      } finally {
        if (activo) setCargando(false);
      }
    }
    inicializar();
    return () => {
      activo = false;
    };
  }, [usuario]);

  const handleCrearAlerta = async (e: React.FormEvent) => {
    e.preventDefault();
    const valorNum = parseFloat(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      setMensajeForm({ tipo: "error", texto: "Ingresa un valor numérico positivo válido" });
      return;
    }
    if (base === destino) {
      setMensajeForm({ tipo: "error", texto: "La moneda base y de destino no pueden ser iguales" });
      return;
    }

    setGuardando(true);
    setMensajeForm(null);

    try {
      const res = await fetch("/api/alertas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base,
          destino,
          condicion,
          valor: valorNum,
          activa: true,
        }),
      });

      if (res.status === 201) {
        setMensajeForm({ tipo: "exito", texto: "¡Alerta creada y activada correctamente!" });
        cargarAlertas();
      } else {
        const errorData = await res.json();
        setMensajeForm({ tipo: "error", texto: errorData.error || "Error al registrar la alerta" });
      }
    } catch {
      setMensajeForm({ tipo: "error", texto: "Error de conexión al crear alerta" });
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleActiva = async (alerta: AlertaEvaluada) => {
    try {
      const res = await fetch(`/api/alertas/${alerta.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activa: !alerta.activa }),
      });

      if (res.ok) {
        setAlertas((prev) =>
          prev.map((a) => (a.id === alerta.id ? { ...a, activa: !a.activa } : a))
        );
      }
    } catch (err) {
      console.error("Error al actualizar alerta:", err);
    }
  };

  const handleEliminarAlerta = async (id: string) => {
    if (!window.confirm("¿Deseas eliminar esta alerta?")) return;

    try {
      const res = await fetch(`/api/alertas/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAlertas((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Error al eliminar alerta:", err);
    }
  };

  if (!usuario) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <span className="text-4xl" aria-hidden="true">🔔</span>
        <h2 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Inicia sesión para configurar alertas
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Recibe avisos visuales automáticos cuando la tasa cambiaria supere o baje del umbral que definas.
        </p>
        <Link
          href="/login?redireccion=/alertas"
          className="min-h-[44px] mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
        >
          Iniciar sesión ahora
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Formulario de creación de alertas */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Crear nueva alerta de tasa
        </h2>

        <form onSubmit={handleCrearAlerta}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-3">
              <CurrencyCombobox
                id="alerta-base"
                label="Moneda origen"
                valor={base}
                onChange={setBase}
                monedaExcluida={destino}
              />
            </div>
            <div className="lg:col-span-3">
              <CurrencyCombobox
                id="alerta-destino"
                label="Moneda destino"
                valor={destino}
                onChange={setDestino}
                monedaExcluida={base}
              />
            </div>
            <div className="lg:col-span-3">
              <label
                htmlFor="condicion-select"
                className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-1"
              >
                Condición
              </label>
              <select
                id="condicion-select"
                value={condicion}
                onChange={(e) => setCondicion(e.target.value as "mayor" | "menor")}
                className="min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="mayor">Tasa sea mayor que (&gt;)</option>
                <option value="menor">Tasa sea menor que (&lt;)</option>
              </select>
            </div>
            <div className="lg:col-span-3">
              <label
                htmlFor="valor-input"
                className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-1"
              >
                Valor umbral
              </label>
              <div className="flex gap-2">
                <input
                  id="valor-input"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  required
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="min-h-[44px] flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  disabled={guardando}
                  className="min-h-[44px] rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {guardando ? "..." : "+ Crear"}
                </button>
              </div>
            </div>
          </div>
        </form>

        {mensajeForm && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-4 rounded-lg p-3 text-sm font-medium ${
              mensajeForm.tipo === "exito"
                ? "bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800"
                : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800"
            }`}
          >
            {mensajeForm.texto}
          </div>
        )}
      </div>

      {/* Lista de alertas */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Tus alertas de tasa ({alertas.length})
          </h2>
          <button
            type="button"
            onClick={cargarAlertas}
            aria-label="Re-evaluar y actualizar alertas"
            className="min-h-[44px] text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400 p-2"
          >
            🔄 Evaluar contra tasas actuales
          </button>
        </div>

        {cargando ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-6 text-center text-red-700 dark:bg-red-950/40 dark:text-red-400">
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={cargarAlertas}
              className="min-h-[44px] mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        ) : alertas.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <span className="text-3xl block mb-2" aria-hidden="true">🔔</span>
            <p className="text-sm font-medium">No tienes alertas configuradas.</p>
            <p className="text-xs text-zinc-400 mt-1">
              Configura una alerta para ser notificado cuando una tasa alcance tu precio objetivo.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {alertas.map((alerta) => (
              <div
                key={alerta.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border transition-all ${
                  alerta.cumpleCondicion && alerta.activa
                    ? "border-amber-400 bg-amber-50/60 dark:border-amber-700 dark:bg-amber-950/20 shadow-sm"
                    : !alerta.activa
                    ? "border-zinc-200 bg-zinc-50/40 opacity-60 dark:border-zinc-800 dark:bg-zinc-900/40"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      1 {alerta.base} ➔ {alerta.destino}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        alerta.cumpleCondicion && alerta.activa
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200"
                          : alerta.activa
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200"
                          : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {alerta.cumpleCondicion && alerta.activa
                        ? "🚨 ¡Condición alcanzada!"
                        : alerta.activa
                        ? "Monitoreando"
                        : "Pausada"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Avisar cuando la tasa sea{" "}
                    <strong>{alerta.condicion === "mayor" ? "mayor a" : "menor a"} {alerta.valor}</strong>
                    {" · "}
                    Tasa actual:{" "}
                    <strong className="font-mono text-zinc-900 dark:text-zinc-100">
                      {alerta.tasaActual ? alerta.tasaActual.toFixed(4) : "Cargando..."}
                    </strong>
                  </p>
                </div>

                <div className="mt-3 sm:mt-0 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleActiva(alerta)}
                    className={`min-h-[44px] px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      alerta.activa
                        ? "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        : "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    }`}
                  >
                    {alerta.activa ? "Pausar" : "Activar"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEliminarAlerta(alerta.id)}
                    aria-label="Eliminar alerta"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-red-600 dark:hover:text-red-400 p-2"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
