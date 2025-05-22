import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button } from "@k2600x/design-system";
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
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ minWidth: 400 }}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DynamicStrapiForm
          collection={collection}
          document={record}
          onSuccess={onSave}
          onError={() => {}}
        />
        <DialogFooter>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
