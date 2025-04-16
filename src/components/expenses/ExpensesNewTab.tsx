// ExpensesNewTab.tsx
"use client";

import { format } from "date-fns";
import { FullStrapiTable } from "@/components/tables/FullStrapiTable";
import { ColumnDefinition } from "@/components/tables/StrapiTable";

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
  justificante?: {
    id: number;
    documentId: string;
    name: string;
    url: string;
  };
}

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
    header: "Cuenta",
    cell: (expense) => expense.cuenta,
    sortable: true,
    sortKey: "cuenta",
  },
  {
    header: "Titular",
    cell: (expense) => expense.titularCuenta,
    sortable: true,
    sortKey: "titularCuenta",
  },
  {
    header: "Concepto",
    cell: (expense) => expense.concepto,
    sortable: true,
    sortKey: "concepto",
  },
  {
    header: "Monto",
    cell: (expense) => `${expense.monto.toFixed(2)} ${expense.moneda}`,
    sortable: true,
    sortKey: "monto",
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
];

export default function ExpensesNewTab() {
  return (
    <FullStrapiTable<Expense>
      collection="operations"
      title="Listado de Gastos (Nuevo)"
      columns={columns}
      filters={{ monto: { $lt: 0 } }}
    />
  );
}
