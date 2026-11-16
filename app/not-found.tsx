import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl font-extrabold text-blue-600 dark:text-blue-400">404</span>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Página no encontrada
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        La ruta a la que intentas acceder no existe o fue trasladada.
      </p>
      <Link
        href="/"
        className="min-h-[44px] mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
      >
        Volver al conversor principal
      </Link>
    </div>
  );
}
