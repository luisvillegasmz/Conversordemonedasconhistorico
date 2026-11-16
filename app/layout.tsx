import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { AuthProvider } from "@/src/components/AuthContext";

export const metadata: Metadata = {
  title: "MonedaExpress · Conversor de Monedas con Histórico",
  description:
    "Convierte monedas con tasas de cambio del Banco Central Europeo en tiempo real, guarda pares favoritos, monitorea alertas y analiza históricos en gráficos interactivos.",
  keywords: [
    "conversor de monedas",
    "tasas de cambio",
    "dólar",
    "euro",
    "peso colombiano",
    "divisas",
    "histórico cambiario",
  ],
  authors: [{ name: "Desarrollo Web - TdeA" }],
  openGraph: {
    title: "MonedaExpress · Conversor de Monedas con Histórico",
    description:
      "Convierte divisas al instante con tasas oficiales y gráficos interactivos.",
    type: "website",
    locale: "es_CO",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
        <AuthProvider>
          <Header />
          <main
            id="contenido-principal"
            tabIndex={-1}
            className="flex-1 focus:outline-none"
          >
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
