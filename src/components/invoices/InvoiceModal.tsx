"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { useInvoiceForm as useInvoiceForm_v2 } from "@/hooks/invoices/useInvoiceForm";
import { useRef } from "react";
import { FileIcon } from "lucide-react";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";

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
  const { control, handleSubmit, isEditMode, handleGenerateDocument, invoiceData } = useInvoiceForm_v2({
    invoice,
    onInvoiceUpdated,
    open,
  });

  // Fetch all clients for dropdown
  const { data: clientsData, isLoading: clientsLoading } = useStrapiCollection("clients");
  const clients = Array.isArray(clientsData)
    ? clientsData
    : clientsData?.data || [];

  const modalTitle = isEditMode ? "Actualizar Invoice" : "Crear Invoice";
  const saveButtonText = isEditMode ? "Actualizar" : "Crear";

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler for file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implement logic to upload files and update form state
    // This will be completed after reviewing the rest of the form logic
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
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
              <Select value={field.value} onValueChange={field.onChange} disabled={clientsLoading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client: any) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
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
          {/* Archivos: file upload and preview */}
          <div>
            <label className="block mb-1 font-medium">Archivos</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="block w-full border rounded p-1 mb-2"
              onChange={handleFileChange}
            />
            {invoiceData?.archivos?.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-1">
                {invoiceData.archivos.map((file: any) => (
                  <a
                    key={file.id}
                    href={file.url.startsWith("http") ? file.url : `${process.env.NEXT_PUBLIC_STRAPI_URL}${file.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={file.name}
                    className="inline-block"
                  >
                    <FileIcon className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                  </a>
                ))}
              </div>
            )}
          </div>
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
            <Button type="submit">{saveButtonText}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}