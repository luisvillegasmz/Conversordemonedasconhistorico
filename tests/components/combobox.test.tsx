import React, { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CurrencyCombobox } from "@/src/components/CurrencyCombobox";
import { CodigoMoneda } from "@/src/schemas/monedas";

function ComboboxWrapper({ onChange }: { onChange?: (val: CodigoMoneda) => void }) {
  const [moneda, setMoneda] = useState<CodigoMoneda>("USD");
  return (
    <CurrencyCombobox
      id="test-combo"
      label="Moneda origen"
      valor={moneda}
      onChange={(m) => {
        setMoneda(m);
        onChange?.(m);
      }}
    />
  );
}

describe("Componentes: CurrencyCombobox Accesible", () => {
  it("Renderiza con rol combobox, label asociado y valor inicial", () => {
    render(<ComboboxWrapper />);

    const combobox = screen.getByRole("combobox", { name: "Moneda origen" });
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveValue("USD — Dólar estadounidense ($)");
  });

  it("Criterio 3: Permite filtrar y seleccionar una moneda usando únicamente el teclado", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ComboboxWrapper onChange={handleChange} />);

    const combobox = screen.getByRole("combobox", { name: "Moneda origen" });

    // Hacemos tab/foco al combobox
    await user.click(combobox);
    expect(combobox).toHaveAttribute("aria-expanded", "true");

    // Escribimos para filtrar
    await user.clear(combobox);
    await user.type(combobox, "EUR");

    // Opciones filtradas
    const opcion = screen.getByRole("option", { name: /EUR/i });
    expect(opcion).toBeInTheDocument();

    // Navegar y seleccionar con Enter
    await user.keyboard("{ArrowDown}{Enter}");

    expect(handleChange).toHaveBeenCalledWith("EUR");
    expect(combobox).toHaveAttribute("aria-expanded", "false");
  });

  it("Se cierra al presionar Escape", async () => {
    const user = userEvent.setup();
    render(<ComboboxWrapper />);

    const combobox = screen.getByRole("combobox", { name: "Moneda origen" });
    await user.click(combobox);
    expect(combobox).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");
    expect(combobox).toHaveAttribute("aria-expanded", "false");
  });
});
