"use client";

import React, { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Error Boundary]", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center"
    >
      <span className="text-5xl" aria-hidden="true">⚠️</span>
      <h2 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Ha ocurrido un problema inesperado
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        No se pudieron cargar los datos solicitados. Por favor intenta recargar la vista.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="min-h-[44px] mt-6 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
      >
        Reintentar carga
      </button>
    </div>
  );
}
