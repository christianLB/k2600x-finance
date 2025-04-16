// ExpensesNewTab.tsx
"use client";

import { format } from "date-fns";
import { FullStrapiTable } from "@/components/tables/FullStrapiTable";
import { ColumnDefinition } from "@/components/tables/StrapiTable";
import { TagsSelector } from "@/components/operation-tags/TagsSelector";
import ExpenseForm from "./ExpenseForm";
import { useStrapiUpdateMutation } from "@/hooks/useStrapiUpdateMutation";
import { toast } from "sonner";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";
import { Switch } from "@/components/ui/switch";
import { Tag } from "@/types/tag";
import { FileIcon } from "lucide-react";

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
  operation_tag?: number | Tag | null;
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
  const { data: { data: allTags = [] } = { data: [] }, refetch } = useStrapiCollection<Tag>("operation-tags", {
    filters: { appliesTo: { $contains: "operation" } },
    pagination: { page: 1, pageSize: 500 },
    populate: ["parent_tag"],
  });

  // --- Mutations ---
  const updateTagMutation = useStrapiUpdateMutation<Expense>("operations");
  const updateDuplicadoMutation = useStrapiUpdateMutation<Expense>("operations");
  const updateEstadoMutation = useStrapiUpdateMutation<Expense>("operations");

  // Helper to always return the tag object for a given expense
  const getTagObject = (expense: Expense): Tag | undefined => {
    const tagValue = expense.operation_tag;
    if (typeof tagValue === "object" && tagValue !== null) return tagValue as Tag;
    if (!tagValue) return undefined;
    return allTags.find((t: Tag) => t.id === tagValue) || undefined;
  };

  const columns: ColumnDefinition<Expense>[] = [
    {
      header: "Fecha Movimiento",
      cell: (expense: Expense) => expense.fechaMovimiento
        ? format(new Date(expense.fechaMovimiento), "dd/MM/yyyy")
        : "-",
      sortable: true,
      sortKey: "fechaMovimiento",
    },
    {
      header: "Fecha Valor",
      cell: (expense: Expense) => expense.fechaValor
        ? format(new Date(expense.fechaValor), "dd/MM/yyyy")
        : "-",
      sortable: true,
      sortKey: "fechaValor",
    },
    {
      header: "Monto",
      cell: (expense: Expense) => `${expense.monto.toFixed(2)} ${expense.moneda}`,
      sortable: true,
      sortKey: "monto",
    },
    {
      header: "Descripción",
      cell: (expense: Expense) => expense.descripcion,
      sortable: true,
      sortKey: "descripcion",
    },
    {
      header: "Tag",
      cell: (expense: Expense) => (
        <TagsSelector
          appliesTo="operation"
          currentTag={getTagObject(expense) as Tag}
          onSelect={(selectedTag: Tag) => {
            updateTagMutation.mutate({
              id: (expense.documentId || expense.id).toString(),
              updatedData: { operation_tag: selectedTag.id },
            });
            toast.success("Tag actualizado");
            refetch();
          }}
          placeholder="Seleccionar tag"
        />
      ),
      sortable: true,
      sortKey: "operation_tag",
    },
    {
      header: "Duplicado",
      cell: (expense: Expense) => (
        <Switch
          checked={!!expense.posibleDuplicado}
          onCheckedChange={(checked: boolean) => {
            updateDuplicadoMutation.mutate({
              id: (expense.documentId || expense.id).toString(),
              updatedData: { posibleDuplicado: checked },
            });
            toast.success("Estado de duplicado actualizado");
            refetch();
          }}
        />
      ),
    },
    {
      header: "Estado",
      cell: (expense: Expense) => (
        <select
          value={expense.estadoConciliacion || "pendiente"}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            updateEstadoMutation.mutate({
              id: (expense.documentId || expense.id).toString(),
              updatedData: { estadoConciliacion: e.target.value },
            });
            toast.success("Estado actualizado");
            refetch();
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
      cell: (expense: Expense) =>
        expense.justificante && expense.justificante.url ? (
          <a
            href={
              expense.justificante.url.startsWith("http")
                ? expense.justificante.url
                : `${process.env.NEXT_PUBLIC_STRAPI_URL}${expense.justificante.url}`
            }
            target="_blank"
            rel="noopener noreferrer"
            title={expense.justificante.name}
          >
            <FileIcon className="w-5 h-5 text-blue-500 hover:text-blue-700" />
          </a>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
  ];

  return (
    <FullStrapiTable<Expense>
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
