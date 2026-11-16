import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MultipleConversionTable } from "@/src/components/MultipleConversionTable";

describe("Componentes: MultipleConversionTable (Reto opcional)", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            base: "USD",
            fecha: "2026-11-16",
            valores: {
              EUR: 0.92,
              GBP: 0.79,
              JPY: 154.5,
              COP: 4120.0,
            },
          }),
      })
    );
  });

  it("Renderiza la tabla semántica con encabezados accesibles y conversiones calculadas", async () => {
    render(<MultipleConversionTable montoBase={100} monedaBase="USD" />);

    // Verificar tabla y encabezados
    const tabla = screen.getByRole("table");
    expect(tabla).toBeInTheDocument();

    const encabezados = screen.getAllByRole("columnheader");
    expect(encabezados.length).toBeGreaterThanOrEqual(4);

    await waitFor(() => {
      // Verificamos presencia de las filas de moneda
      expect(screen.getByText("EUR")).toBeInTheDocument();
      expect(screen.getByText("GBP")).toBeInTheDocument();
      expect(screen.getByText("COP")).toBeInTheDocument();
    });
  });
});
