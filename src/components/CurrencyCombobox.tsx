"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MONEDAS_PERMITIDAS,
  NOMBRES_MONEDAS,
  CodigoMoneda,
} from "../schemas/monedas";

interface CurrencyComboboxProps {
  id: string;
  label: string;
  valor: CodigoMoneda;
  onChange: (moneda: CodigoMoneda) => void;
  monedaExcluida?: CodigoMoneda;
}

export function CurrencyCombobox({
  id,
  label,
  valor,
  onChange,
  monedaExcluida,
}: CurrencyComboboxProps) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [indiceActivo, setIndiceActivo] = useState(0);

  const contenedorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);

  const listboxId = `${id}-listbox`;

  // Monedas filtradas según búsqueda
  const monedasDisponibles = MONEDAS_PERMITIDAS.filter(
    (m) => m !== monedaExcluida
  ).filter((m) => {
    const texto = `${m} ${NOMBRES_MONEDAS[m]}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase().trim());
  });

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(event.target as Node)
      ) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mantener scroll sincronizado con el item activo
  useEffect(() => {
    if (abierto && listaRef.current) {
      const activeElement = listaRef.current.children[indiceActivo] as HTMLElement;
      if (activeElement && typeof activeElement.scrollIntoView === "function") {
        activeElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [indiceActivo, abierto]);

  const seleccionar = (moneda: CodigoMoneda) => {
    onChange(moneda);
    setAbierto(false);
    setBusqueda("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!abierto) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setAbierto(true);
        setIndiceActivo(
          Math.max(
            0,
            monedasDisponibles.findIndex((m) => m === valor)
          )
        );
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIndiceActivo((prev) =>
          prev < monedasDisponibles.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setIndiceActivo((prev) =>
          prev > 0 ? prev - 1 : monedasDisponibles.length - 1
        );
        break;
      case "Home":
        e.preventDefault();
        setIndiceActivo(0);
        break;
      case "End":
        e.preventDefault();
        setIndiceActivo(monedasDisponibles.length - 1);
        break;
      case "Enter":
        e.preventDefault();
        if (monedasDisponibles[indiceActivo]) {
          seleccionar(monedasDisponibles[indiceActivo]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setAbierto(false);
        break;
      case "Tab":
        setAbierto(false);
        break;
    }
  };

  const activeDescendantId =
    abierto && monedasDisponibles[indiceActivo]
      ? `${id}-opt-${monedasDisponibles[indiceActivo]}`
      : undefined;

  return (
    <div ref={contenedorRef} className="relative w-full">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-1"
      >
        {label}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={abierto}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-activedescendant={activeDescendantId}
          value={abierto ? busqueda : `${valor} — ${NOMBRES_MONEDAS[valor]}`}
          onChange={(e) => {
            setBusqueda(e.target.value);
            if (!abierto) setAbierto(true);
            setIndiceActivo(0);
          }}
          onFocus={() => {
            setAbierto(true);
            setIndiceActivo(
              Math.max(
                0,
                monedasDisponibles.findIndex((m) => m === valor)
              )
            );
          }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar moneda (código o nombre)..."
          className="min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 pr-10 text-base text-zinc-900 shadow-sm transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
        />

        <button
          type="button"
          tabIndex={-1}
          aria-label={abierto ? "Cerrar opciones" : "Ver lista de monedas"}
          onClick={() => {
            setAbierto(!abierto);
            inputRef.current?.focus();
          }}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 min-h-[44px]"
        >
          <span className="text-xs" aria-hidden="true">
            {abierto ? "▲" : "▼"}
          </span>
        </button>
      </div>

      {abierto && (
        <ul
          ref={listaRef}
          id={listboxId}
          role="listbox"
          aria-label={`Opciones para ${label}`}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-xl focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 list-none p-0 m-0"
        >
          {monedasDisponibles.length === 0 ? (
            <li className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
              No se encontraron monedas que coincidan
            </li>
          ) : (
            monedasDisponibles.map((moneda, index) => {
              const estaSeleccionado = moneda === valor;
              const estaActivo = index === indiceActivo;

              return (
                <li
                  key={moneda}
                  id={`${id}-opt-${moneda}`}
                  role="option"
                  aria-selected={estaSeleccionado}
                  onClick={() => seleccionar(moneda)}
                  onMouseEnter={() => setIndiceActivo(index)}
                  className={`min-h-[44px] flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors ${
                    estaActivo
                      ? "bg-blue-600 text-white font-medium"
                      : estaSeleccionado
                      ? "bg-blue-50 text-blue-900 font-semibold dark:bg-blue-950/50 dark:text-blue-200"
                      : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <strong className="tracking-wide">{moneda}</strong>
                    <span
                      className={`text-xs ${
                        estaActivo
                          ? "text-blue-100"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {NOMBRES_MONEDAS[moneda]}
                    </span>
                  </span>
                  {estaSeleccionado && (
                    <span aria-hidden="true" className="text-sm">✓</span>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
