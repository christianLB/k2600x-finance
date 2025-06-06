import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Label } from "@k2600x/design-system";
import { DynamicStrapiForm } from "@/components/dynamic-form/DynamicStrapiForm";

/**
 * Dialog for creating or editing a record in the admin table.
 * @param open Whether the dialog is open
 * @param collection The collection name (key) for the form
 * @param record The record to edit, or null for create
 * @param onSave Async handler for saving the record
 * @param onClose Handler to close the dialog
 * @param loading Optional loading state for save button
 * @param title Optional dialog title
 */
export interface RecordFormDialogProps {
  open: boolean;
  collection: string;
  record: any | null;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  title?: string;
}

export const RecordFormDialog: React.FC<RecordFormDialogProps> = ({
  open,
  collection,
  record,
  onSave,
  onClose,
  loading = false,
  title = "Edit Record",
}) => {
  // Create a ref to store the form submit function
  const formRef = useRef<{ submitForm: () => void }>(null);

  // Function to handle form submission from the footer button
  const handleFooterSubmit = () => {
    if (formRef.current) {
      formRef.current.submitForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-[800px] w-[1200px] max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 -mr-2">
          <DynamicStrapiForm
            collection={collection}
            document={record}
            onSuccess={onSave}
            onError={() => {}}
            ref={formRef}
            hideSubmitButton={true} // Hide the form's own submit button
          />
        </div>
        <DialogFooter className="flex flex-col gap-2">
          {record?.documentId && (
            <Label disabled className="opacity-70 text-sm">
              {record.documentId}
            </Label>
          )}
          <Button onClick={handleFooterSubmit} disabled={loading}>
            {record ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
