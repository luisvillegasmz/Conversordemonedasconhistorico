// src/components/AlertasList.tsx
import React, { useEffect, useState } from 'react';

export interface Alerta {
  id: string;
  base: string;
  destino: string;
  condicion: 'mayor' | 'menor';
  valor: number;
  activa: boolean;
  creadaEn: string;
  tasaActual?: number;
  cumpleCondicion?: boolean;
}

export const AlertasList: React.FC<{ onEdit: (alerta: Alerta) => void }> = ({ onEdit }) => {
  const [alertas, setAlertas] = useState<Alerta[] | null>(null);

  const cargarAlertas = async () => {
    try {
      const res = await fetch('/api/alertas', { credentials: 'include' });
      if (!res.ok) throw new Error('Error al cargar alertas');
      const data = await res.json();
      setAlertas(data.items);
    } catch (e) {
      console.error(e);
      setAlertas([]);
    }
  };

  const eliminar = async (id: string) => {
    await fetch(`/api/alertas/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    cargarAlertas();
  };

  useEffect(() => {
    const load = async () => {
      await cargarAlertas();
    };
    load();
  }, []);

  if (alertas === null) return <p>Cargando alertas…</p>;
  if (alertas.length === 0) return <p>No hay alertas registradas.</p>;

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2">Base</th>
          <th className="border p-2">Destino</th>
          <th className="border p-2">Condición</th>
          <th className="border p-2">Valor</th>
          <th className="border p-2">Activa</th>
          <th className="border p-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {alertas.map((a) => (
          <tr key={a.id}>
            <td className="border p-2">{a.base}</td>
            <td className="border p-2">{a.destino}</td>
            <td className="border p-2 text-center">{a.condicion}</td>
            <td className="border p-2 text-right">{a.valor}</td>
            <td className="border p-2 text-center">{a.activa ? 'Sí' : 'No'}</td>
            <td className="border p-2 space-x-2">
              <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => onEdit(a)}>
                Editar
              </button>
              <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => eliminar(a.id)}>
                Borrar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
