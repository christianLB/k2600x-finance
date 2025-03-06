"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";
import { useStrapiDocument } from "@/hooks/useStrapiDocument";
import { toast } from "sonner";

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  invoice?: any;
  onInvoiceUpdated?: (invoice: any) => void;
}

interface InvoiceFormValues {
  invoiceNumber: string;
  precioUnitario: string;
  cantidad: string;
  concepto: string;
  fechaInvoice: Date | null;
  yearFacturado: string;
  monthFacturado: string;
  selectedClient: string;
}

const defaultValues: InvoiceFormValues = {
  invoiceNumber: "",
  precioUnitario: "",
  cantidad: "",
  concepto: "",
  fechaInvoice: null,
  yearFacturado: "",
  monthFacturado: "",
  selectedClient: "",
};

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
  // Determinamos el modo edición usando documentId
  const isEditMode = Boolean(invoice?.documentId);

  // Siempre llamamos a useStrapiDocument, pasando invoice.documentId
  const invoiceDocument = useStrapiDocument<any>(
    "invoices",
    invoice?.documentId ?? "",
    { populate: "*", enabled: Boolean(invoice?.documentId) }
  );

  // Para creación, usamos useStrapiCollection
  const { create } = useStrapiCollection<any>("invoices", { enabled: false });

  const { control, handleSubmit, reset, watch } = useForm<InvoiceFormValues>({ defaultValues });

  // Usamos la data del hook en modo edición o el prop invoice en creación
  const invoiceData = isEditMode ? invoiceDocument.data : invoice;

  // Actualizamos el formulario cuando cambia la data
  useEffect(() => {
    if (invoiceData) {
      reset({
        invoiceNumber: invoiceData.invoiceNumber ? String(invoiceData.invoiceNumber) : "",
        precioUnitario: invoiceData.precioUnitario ? String(invoiceData.precioUnitario) : "",
        cantidad: invoiceData.cantidad ? String(invoiceData.cantidad) : "",
        concepto: invoiceData.concepto || "",
        fechaInvoice: invoiceData.fechaInvoice ? new Date(invoiceData.fechaInvoice) : null,
        yearFacturado: invoiceData.yearFacturado ? String(invoiceData.yearFacturado) : "",
        monthFacturado: invoiceData.monthFacturado || "",
        selectedClient: invoiceData.client?.id?.toString() || "",
      });
    } else {
      reset(defaultValues);
    }
  }, [invoiceData, reset]);

  // Si se abre en modo creación, asignamos mes y año actuales
  useEffect(() => {
    if (open && !isEditMode) {
      const today = new Date();
      reset({
        ...watch(),
        monthFacturado: String(today.getMonth() + 1).padStart(2, "0"),
        yearFacturado: String(today.getFullYear()),
      });
    }
  }, [open, isEditMode, reset, watch]);

  const { data: clients, isLoading: loadingClients } = useStrapiCollection<any>("clients");

  const onSubmit = (data: InvoiceFormValues) => {
    const payload = {
      invoiceNumber: parseInt(data.invoiceNumber, 10),
      precioUnitario: parseFloat(data.precioUnitario),
      cantidad: parseInt(data.cantidad, 10),
      concepto: data.concepto,
      fechaInvoice: data.fechaInvoice ? data.fechaInvoice.toISOString().split("T")[0] : null,
      yearFacturado: parseInt(data.yearFacturado, 10),
      monthFacturado: data.monthFacturado,
      client: data.selectedClient ? parseInt(data.selectedClient, 10) : null,
    };

    if (isEditMode) {
      // Actualización con useStrapiDocument
      invoiceDocument.update(
        { ...payload },
        {
          onSuccess: (updated) => {
            toast.success("Invoice actualizado correctamente");
            invoiceDocument.refetch(); // Refresca para actualizar el link, etc.
            if (onInvoiceUpdated) onInvoiceUpdated(updated);
            onClose();
          },
          onError: (err: any) => toast.error(`Error al actualizar: ${err.message}`),
        }
      );
    } else {
      // Creación con useStrapiCollection
      create(payload, {
        onSuccess: (created) => {
          toast.success("Invoice creado correctamente");
          if (onInvoiceUpdated) onInvoiceUpdated(created);
          onClose();
        },
        onError: (err: any) => toast.error(`Error al crear: ${err.message}`),
      });
    }
  };

  const handleGenerateDocument = async () => {
    if (!isEditMode || !invoiceData?.documentId) return;
    const values = watch();
    const clientData = clients?.find((client: any) => client.id.toString() === values.selectedClient);
    if (!clientData) {
      toast.error("No se ha seleccionado un cliente válido");
      return;
    }
    try {
      const res = await fetch(`/api/create-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: invoiceData.documentId,
          invoiceNumber: values.invoiceNumber,
          precioUnitario: values.precioUnitario,
          cantidad: values.cantidad,
          fechaInvoice: values.fechaInvoice ? values.fechaInvoice.toISOString().split("T")[0] : null,
          yearFacturado: parseInt(values.yearFacturado, 10),
          monthFacturado: values.monthFacturado,
          billToName: clientData.name,
          billToAddress: clientData.address,
          billToCity: clientData.city,
          billToState: clientData.state,
          billToZip: clientData.zip,
          taxId: clientData.taxId,
          tax: clientData.taxRate || "0.00",
        }),
      });
      if (!res.ok) throw new Error("Error al generar el documento");
      const updatedInvoice = await res.json();
      toast.success("Documento generado correctamente");
      invoiceDocument.refetch();
      if (onInvoiceUpdated) onInvoiceUpdated(updatedInvoice);
    } catch (error: any) {
      toast.error("Error generando el documento");
      console.error(error);
    }
  };

  const renderDocumentLink = () => {
    if (invoiceData?.archivos?.length) {
      const file = invoiceData.archivos[0];
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

  const canGenerateDocument = isEditMode && invoiceData && (!invoiceData.archivos || invoiceData.archivos.length === 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Invoice" : "Crear Invoice"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha del Invoice</label>
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <Controller
              name="selectedClient"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={loadingClients}>
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
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mes Facturado</label>
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
          </div>
          <Controller
            name="yearFacturado"
            control={control}
            render={({ field }) => <Input placeholder="Año Facturado" type="number" {...field} />}
          />
          {renderDocumentLink()}
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {canGenerateDocument && (
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
