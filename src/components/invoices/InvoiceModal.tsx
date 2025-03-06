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
  onInvoiceUpdated?: (invoice: any) => void; // callback para actualizar el invoice en el padre
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

export default function InvoiceModal({ open, onClose, invoice, onInvoiceUpdated }: InvoiceModalProps) {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [concepto, setConcepto] = useState("");
  const [fechaInvoice, setFechaInvoice] = useState<Date | null>(null);
  const [yearFacturado, setYearFacturado] = useState("");
  const [monthFacturado, setMonthFacturado] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  // Estado local para mantener el invoice y refrescar el modal cuando se actualice
  const [localInvoice, setLocalInvoice] = useState(invoice);

  const { data: clients, isLoading: loadingClients } = useStrapiCollection<any>("clients");
  const { create, update } = useStrapiCollection<any>("invoices", { enabled: false });

  useEffect(() => {
    setLocalInvoice(invoice);
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
      const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
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
      monthFacturado,
      client: selectedClient ? parseInt(selectedClient) : null,
    };

    const action = localInvoice?.id
      ? update(
          { documentId: String(localInvoice.documentId), updatedData: payload },
          {
            onSuccess: (updated) => {
              toast.success("Invoice actualizado correctamente");
              setLocalInvoice(updated);
              onClose();
            },
            onError: (err) => toast.error(`Error al actualizar: ${err.message}`),
          }
        )
      : create(payload, {
          onSuccess: (created) => {
            toast.success("Invoice creado correctamente");
            setLocalInvoice(created);
            onClose();
          },
          onError: (err) => toast.error(`Error al crear: ${err.message}`),
        });

    return action;
  };

  const handleGenerateDocument = async () => {
    if (!localInvoice?.documentId) return;

    // Buscar datos completos del cliente seleccionado
    const clientData = clients?.find((client: any) => client.id.toString() === selectedClient);
    if (!clientData) {
      toast.error("No se ha seleccionado un cliente válido");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch(`/api/create-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: localInvoice.documentId,
          invoiceNumber,
          precioUnitario,
          cantidad,
          fechaInvoice: fechaInvoice?.toISOString().split("T")[0] || null,
          yearFacturado: parseInt(yearFacturado),
          monthFacturado,
          billToName: clientData.name,
          billToAddress: clientData.address,
          billToCity: clientData.city,
          billToState: clientData.state,
          billToZip: clientData.zip,
          taxId: clientData.taxId,
          tax: clientData.taxRate || "0.00"
        }),
      });

      if (!res.ok) throw new Error("Error al generar el documento");

      // Se asume que el endpoint retorna el invoice actualizado
      const updatedInvoice = await res.json();
      toast.success("Documento generado correctamente");

      // Actualizar el estado local para que se refresque el modal
      setLocalInvoice(updatedInvoice);

      // Si se pasa un callback, también se notifica al padre
      if (onInvoiceUpdated) {
        onInvoiceUpdated(updatedInvoice);
      }
    } catch (error: any) {
      toast.error("Error generando el documento");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderDocumentLink = () => {
    if (localInvoice && localInvoice.archivos && localInvoice.archivos.length > 0) {
      const file = localInvoice.archivos[0];
      const documentUrl = file.url.startsWith("http")
        ? file.url
        : `${process.env.NEXT_PUBLIC_STRAPI_URL}${file.url}`;
      return (
        <div className="mt-2">
          <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            Ver Documento Generado
          </a>
        </div>
      );
    }
    return null;
  };

  const canGenerateDocument = localInvoice && (!localInvoice.archivos || localInvoice.archivos.length === 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{localInvoice ? "Editar Invoice" : "Crear Invoice"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input placeholder="Número de Factura" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          <Input placeholder="Precio Unitario" type="number" value={precioUnitario} onChange={(e) => setPrecioUnitario(e.target.value)} />
          <Input placeholder="Cantidad" type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
          <Input placeholder="Concepto" value={concepto} onChange={(e) => setConcepto(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha del Invoice</label>
            <DatePicker selected={fechaInvoice} onChange={setFechaInvoice} dateFormat="yyyy-MM-dd" className="w-full border rounded-md p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <Select value={selectedClient} onValueChange={setSelectedClient} disabled={loadingClients}>
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

          <Input placeholder="Año Facturado" type="number" value={yearFacturado} onChange={(e) => setYearFacturado(e.target.value)} />
        </div>

        {renderDocumentLink()}

        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          {canGenerateDocument && (
            <Button onClick={handleGenerateDocument} disabled={isGenerating}>
              {isGenerating ? "Generando..." : "Generar Documento"}
            </Button>
          )}
          <Button onClick={handleSave}>{localInvoice ? "Actualizar" : "Crear"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
