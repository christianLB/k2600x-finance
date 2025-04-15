// IncomeTable.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Popover, Transition } from "@headlessui/react";
import { format } from "date-fns";
import { StrapiTable, ColumnDefinition } from "@/components/tables/StrapiTable";

interface Income {
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
  observaciones: string;
  origen: string;
  posibleDuplicado: any;
  estadoConciliacion: string;
  procesadoPorAutomatizacion: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  cuentaDestino: string;
  referenciaBancaria: any;
  comision: any;
  invoices: any[];
  justificante?: {
    id: number;
    documentId: string;
    name: string;
    url: string;
  };
  operation_tag: any;
}

export default function IncomeTable() {
  const [editingDate, setEditingDate] = useState<{ id: string; date: Date | null } | null>(null);
  
  const columns: ColumnDefinition<Income>[] = [
    {
      header: "Fecha Movimiento",
      cell: (income) => income.fechaMovimiento
        ? format(new Date(income.fechaMovimiento), "dd/MM/yyyy")
        : "-",
    },
    {
      header: "Fecha Valor",
      cell: (income) => income.fechaValor
        ? format(new Date(income.fechaValor), "dd/MM/yyyy")
        : "-",
    },
    {
      header: "Descripción",
      cell: (income) => income.descripcion,
    },
    {
      header: "Cuenta",
      cell: (income) => income.cuenta,
    },
    {
      header: "Titular",
      cell: (income) => income.titularCuenta,
    },
    {
      header: "Concepto",
      cell: (income) => income.concepto,
    },
    {
      header: "Monto",
      cell: (income) => `${income.monto.toFixed(2)} ${income.moneda}`,
    },
    {
      header: "Justificante",
      cell: (income) =>
        income.justificante?.url ? (
          <a
            href={
              income.justificante.url.startsWith("http")
                ? income.justificante.url
                : `${process.env.NEXT_PUBLIC_STRAPI_URL}${income.justificante.url}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {income.justificante.name}
          </a>
        ) : (
          "-"
        ),
    },
  ];

  return (
      <StrapiTable<Income>
        collection="operations"
        title="Listado de Ingresos"
        columns={columns}
        queryOptions={{ filters: { monto: { $gt: 0 } } }}
      />
  );
}
