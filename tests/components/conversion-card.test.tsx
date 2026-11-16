import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConversionCard } from "@/src/components/ConversionCard";

// Mock del AuthContext
vi.mock("@/src/components/AuthContext", () => ({
  useAuth: () => ({
    usuario: { uid: "user_test_123", correo: "test@ejemplo.com", rol: "usuario" },
  }),
}));

describe("Componentes: ConversionCard", () => {
  beforeEach(() => {
    // Mock de fetch para tasas
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/tasas")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              base: "USD",
              fecha: "2026-11-16",
              valores: { EUR: 0.92, USD: 1.0 },
            }),
        });
      }
      return Promise.reject(new Error("Ruta no mockeada"));
    });
  });

  it("RF-01 y RF-05: Renderiza el formulario con campo de monto y muestra la fecha de la tasa", async () => {
    render(<ConversionCard tasaInicial={0.92} fechaInicial="2026-11-16" />);

    const inputMonto = screen.getByLabelText(/monto/i);
    expect(inputMonto).toBeInTheDocument();
    expect(inputMonto).toHaveValue(100);

    // Muestra la fecha de la tasa
    expect(screen.getByText(/2026-11-16/i)).toBeInTheDocument();
  });

  it("RF-02: Intercambia las monedas al hacer clic en el botón de intercambio", async () => {
    const user = userEvent.setup();
    render(<ConversionCard tasaInicial={0.92} fechaInicial="2026-11-16" />);

    const botonIntercambiar = screen.getByRole("button", {
      name: /intercambiar/i,
    });
    expect(botonIntercambiar).toBeInTheDocument();

    await user.click(botonIntercambiar);

    const comboboxOrigen = screen.getByRole("combobox", { name: /moneda origen/i });
    expect(comboboxOrigen).toHaveValue("EUR — Euro (€)");
  });

  it("Permite copiar el resultado con el botón de copiar", async () => {
    const user = userEvent.setup();
    // Mock clipboard
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });

    render(<ConversionCard tasaInicial={0.92} fechaInicial="2026-11-16" />);

    const botonCopiar = screen.getByRole("button", { name: /copiar resultado/i });
    expect(botonCopiar).toBeInTheDocument();

    await user.click(botonCopiar);

    await waitFor(() => {
      expect(screen.getByText("¡Copiado!")).toBeInTheDocument();
    });
  });
});
