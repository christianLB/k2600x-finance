// IncomeTable.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Popover, Transition } from "@headlessui/react";
import { format } from "date-fns";
import { FullStrapiTable, ColumnDefinition } from "@/components/tables/FullStrapiTable";

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
      sortable: true,
      sortKey: "fechaMovimiento",
    },
    {
      header: "Fecha Valor",
      cell: (income) => income.fechaValor
        ? format(new Date(income.fechaValor), "dd/MM/yyyy")
        : "-",
      sortable: true,
      sortKey: "fechaValor",
    },
    {
      header: "Descripción",
      cell: (income) => income.descripcion,
      sortable: true,
      sortKey: "descripcion",
    },
    {
      header: "Cuenta",
      cell: (income) => income.cuenta,
      sortable: true,
      sortKey: "cuenta",
    },
    {
      header: "Titular",
      cell: (income) => income.titularCuenta,
      sortable: true,
      sortKey: "titularCuenta",
    },
    {
      header: "Concepto",
      cell: (income) => income.concepto,
      sortable: true,
      sortKey: "concepto",
    },
    {
      header: "Monto",
      cell: (income) => `${income.monto.toFixed(2)} ${income.moneda}`,
      sortable: true,
      sortKey: "monto",
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
      <FullStrapiTable<Income>
        collection="operations"
        title="Listado de Ingresos"
        columns={columns}
        filters={{ monto: { $gt: 0 } }}
        allowCreate={false}
      />
  );
}
