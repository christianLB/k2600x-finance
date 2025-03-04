"use client";

import { useState } from "react";
import { useStrapiCollection } from "../../hooks/useStrapiCollection";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { PencilIcon, Trash2Icon } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import InvoiceModal from "./InvoiceModal";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";

interface Invoice {
  documentId: string;
  id: number;
  date: string;
  client: string;
  total: number;
  currency: string;
}

export default function InvoiceTable() {
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const pageSize = 10;

  const { data: invoices, isLoading, refetch, delete: deleteInvoice } = useStrapiCollection("invoices", {
    pagination: { page, pageSize },
  });

  const toast  = useToast();
  const confirm = useConfirm();

  const handleOpenModal = (invoice?: Invoice) => {
    setSelectedInvoice(invoice || null);
    setModalOpen(true);
  };

  const handleDelete = (invoice: Invoice) => {
    confirm({
      title: "Eliminar Invoice",
      description: `¿Seguro querés eliminar el invoice de ${invoice.client}?`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: () => {
        deleteInvoice(invoice.documentId.toString(), {
          onSuccess: () => {
            toast.success( "Invoice eliminado correctamente." );
            refetch();
          },
          onError: () => {
            toast.error("Error al eliminar el invoice.");
          },
        });
      },
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString + "T00:00:00Z");
      return new Intl.DateTimeFormat("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    } catch {
      return "Fecha inválida";
    }
  };

  return (
    <div className="space-y-4 border p-4 rounded-md bg-white">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Listado de Invoices</span>
        <Button size="sm" onClick={() => handleOpenModal()}>
          Crear Invoice
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  <Loader />
                </TableCell>
              </TableRow>
            ) : (
              invoices?.map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell>{formatDate(invoice.fechaInvoice)}</TableCell>
                  <TableCell>{invoice.client?.name || "Sin cliente"}</TableCell>
                  <TableCell>
                    {invoice.total?.toFixed(2)} {invoice.currency}
                  </TableCell>
                  <TableCell className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(invoice)}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(invoice)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <Trash2Icon className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center space-x-2">
        <Button
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Anterior
        </Button>
        <span className="self-center">Página {page}</span>
        <Button size="sm" onClick={() => setPage(page + 1)}>
          Siguiente
        </Button>
      </div>

      <InvoiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
}
