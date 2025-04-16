"use client";

import FullStrapiTable, { ColumnDefinition } from "@/components/tables/FullStrapiTable";
import InvoiceModal from "./InvoiceModal";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useStrapiUpdateMutation } from "@/hooks/useStrapiUpdateMutation";
import { FileIcon } from "lucide-react";

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
  archivos?: any[];
}

export default function InvoiceTable() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const updateInvoice = useStrapiUpdateMutation<Invoice>("invoices");

  const handleOpenModal = (invoice?: Invoice) => {
    setSelectedInvoice(invoice || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedInvoice(null);
  };

  // Definición de columnas.
  const columns: ColumnDefinition<Invoice>[] = [
    {
      header: "Fecha",
      cell: (inv: Invoice) => new Date(inv.fechaInvoice).toLocaleDateString("es-AR"),
      sortable: true,
      sortKey: "fechaInvoice",
    },
    {
      header: "Cliente",
      cell: (inv: Invoice) => inv.client?.name || "Sin cliente",
      sortable: true,
      sortKey: "client.name",
    },
    {
      header: "Archivos",
      cell: (inv: Invoice) =>
        Array.isArray(inv.archivos) && inv.archivos.length > 0 ? (
          <div className="flex gap-2">
            {inv.archivos.map((file: any) => (
              <a
                key={file.id}
                href={file.url.startsWith("http") ? file.url : `${process.env.NEXT_PUBLIC_STRAPI_URL}${file.url}`}
                target="_blank"
                rel="noopener noreferrer"
                title={file.name}
              >
                <FileIcon className="w-5 h-5 text-blue-500 hover:text-blue-700" />
              </a>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">Sin archivos</span>
        ),
    },
    {
      header: "Total",
      cell: (inv: Invoice) => {
        const total =
          inv.total ??
          (inv.precioUnitario && inv.cantidad ? inv.precioUnitario * inv.cantidad : 0);
        return `$${total.toFixed(2)}`;
      },
      sortable: true,
      sortKey: "total",
    },
    {
      header: "Declarado",
      cell: (inv: Invoice) => (
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
      <FullStrapiTable<Invoice>
        collection="invoices"
        title="Listado de Invoices"
        columns={columns}
        onEdit={handleOpenModal}
        onCreate={() => handleOpenModal(undefined)}
        createButtonText="Crear Invoice"
        allowCreate={true}
        selectable
      />
      <InvoiceModal
        open={modalOpen}
        onClose={handleCloseModal}
        invoice={selectedInvoice ?? undefined}
      />
    </div>
  );
}