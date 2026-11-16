"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/components/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redireccion = searchParams.get("redireccion") || "/";

  const { iniciarSesion, registrarse, usuario } = useAuth();

  const [esRegistro, setEsRegistro] = useState(false);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  // Si ya tiene sesión, redirigir
  if (usuario) {
    router.push(redireccion);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);
    setProcesando(true);

    try {
      if (esRegistro) {
        await registrarse(correo, contrasena);
      } else {
        await iniciarSesion(correo, contrasena);
      }
      router.push(redireccion);
    } catch (err: unknown) {
      setErrorLocal(err instanceof Error ? err.message : "Error al procesar la autenticación");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <header className="text-center mb-6">
          <span className="text-4xl" aria-hidden="true">🔑</span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {esRegistro ? "Crear una cuenta nueva" : "Iniciar sesión"}
          </h1>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {esRegistro
              ? "Regístrate para guardar favoritos y crear alertas de cambio"
              : "Accede a tus pares favoritos y tus alertas activas"}
          </p>
        </header>

        {/* Alternador de pestañas Login / Registro */}
        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 p-1 mb-6 bg-zinc-50 dark:bg-zinc-800/60">
          <button
            type="button"
            onClick={() => {
              setEsRegistro(false);
              setErrorLocal(null);
            }}
            className={`min-h-[44px] flex-1 rounded-md text-xs font-semibold transition-colors ${
              !esRegistro
                ? "bg-white text-blue-600 shadow dark:bg-zinc-900 dark:text-blue-400"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setEsRegistro(true);
              setErrorLocal(null);
            }}
            className={`min-h-[44px] flex-1 rounded-md text-xs font-semibold transition-colors ${
              esRegistro
                ? "bg-white text-blue-600 shadow dark:bg-zinc-900 dark:text-blue-400"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email-input"
              className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-1"
            >
              Correo electrónico
            </label>
            <input
              id="email-input"
              type="email"
              required
              autoComplete="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="usuario@ejemplo.com"
              className="min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label
              htmlFor="password-input"
              className="block text-sm font-semibold text-zinc-700 dark:text-zinc-200 mb-1"
            >
              Contraseña
            </label>
            <input
              id="password-input"
              type="password"
              required
              autoComplete={esRegistro ? "new-password" : "current-password"}
              minLength={6}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              className="min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          {errorLocal && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800"
            >
              {errorLocal}
            </div>
          )}

          <button
            type="submit"
            disabled={procesando}
            className="min-h-[44px] w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2"
          >
            {procesando
              ? "Procesando..."
              : esRegistro
              ? "Crear cuenta"
              : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          La autenticación se realiza de manera segura con Firebase Authentication y cookies de sesión HttpOnly.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[50vh] items-center justify-center">
          <p className="text-sm text-zinc-500 animate-pulse">Cargando...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
