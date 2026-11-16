"use client";
import React, { useState } from "react";
import { AlertasList } from "@/src/components/AlertasList";
import { AlertForm } from "@/src/components/AlertForm";

/**
 * Página de gestión de alertas del usuario.
 * Muestra la lista de alertas y permite crear o editar mediante un modal.
 */
export default function AlertasPage() {
  const [editingAlert, setEditingAlert] = useState<null | any>(null);
  const [showForm, setShowForm] = useState(false);

  const handleEdit = (alertData: any) => {
    setEditingAlert(alertData);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingAlert(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAlert(null);
  };

  // Refresh list after a successful operation by toggling a key
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(k => k + 1);

  return (
    <section className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mis Alertas</h1>
      <button
        onClick={handleCreate}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded"
      >
        Crear nueva alerta
      </button>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <AlertForm
              initialData={editingAlert}
              onSuccess={() => {
                closeForm();
                refresh();
              }}
              onCancel={closeForm}
            />
          </div>
        </div>
      )}
      <AlertasList key={refreshKey} onEdit={handleEdit} />
    </section>
  );
}
