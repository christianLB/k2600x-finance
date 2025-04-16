"use client";
import { useState } from "react";
import { TagsSelector } from "@/components/operation-tags/TagsSelector";
import { Button } from "@/components/ui/button";

interface ExpenseFormProps {
  row: any;
  onChange: (row: any) => void;
  onSubmit: (row: any) => void;
  onCancel: () => void;
}

export default function ExpenseForm({ row, onChange, onSubmit, onCancel }: ExpenseFormProps) {
  const [form, setForm] = useState(row || {});

  function handleFieldChange(field: string, value: any) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onChange(updated);
  }

  function handleTagSelect(tag: any) {
    handleFieldChange("tag", tag);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded shadow-lg p-6 min-w-[300px] max-w-[90vw] flex flex-col gap-4"
      >
        <h2 className="font-bold mb-2">{form?.id ? "Editar" : "Crear"} Gasto</h2>
        <input
          className="border rounded px-2 py-1"
          placeholder="Descripción"
          value={form.descripcion || ""}
          onChange={e => handleFieldChange("descripcion", e.target.value)}
        />
        <input
          className="border rounded px-2 py-1"
          placeholder="Monto"
          type="number"
          value={form.monto || ""}
          onChange={e => handleFieldChange("monto", parseFloat(e.target.value))}
        />
        <TagsSelector
          appliesTo="operations"
          currentTag={form.tag}
          onSelect={handleTagSelect}
          placeholder="Seleccionar tag"
        />
        <div className="flex gap-2 justify-end mt-4">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="default">
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
}
