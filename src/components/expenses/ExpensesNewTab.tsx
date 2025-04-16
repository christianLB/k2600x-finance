// ExpensesNewTab.tsx
"use client";

import { format } from "date-fns";
import { FullStrapiTable } from "@/components/tables/FullStrapiTable";
import { ColumnDefinition } from "@/components/tables/StrapiTable";
import { TagsSelector } from "@/components/operation-tags/TagsSelector";
import ExpenseForm from "./ExpenseForm";
import { useStrapiUpdateMutation } from "@/hooks/useStrapiUpdateMutation";
import { toast } from "sonner";
import { useCallback } from "react";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";
import { Switch } from "@/components/ui/switch";
import { useConfirm } from "@/hooks/useConfirm";
import useStrapiDelete from "@/hooks/useStrapiDelete";
import { PencilIcon, Trash2Icon } from "lucide-react";

interface Expense {
  documentId: string;
  id: number;
  fechaMovimiento: string;
  fechaValor: string;
  monto: number;
  moneda: string;
  descripcion: string;
  cuenta: string;
  titularCuenta: string;
  concepto: string;
  operation_tag: string;
  posibleDuplicado: boolean;
  estadoConciliacion: string;
  justificante?: {
    id: number;
    documentId: string;
    name: string;
    url: string;
  };
}

const ExpensesNewTab = () => {
  // Fetch all tags for lookup (for appliesTo="operations")
  const { data: { data: allTags = [] } = { data: [] }, isLoading: tagsLoading, refetch } = useStrapiCollection("operation-tags", {
    filters: { appliesTo: { $contains: "operation" } },
    pagination: { page: 1, pageSize: 500 },
    populate: ["parent_tag"],
  });

  // --- Mutations ---
  const updateTagMutation = useStrapiUpdateMutation("operations");
  const updateDuplicadoMutation = useStrapiUpdateMutation("operations");
  const updateEstadoMutation = useStrapiUpdateMutation("operations");
  const { mutate: deleteExpense } = useStrapiDelete("operations", refetch);
  const confirm = useConfirm();

  // Helper to always return the tag object for a given expense
  const getTagObject = (expense) => {
    const tagValue = expense.operation_tag;
    if (typeof tagValue === "object" && tagValue !== null) return tagValue;
    if (!tagValue) return undefined;
    // Try to find the tag object by ID
    return allTags.find((t) => t.id === tagValue) || undefined;
  };

  // --- Actions Column ---
  const renderActions = (expense) => (
    <div className="flex gap-2 justify-center">
      <button
        className="text-gray-500 hover:text-blue-600"
        title="Editar"
        onClick={() => {
          // You may want to trigger edit modal here
          // For now, just a placeholder
          toast.info("Funcionalidad de edición no implementada");
        }}
      >
        <PencilIcon className="w-4 h-4" />
      </button>
      <button
        className="text-gray-500 hover:text-red-600"
        title="Eliminar"
        onClick={() => {
          confirm({
            title: "¿Eliminar gasto?",
            description: "Esta acción no se puede deshacer. ¿Deseas continuar?",
            confirmText: "Eliminar",
            cancelText: "Cancelar",
            onConfirm: () => {
              deleteExpense({ id: expense.documentId || expense.id });
              toast.success("Gasto eliminado");
            },
          });
        }}
      >
        <Trash2Icon className="w-4 h-4" />
      </button>
    </div>
  );

  const columns: ColumnDefinition<Expense>[] = [
    {
      header: "Fecha Movimiento",
      cell: (expense) => expense.fechaMovimiento
        ? format(new Date(expense.fechaMovimiento), "dd/MM/yyyy")
        : "-",
      sortable: true,
      sortKey: "fechaMovimiento",
    },
    {
      header: "Fecha Valor",
      cell: (expense) => expense.fechaValor
        ? format(new Date(expense.fechaValor), "dd/MM/yyyy")
        : "-",
      sortable: true,
      sortKey: "fechaValor",
    },
    {
      header: "Descripción",
      cell: (expense) => expense.descripcion,
      sortable: true,
      sortKey: "descripcion",
    },
    {
      header: "Tag",
      cell: (expense) => (
        <TagsSelector
          appliesTo="operation"
          currentTag={getTagObject(expense)}
          onSelect={async (selectedTag) => {
            try {
              await updateTagMutation.mutateAsync({
                id: expense.documentId || expense.id,
                updatedData: { operation_tag: selectedTag.id },
              });
              toast.success("Tag actualizado");
              refetch();
            } catch {
              toast.error("Error al actualizar tag");
            }
          }}
          placeholder="Seleccionar tag"
        />
      ),
      sortable: true,
      sortKey: "operation_tag",
    },
    {
      header: "Monto",
      cell: (expense) => `${expense.monto.toFixed(2)} ${expense.moneda}`,
      sortable: true,
      sortKey: "monto",
    },
    {
      header: "Duplicado",
      cell: (expense) => (
        <Switch
          checked={!!expense.posibleDuplicado}
          onCheckedChange={async (checked) => {
            try {
              await updateDuplicadoMutation.mutateAsync({
                id: expense.documentId || expense.id,
                updatedData: { posibleDuplicado: checked },
              });
              toast.success("Estado de duplicado actualizado");
              refetch();
            } catch {
              toast.error("Error al actualizar duplicado");
            }
          }}
        />
      ),
    },
    {
      header: "Estado",
      cell: (expense) => (
        <select
          value={expense.estadoConciliacion || "pendiente"}
          onChange={async (e) => {
            try {
              await updateEstadoMutation.mutateAsync({
                id: expense.documentId || expense.id,
                updatedData: { estadoConciliacion: e.target.value },
              });
              toast.success("Estado actualizado");
              refetch();
            } catch {
              toast.error("Error al actualizar estado");
            }
          }}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="pendiente">Pendiente</option>
          <option value="procesado">Procesado</option>
          <option value="conciliado">Conciliado</option>
          <option value="revisar">Revisar</option>
        </select>
      ),
    },
    {
      header: "Justificante",
      cell: (expense) =>
        expense.justificante?.url ? (
          <a
            href={
              expense.justificante.url.startsWith("http")
                ? expense.justificante.url
                : `${process.env.NEXT_PUBLIC_STRAPI_URL}${expense.justificante.url}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {expense.justificante.name}
          </a>
        ) : (
          "-"
        ),
    },
    // {
    //   header: "Acciones",
    //   cell: renderActions,
    // },
  ];

  return (
    <FullStrapiTable
      collection="operations"
      title="Listado de Gastos (Nuevo)"
      columns={columns}
      filters={{ monto: { $lt: 0 } }}
      formElement={({ row, onChange, onSubmit, onCancel }) => (
        <ExpenseForm
          row={row}
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}
    />
  );
};

export default ExpensesNewTab;
