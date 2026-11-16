"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ParFavorito } from "../repositories/favoritos.repository";
import { CurrencyCombobox } from "./CurrencyCombobox";
import { CodigoMoneda, NOMBRES_MONEDAS } from "../schemas/monedas";
import { useAuth } from "./AuthContext";

export function FavoritesList() {
  const { usuario } = useAuth();
  const [favoritos, setFavoritos] = useState<ParFavorito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario para añadir nuevo favorito
  const [nuevaBase, setNuevaBase] = useState<CodigoMoneda>("USD");
  const [nuevoDestino, setNuevoDestino] = useState<CodigoMoneda>("COP");
  const [agregando, setAgregando] = useState(false);
  const [mensajeForm, setMensajeForm] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  const cargarFavoritos = async () => {
    setError(null);
    try {
      const res = await fetch("/api/favoritos");
      if (!res.ok) {
        throw new Error("No se pudieron cargar tus pares favoritos");
      }
      const data = await res.json();
      setFavoritos(data.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar favoritos");
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
        const res = await fetch("/api/favoritos");
        if (res.ok && activo) {
          const data = await res.json();
          setFavoritos(data.items || []);
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

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaBase === nuevoDestino) {
      setMensajeForm({
        tipo: "error",
        texto: "La moneda base y la de destino no pueden ser iguales",
      });
      return;
    }

    setAgregando(true);
    setMensajeForm(null);

    try {
      const res = await fetch("/api/favoritos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base: nuevaBase, destino: nuevoDestino }),
      });

      if (res.status === 201) {
        setMensajeForm({ tipo: "exito", texto: "¡Par favorito guardado con éxito!" });
        cargarFavoritos();
      } else if (res.status === 409) {
        setMensajeForm({ tipo: "error", texto: "Este par ya está en tu lista de favoritos" });
      } else {
        const errorData = await res.json();
        setMensajeForm({ tipo: "error", texto: errorData.error || "Error al guardar el par" });
      }
    } catch {
      setMensajeForm({ tipo: "error", texto: "Error de conexión al agregar favorito" });
    } finally {
      setAgregando(false);
    }
  };

  const handleEliminar = async (id: string, parNombre: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el par ${parNombre} de tus favoritos?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/favoritos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFavoritos((prev) => prev.filter((fav) => fav.id !== id));
      } else {
        alert("No se pudo eliminar el par favorito");
      }
    } catch {
      alert("Error de conexión al eliminar favorito");
    }
  };

  if (!usuario) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <span className="text-4xl" aria-hidden="true">🔒</span>
        <h2 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Inicia sesión para gestionar favoritos
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          Guarda tus pares de monedas recurrentes y accede a ellos rápidamente con un solo clic.
        </p>
        <Link
          href="/login?redireccion=/favoritos"
          className="min-h-[44px] mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
        >
          Iniciar sesión ahora
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Formulario para agregar nuevo par */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Agregar nuevo par favorito
        </h2>

        <form onSubmit={handleAgregar}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-5">
              <CurrencyCombobox
                id="fav-base"
                label="Moneda origen"
                valor={nuevaBase}
                onChange={setNuevaBase}
                monedaExcluida={nuevoDestino}
              />
            </div>
            <div className="lg:col-span-5">
              <CurrencyCombobox
                id="fav-destino"
                label="Moneda destino"
                valor={nuevoDestino}
                onChange={setNuevoDestino}
                monedaExcluida={nuevaBase}
              />
            </div>
            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={agregando}
                className="min-h-[44px] w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {agregando ? "Guardando..." : "+ Agregar"}
              </button>
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

      {/* Lista de favoritos guardados */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Tus pares favoritos guardados ({favoritos.length})
          </h2>
          <button
            type="button"
            onClick={cargarFavoritos}
            aria-label="Recargar lista de favoritos"
            className="min-h-[44px] text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400 p-2"
          >
            🔄 Actualizar
          </button>
        </div>

        {cargando ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-6 text-center text-red-700 dark:bg-red-950/40 dark:text-red-400">
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={cargarFavoritos}
              className="min-h-[44px] mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        ) : favoritos.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <span className="text-3xl block mb-2" aria-hidden="true">⭐</span>
            <p className="text-sm font-medium">Aún no tienes pares favoritos registrados.</p>
            <p className="text-xs text-zinc-400 mt-1">
              Agrega uno usando el formulario de arriba o desde la pantalla de conversión.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoritos.map((fav) => (
              <div
                key={fav.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition-all hover:border-blue-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-wide">
                      {fav.base} ➔ {fav.destino}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEliminar(fav.id, `${fav.base}/${fav.destino}`)}
                      aria-label={`Eliminar favorito ${fav.base} a ${fav.destino}`}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Eliminar de favoritos"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {NOMBRES_MONEDAS[fav.base as CodigoMoneda] || fav.base} a{" "}
                    {NOMBRES_MONEDAS[fav.destino as CodigoMoneda] || fav.destino}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <Link
                    href={`/?base=${fav.base}&destino=${fav.destino}`}
                    className="min-h-[44px] flex-1 rounded-lg bg-blue-50 py-2 px-3 text-center text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors inline-flex items-center justify-center"
                  >
                    💱 Convertir
                  </Link>
                  <Link
                    href={`/historico?base=${fav.base}&destino=${fav.destino}`}
                    className="min-h-[44px] flex-1 rounded-lg bg-zinc-100 py-2 px-3 text-center text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors inline-flex items-center justify-center"
                  >
                    📈 Gráfico
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
