// useInvoiceForm.ts
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useStrapiDocument } from "@/hooks/useStrapiDocument";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";
import { toast } from "sonner";

export interface InvoiceFormValues {
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

interface UseInvoiceFormParams {
  invoice?: any;
  onInvoiceUpdated?: (invoice: any) => void;
  open: boolean;
}

export function useInvoiceForm({ invoice, onInvoiceUpdated, open }: UseInvoiceFormParams) {
  // Modo edición se determina por la existencia de documentId
  const isEditMode = Boolean(invoice?.documentId);

  // Configuramos React Hook Form con defaultValues
  const { control, handleSubmit, reset, watch } = useForm<InvoiceFormValues>({ defaultValues });

  // Para edición, usamos useStrapiDocument (envía la llamada a /api/strapi con method GET)
  const invoiceDocument = useStrapiDocument<any>(
    "invoices",
    invoice?.documentId ?? "",
    { populate: "*", enabled: Boolean(invoice?.documentId) }
  );

  // Para creación, usamos useStrapiCollection con enabled:false para disparar la mutación manualmente
  const { create } = useStrapiCollection<any>("invoices", { enabled: false });

  // La data a utilizar: si estamos en edición, la proveniente del hook; si no, la pasada en props
  const invoiceData = isEditMode ? invoiceDocument.data : invoice;

  // Sincronizamos los valores del formulario cuando cambia la data
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

  // Si se abre el modal en modo creación, asignamos mes y año actuales (por ejemplo, para prellenar esos campos)
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

  // Función de envío del formulario
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
      invoiceDocument.update(
        { updatedData: payload },
        {
          onSuccess: (updated) => {
            toast.success("Invoice actualizado correctamente");
            invoiceDocument.refetch();
            if (onInvoiceUpdated) onInvoiceUpdated(updated);
          },
          onError: (err: any) => toast.error(`Error al actualizar: ${err.message}`),
        }
      );
    } else {
      create(payload, {
        onSuccess: (created) => {
          toast.success("Invoice creado correctamente");
          if (onInvoiceUpdated) onInvoiceUpdated(created);
        },
        onError: (err: any) => toast.error(`Error al crear: ${err.message}`),
      });
    }
  };

  // Función para generar el documento (solo en modo edición)
  const handleGenerateDocument = async () => {
    if (!isEditMode || !invoiceData?.documentId) return;
    const values = watch();
    // Aquí podrías agregar validación del cliente, etc.
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
          // Se pueden incluir otros datos, como información del cliente.
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

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    isEditMode,
    handleGenerateDocument,
    invoiceData,
  };
}
