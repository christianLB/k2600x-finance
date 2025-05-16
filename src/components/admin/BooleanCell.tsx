import React from "react";
import { Switch } from "@k2600x/design-system";

interface BooleanCellProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  row?: any;
  name?: string;
}

export const BooleanCell: React.FC<BooleanCellProps> = ({ value, onChange, disabled, row, name }) => {
  // Permite lógica adicional como en TagsCell, RelationCell, etc.
  const handleChange = (checked: boolean) => {
    if (onChange) onChange(checked);
    // Si se pasa row y name, permite lógica tipo updateRow(row, name, checked)
    if (row && name && typeof row.onBooleanChange === 'function') {
      row.onBooleanChange(name, checked);
    }
  };
  return (
    <Switch checked={value} onCheckedChange={handleChange} disabled={disabled} />
  );
};
