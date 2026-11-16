import React from "react";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-blue-950 dark:border-t-blue-400" />
      <p className="mt-4 text-base font-medium text-zinc-600 dark:text-zinc-400">
        Cargando contenido...
      </p>
      <span className="sr-only">Por favor espere mientras cargan los datos.</span>
    </div>
  );
}
