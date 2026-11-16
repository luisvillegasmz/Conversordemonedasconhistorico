"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthContext";

export function Header() {
  const pathname = usePathname();
  const { usuario, cerrarSesion } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const enlaces = [
    { href: "/", label: "Conversor" },
    { href: "/historico", label: "Histórico" },
    { href: "/favoritos", label: "Favoritos" },
    { href: "/alertas", label: "Alertas" },
  ];

  return (
    <>
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:outline-none"
      >
        Saltar al contenido principal
      </a>

      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400 focus:rounded"
              aria-label="Inicio - Conversor de Monedas"
            >
              <span className="text-2xl" aria-hidden="true">💱</span>
              <span>MonedaExpress</span>
            </Link>
          </div>

          {/* Navegación de escritorio (>= 768px) */}
          <nav aria-label="Navegación principal" className="hidden md:flex md:items-center md:gap-6">
            <ul className="flex items-center gap-1 list-none m-0 p-0">
              {enlaces.map((enlace) => {
                const esActivo = pathname === enlace.href;
                return (
                  <li key={enlace.href}>
                    <Link
                      href={enlace.href}
                      aria-current={esActivo ? "page" : undefined}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        esActivo
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold"
                          : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {enlace.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-3 pl-4 border-l border-zinc-200 dark:border-zinc-800">
              {usuario ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[140px]" title={usuario.correo || usuario.uid}>
                    {usuario.correo || `ID: ${usuario.uid.slice(0, 6)}`}
                  </span>
                  <button
                    onClick={() => cerrarSesion()}
                    className="min-h-[44px] px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 rounded-md transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </nav>

          {/* Botón de menú móvil (< 768px) */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-expanded={menuAbierto}
              aria-controls="menu-movil"
              aria-label={menuAbierto ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-md text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 focus:outline-none"
            >
              <span className="text-xl" aria-hidden="true">{menuAbierto ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>

        {/* Panel del menú móvil */}
        {menuAbierto && (
          <nav
            id="menu-movil"
            aria-label="Navegación móvil"
            className="md:hidden border-b border-zinc-200 bg-white px-4 pt-2 pb-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <ul className="flex flex-col gap-1 list-none p-0 m-0">
              {enlaces.map((enlace) => {
                const esActivo = pathname === enlace.href;
                return (
                  <li key={enlace.href}>
                    <Link
                      href={enlace.href}
                      onClick={() => setMenuAbierto(false)}
                      aria-current={esActivo ? "page" : undefined}
                      className={`block min-h-[44px] px-3 py-3 rounded-md text-base font-medium ${
                        esActivo
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {enlace.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
              {usuario ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Conectado como: <strong>{usuario.correo || usuario.uid}</strong>
                  </p>
                  <button
                    onClick={() => {
                      cerrarSesion();
                      setMenuAbierto(false);
                    }}
                    className="min-h-[44px] w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 rounded-md"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuAbierto(false)}
                  className="min-h-[44px] flex items-center justify-center w-full rounded-md bg-blue-600 px-4 py-2.5 text-base font-medium text-white hover:bg-blue-700 text-center"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
