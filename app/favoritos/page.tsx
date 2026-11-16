import React from "react";
import { FavoritesList } from "@/src/components/FavoritesList";

export default function FavoritosPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Tus Pares Favoritos
        </h1>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Guarda y gestiona los pares de divisas que utilizas con mayor frecuencia para convertir y consultar su histórico en segundos.
        </p>
      </section>

      <section aria-labelledby="seccion-lista-favoritos">
        <h2 id="seccion-lista-favoritos" className="sr-only">
          Listado de pares de divisas favoritos
        </h2>
        <FavoritesList />
      </section>
    </div>
  );
}
