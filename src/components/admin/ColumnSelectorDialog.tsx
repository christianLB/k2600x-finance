import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@k2600x/design-system";

/**
 * Dialog for selecting visible columns in the admin table.
 * @param open Whether the dialog is open
 * @param columns All available columns
 * @param selected Currently selected columns
 * @param onChange Called with new selection
 * @param onClose Called to close dialog
 * @param loading (optional) Loading state for save button
 */
export interface ColumnSelectorDialogProps {
  open: boolean;
  columns: string[];
  selected: string[];
  onChange: (cols: string[]) => void;
  onClose: () => void;
  loading?: boolean;
}

export const ColumnSelectorDialog: React.FC<ColumnSelectorDialogProps> = ({
  open,
  columns,
  selected,
  onChange,
  onClose,
  loading = false,
}) => {
  const [localSelected, setLocalSelected] = useState<string[]>(selected);

  useEffect(() => {
    setLocalSelected(selected);
  }, [selected, open]);

  function handleToggle(col: string) {
    setLocalSelected((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  }

  function handleSave() {
    onChange(localSelected);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ minWidth: 320 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Select Columns to Display</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {columns.map((attr) => (
            <label key={attr} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={localSelected.includes(attr)}
                onChange={() => handleToggle(attr)}
              />
              {attr}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} loading={loading}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
