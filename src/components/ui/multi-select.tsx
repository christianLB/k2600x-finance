import React from "react";
import Select from "react-select";

interface Option {
  id: number;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  defaultValue?: number[];
  placeholder?: string;
  onChange: (selectedIds: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, defaultValue, placeholder, onChange }) => {
  const selectedOptions = options.filter(opt => defaultValue?.includes(opt.id));

  return (
    <Select
      isMulti
      options={options}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.id.toString()}
      value={selectedOptions}
      placeholder={placeholder || "Selecciona..."}
      onChange={(selected) => onChange(selected.map((opt: any) => opt.id))}
      className="text-black"
    />
  );
};

export default MultiSelect;
