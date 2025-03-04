"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";
import { toast } from "sonner";

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  invoice?: any;
}

const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function InvoiceModal({ open, onClose, invoice }: InvoiceModalProps) {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [concepto, setConcepto] = useState("");
  const [fechaInvoice, setFechaInvoice] = useState<Date | null>(null);
  const [yearFacturado, setYearFacturado] = useState("");
  const [monthFacturado, setMonthFacturado] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("");

  const { data: clients, isLoading: loadingClients } = useStrapiCollection<any>("clients");
  const { create, update } = useStrapiCollection<any>("invoices", { enabled: false });

  useEffect(() => {
    if (invoice) {
      setInvoiceNumber(String(invoice.invoiceNumber));
      setPrecioUnitario(String(invoice.precioUnitario));
      setCantidad(String(invoice.cantidad));
      setConcepto(invoice.concepto);
      setFechaInvoice(invoice.fechaInvoice ? new Date(invoice.fechaInvoice) : null);
      setYearFacturado(String(invoice.yearFacturado));
      setMonthFacturado(invoice.monthFacturado || "");
      setSelectedClient(invoice.client?.id?.toString() || "");
    } else {
      setInvoiceNumber("");
      setPrecioUnitario("");
      setCantidad("");
      setConcepto("");
      setFechaInvoice(null);
      setYearFacturado("");
      setMonthFacturado("");
      setSelectedClient("");
    }
  }, [invoice]);

  useEffect(() => {
  if (open && !invoice) {
    const today = new Date();
    const currentMonth = String(today.getMonth() + 1).padStart(2, "0"); // Enero es 0
    const currentYear = String(today.getFullYear());

    setMonthFacturado(currentMonth);
    setYearFacturado(currentYear);
  }
}, [open, invoice]);


  const handleSave = () => {
    const payload = {
      invoiceNumber: parseInt(invoiceNumber),
      precioUnitario: parseFloat(precioUnitario),
      cantidad: parseInt(cantidad),
      concepto,
      fechaInvoice: fechaInvoice?.toISOString().split("T")[0] || null,
      yearFacturado: parseInt(yearFacturado),
      monthFacturado: monthFacturado,
      client: selectedClient ? parseInt(selectedClient) : null, // Relación con client
    };

    const action = invoice?.id
      ? update(
          { documentId: String(invoice.documentId), updatedData: payload },
          {
            onSuccess: () => {
              toast.success("Invoice actualizado correctamente");
              onClose();
            },
            onError: (err) => toast.error(`Error al actualizar: ${err.message}`),
          }
        )
      : create(payload, {
          onSuccess: () => {
            toast.success("Invoice creado correctamente");
            onClose();
          },
          onError: (err) => toast.error(`Error al crear: ${err.message}`),
        });

    return action;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{invoice ? "Editar Invoice" : "Crear Invoice"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Número de Factura"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
          <Input
            placeholder="Precio Unitario"
            type="number"
            value={precioUnitario}
            onChange={(e) => setPrecioUnitario(e.target.value)}
          />
          <Input
            placeholder="Cantidad"
            type="number"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
          <Input
            placeholder="Concepto"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha del Invoice</label>
            <DatePicker
              selected={fechaInvoice}
              onChange={setFechaInvoice}
              dateFormat="yyyy-MM-dd"
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* Select Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <Select
              value={selectedClient}
              onValueChange={setSelectedClient}
              disabled={loadingClients}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client: any) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nuevo campo mesFacturado */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mes Facturado</label>
            <Select value={monthFacturado} onValueChange={setMonthFacturado}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un mes" />
              </SelectTrigger>
              <SelectContent>
                {months.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            placeholder="Año Facturado"
            type="number"
            value={yearFacturado}
            onChange={(e) => setYearFacturado(e.target.value)}
          />
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {invoice ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
