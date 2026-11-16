import React from "react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
            © 2026 MonedaExpress · Proyecto 33 (Conversor de monedas con histórico).
          </p>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-right">
            Datos provistos por el Banco Central Europeo mediante{" "}
            <a
              href="https://frankfurter.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Frankfurter API
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
