import React from "react";
import { Switch } from "@k2600x/design-system";

interface BooleanCellProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  row?: any;
  name?: string;
  table?: any; // Add table prop to access meta
}

export const BooleanCell: React.FC<BooleanCellProps> = ({
  value,
  onChange,
  disabled = false,
  row,
  name,
  table
}) => {
  const handleChange = (checked: boolean) => {
    // Call the onChange prop if provided
    if (onChange) {
      onChange(checked);
    }
    
    // If we have row, name, and table with onCellUpdate in meta, call it
    if (row && name && table?.options?.meta?.onCellUpdate) {
      table.options.meta.onCellUpdate(row, name, checked);
    }
  };

  return (
    <Switch 
      checked={value} 
      onCheckedChange={handleChange} 
      disabled={disabled} 
    />
  );
};
