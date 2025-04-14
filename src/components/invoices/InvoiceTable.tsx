"use client";

import { StrapiTable, ColumnDefinition } from "@/components/tables/StrapiTable";
import InvoiceModal from "./InvoiceModal";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useStrapiUpdateMutation } from "@/hooks/useStrapiUpdateMutation";

interface Invoice {
  documentId: string;
  id: number;
  fechaInvoice: string;
  client: { name: string };
  precioUnitario: number;
  cantidad: number;
  total?: number | null;
  currency?: string;
  declared?: boolean;
}

export default function InvoiceTable() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const updateInvoice = useStrapiUpdateMutation<Invoice>("invoices");

  const handleOpenModal = (invoice?: Invoice) => {
    setSelectedInvoice(invoice || null);
    setModalOpen(true);
  };

  // Definición de columnas.
  const columns: ColumnDefinition<Invoice>[] = [
    {
      header: "Fecha",
      cell: (inv) => new Date(inv.fechaInvoice).toLocaleDateString("es-AR"),
    },
    {
      header: "Cliente",
      cell: (inv) => inv.client?.name || "Sin cliente",
    },
    {
      header: "Total",
      cell: (inv) => {
        const total =
          inv.total ??
          (inv.precioUnitario && inv.cantidad ? inv.precioUnitario * inv.cantidad : 0);
        return `$${total.toFixed(2)}`;
      },
    },
    {
      header: "Declarado",
      cell: (inv) => (
        <Switch
          checked={!!inv.declared}
          onCheckedChange={async (checked) => {
            await updateInvoice.mutateAsync({ id: inv.documentId, updatedData: { declared: checked } });
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <StrapiTable<Invoice>
        collection="invoices"
        title="Listado de Invoices"
        columns={columns}
        onEdit={() => handleOpenModal()}
        createButtonText="Crear Invoice"
        selectable
      />
      <InvoiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
}