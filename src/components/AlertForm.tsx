// src/components/AlertForm.tsx
import React, { useState, FormEvent } from "react";
import { z } from "zod";
import { alertaCreateSchema, alertaUpdateSchema } from "@/src/lib/validation/alertas";

// Props for the component
interface AlertFormProps {
  /**
   * If provided, the form works in "edit" mode and pre‑populates fields.
   * The schema expects the same shape as the API payload.
   */
  initialData?: any;
  /** Callback after a successful create / update to refresh the list */
  onSuccess?: () => void;
  /** Close the form (used when the component is shown in a modal) */
  onCancel?: () => void;
}

export const AlertForm: React.FC<AlertFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const isEdit = !!initialData;
  const [formState, setFormState] = useState<z.infer<typeof alertaCreateSchema>>(
    initialData ?? {
      base: "",
      destino: "",
      condicion: "mayor",
      valor: 0,
      activa: true,
    }
  );
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setFormState(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (checked as boolean) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    // Validate with Zod – pick the correct schema (create vs update)
    const schema = isEdit ? alertaUpdateSchema : alertaCreateSchema;
    const parseResult = schema.safeParse(formState);
    if (!parseResult.success) {
      setError("Datos del formulario no válidos.");
      return;
    }
    try {
      const method = isEdit ? "PATCH" : "POST";
      const url = isEdit ? `/api/alertas/${initialData!.id}` : "/api/alertas";
      const resp = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(parseResult.data),
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error ?? "Error del servidor");
      }
      // Success – inform parent and optionally reset form
      onSuccess?.();
      if (!isEdit) {
        // clear fields for a new alert
        setFormState({ base: "", destino: "", condicion: "mayor", valor: 0, activa: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white">
      {error && <p className="text-red-600">{error}</p>}
      <div>
        <label className="block font-medium" htmlFor="base">
          Moneda base
        </label>
        <input
          id="base"
          name="base"
          type="text"
          value={formState.base}
          onChange={handleChange}
          required
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>
      <div>
        <label className="block font-medium" htmlFor="destino">
          Moneda destino
        </label>
        <input
          id="destino"
          name="destino"
          type="text"
          value={formState.destino}
          onChange={handleChange}
          required
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>
      <div>
        <label className="block font-medium" htmlFor="condicion">
          Condición
        </label>
        <select
          id="condicion"
          name="condicion"
          value={formState.condicion}
          onChange={handleChange}
          className="mt-1 block w-full border rounded-md p-2"
        >
          <option value="mayor">Mayor que</option>
          <option value="menor">Menor que</option>
        </select>
      </div>
      <div>
        <label className="block font-medium" htmlFor="valor">
          Valor
        </label>
        <input
          id="valor"
          name="valor"
          type="number"
          step="any"
          value={formState.valor}
          onChange={handleChange}
          required
          className="mt-1 block w-full border rounded-md p-2"
        />
      </div>
      <div className="flex items-center">
        <input
          id="activa"
          name="activa"
          type="checkbox"
          checked={formState.activa}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
        />
        <label htmlFor="activa" className="ml-2 block text-sm">
          Activada
        </label>
      </div>
      <div className="flex space-x-2">
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
          {isEdit ? "Actualizar" : "Crear"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};
