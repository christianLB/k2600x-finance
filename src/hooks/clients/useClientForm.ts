// useInvoiceForm.ts
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useStrapiDocument } from "@/hooks/useStrapiDocument";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";
import { toast } from "sonner";
import { Client } from "@/components/clients/ClientTable";

export interface ClientFormValues {
  name: string;
}

const defaultValues: ClientFormValues = {
  name: "",
};

interface UseClientFormparams {
  client?: Client;
  open: boolean;
}

export function useClientForm({ client }: UseClientFormparams) {
  // Modo edición se determina por la existencia de documentId
  const isEditMode = Boolean(client?.documentId);

  // Configuramos React Hook Form con defaultValues
  const { control, handleSubmit, reset } = useForm<ClientFormValues>({ defaultValues });

  // Para edición, usamos useStrapiDocument (envía la llamada a /api/strapi con method GET)
  const clientDocument = useStrapiDocument<any>(
    "clients",
    client?.documentId ?? "",
    { populate: "*", enabled: Boolean(client?.documentId) }
  );

  // Para creación, usamos useStrapiCollection con enabled:false para disparar la mutación manualmente
  const { create } = useStrapiCollection<any>("clients", { enabled: false });

  // La data a utilizar: si estamos en edición, la proveniente del hook; si no, la pasada en props
  const clientData = isEditMode ? clientDocument.data : client;

  // Sincronizamos los valores del formulario cuando cambia la data
  useEffect(() => {
    if (clientData) {
      reset({
        name: clientData.name ? String(clientData.name) : "",
      });
    } else {
      reset(defaultValues);
    }
  }, [clientData, reset]);

  // Función de envío del formulario
  const onSubmit = (data: ClientFormValues) => {
    const payload = {
      name: data.name,
    };

    if (isEditMode) {
      clientDocument.update(
        { updatedData: payload },
        {
          onSuccess: () => {
            toast.success("Invoice actualizado correctamente");
            clientDocument.refetch();
          },
          onError: (err: any) => toast.error(`Error al actualizar: ${err.message}`),
        }
      );
    } else {
      create(payload, {
        onSuccess: () => {
          toast.success("Invoice creado correctamente");
        },
        onError: (err: any) => toast.error(`Error al crear: ${err.message}`),
      });
    }
  };

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    isEditMode,
    clientData,
  };
}
