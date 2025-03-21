"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { useInvoiceForm } from "@/hooks/invoices/useInvoiceForm";

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  invoice?: any;
  onInvoiceUpdated?: (invoice: any) => void;
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
  // Llamamos al hook que encapsula la lógica del formulario
  const { control, handleSubmit, isEditMode, handleGenerateDocument, invoiceData } = useInvoiceForm({
    invoice,
    onInvoiceUpdated,
    open,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Invoice" : "Crear Invoice"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Controller
            name="invoiceNumber"
            control={control}
            render={({ field }) => <Input placeholder="Número de Factura" {...field} />}
          />
          <Controller
            name="precioUnitario"
            control={control}
            render={({ field }) => <Input placeholder="Precio Unitario" type="number" {...field} />}
          />
          <Controller
            name="cantidad"
            control={control}
            render={({ field }) => <Input placeholder="Cantidad" type="number" {...field} />}
          />
          <Controller
            name="concepto"
            control={control}
            render={({ field }) => <Input placeholder="Concepto" {...field} />}
          />
          <Controller
            name="fechaInvoice"
            control={control}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={field.onChange}
                dateFormat="yyyy-MM-dd"
                className="w-full border rounded-md p-2"
              />
            )}
          />
          <Controller
            name="selectedClient"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {/* Aquí deberías mapear la lista de clientes. Por ejemplo:
                      clients.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>
                      ))
                  */}
                </SelectContent>
              </Select>
            )}
          />
          <Controller
            name="monthFacturado"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
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
            )}
          />
          <Controller
            name="yearFacturado"
            control={control}
            render={({ field }) => <Input placeholder="Año Facturado" type="number" {...field} />}
          />
          {invoiceData?.archivos?.length > 0 && (
            <div className="mt-2">
              <a
                href={
                  invoiceData.archivos[0].url.startsWith("http")
                    ? invoiceData.archivos[0].url
                    : `${process.env.NEXT_PUBLIC_STRAPI_URL}${invoiceData.archivos[0].url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Ver Documento Generado
              </a>
            </div>
          )}
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {isEditMode && (
              <Button type="button" onClick={handleGenerateDocument}>
                Generar Documento
              </Button>
            )}
            <Button type="submit">{isEditMode ? "Actualizar" : "Crear"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
