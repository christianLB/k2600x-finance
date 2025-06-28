import React, { useRef, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from "@k2600x/design-system";
import { useConfirm } from "@/hooks/useConfirm";
import { DynamicStrapiForm } from "@/components/dynamic-form/DynamicStrapiForm";
import { strapiPublic } from "@/lib/strapi.public";
import { useToast } from "@/hooks/useToast";

export interface RecordFormDialogProps<T extends { id: number }> {
  open: boolean;
  collection: string;
  record: Partial<T> | null;
  onSuccess: (data: T) => void;
  onClose: () => void;
  title?: string;
}

export function RecordFormDialog<T extends { id: number }>({
  open,
  collection,
  record,
  onSuccess,
  onClose,
  title = record ? "Edit Record" : "Create Record",
}: RecordFormDialogProps<T>) {
  const formRef = useRef<{ submitForm: () => void; isDirty: () => boolean }>(
    null
  );
  const [dirty, setDirty] = useState(false);
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const toast = useToast();

  useEffect(() => {
    setDirty(false);
  }, [record, open]);

  const mutation = useMutation<T, Error, Partial<T>>({
    mutationFn: async (data: Partial<T>) => {
      const strapiCollection = strapiPublic.collection(collection);
      const recordId = record?.id;
      let response;
      if (recordId) {
        response = await strapiCollection.update(String(recordId), data);
      } else {
        response = await strapiCollection.create(data);
      }
      return { id: response.data.id, ...response.data.attributes } as T;
    },
    onSuccess: (savedData: T) => {
      toast.success(`Record ${record?.id ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['strapi', collection] });
      if (onSuccess) {
        onSuccess(savedData);
      }
      onClose();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleFooterSubmit = () => {
    formRef.current?.submitForm();
  };

  const handleClose = () => {
    if (dirty) {
      confirm({
        title: "¿Cerrar sin guardar?",
        description: "Hay cambios sin guardar.",
        onConfirm: onClose,
      });
      return;
    }
    onClose();
  };

  return (
    <Dialog isOpen={open} onClose={handleClose}>
      <div className="dialog-content min-w-[800px] w-[1200px] max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 -mr-2">
          <DynamicStrapiForm
            collection={collection}
            document={record ?? undefined}
            onSuccess={(formData) => mutation.mutate(formData as unknown as Partial<T>)}
            onError={(err) => toast.error(err.message)}
            ref={formRef}
            hideSubmitButton={true}
            onDirtyChange={setDirty}
          />
        </div>
        <DialogFooter className="flex flex-col gap-2">
          {record?.id && (
            <span className="text-sm text-muted-foreground opacity-70">
              ID: {record.id}
            </span>
          )}
          <Button
            onClick={handleFooterSubmit}
            disabled={mutation.isPending || !dirty}
          >
            {mutation.isPending ? "Saving..." : record ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
