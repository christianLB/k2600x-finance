"use client";

import { useState } from "react";
import { useStrapiCollection } from "../../hooks/useStrapiCollection";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader"; // Si ya tenés un Loader, ajustalo
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface Invoice {
  id: number;
  invoiceNumber: string;
  precioUnitario: number;
  cantidad: number;
  concepto: string;
  fechaInvoice: string;
  yearFacturado: number;
  archivos: any[];
  total: number;
  documentId: string;
  date: string;
  client: any;
  currency: string;
}

export default function InvoiceTable() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: invoices, isLoading } = useStrapiCollection("invoices", {
    pagination: { page, pageSize },
  });

  return (
    <div className="space-y-4 border p-4 rounded-md bg-white">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Invoice List</span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  <Loader />
                </TableCell>
              </TableRow>
            ) : (
              invoices?.map((invoice: any) => (
                <TableRow key={invoice.documentId}>
                  <TableCell>
                    {new Date(invoice.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>
                    {invoice.total} {invoice.currency}
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
          Previous
        </Button>
        <span className="self-center">Page {page}</span>
        <Button size="sm" onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
