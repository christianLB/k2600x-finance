import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { strapiPublic } from "@/lib/strapi.public";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Loader,
  MultiSelect,
} from "@k2600x/design-system";
import { extractIds } from "@/utils/relationHelpers";

// Strapi data structure
interface StrapiDataItem<T> {
  id: number;
  attributes: T;
}

interface RelationOption {
  label: string;
  value: string | number;
  link?: string; // URL to the related entity (optional)
}

interface StrapiRelationFieldProps {
  value: string | number | Array<string | number> | null;
  onChange: (value: number | string | number[] | undefined) => void;
  target: string; // Strapi collection name
  isMulti?: boolean;
  placeholder?: string;
  displayField?: string; // Field used as label (default: "name")
}

export const StrapiRelationField: React.FC<StrapiRelationFieldProps> = ({
  value,
  onChange,
  target,
  isMulti = false,
  placeholder = "(Selecciona...)",
  displayField = "name",
}) => {
  const { data: options = [], isLoading, error } = useQuery<RelationOption[], Error>({
    queryKey: ['strapi', target, 'relation', displayField],
    queryFn: async () => {
      const response = await strapiPublic.collection(target).find({
        fields: [displayField],
        pagination: { limit: -1 }, // Fetch all items for the dropdown
      });

      if (!response.data) return [];

      return response.data.map((item) => {
        const attrs = item.attributes;
        return {
          label: String(attrs[displayField] || attrs.displayName || attrs.name || item.id),
          value: item.id,
          link: `/admin/${target}/${item.id}`,
        };
      });
    },
  });

  const normalizedIds = useMemo(() => extractIds(value), [value]);

  const { multiSelectOptions, selectValue, selectedLabel } = useMemo(() => {
    const stringIds = normalizedIds.map(String);

    const multiOpts = options.map((opt) => ({
      id: Number(opt.value),
      label: opt.label,
    }));

    const singleSelected = options.find((opt) => stringIds.includes(String(opt.value)));

    return {
      multiSelectOptions: multiOpts,
      selectValue: singleSelected ? String(singleSelected.value) : undefined,
      selectedLabel: singleSelected ? singleSelected.label : placeholder,
    };
  }, [options, normalizedIds, placeholder]);


  if (error) {
    return <div style={{ color: "#d32f2f" }}>Error: {error.message}</div>;
  }

  return (
    <div>
      {isLoading ? (
        <div>
          <Loader /> Cargando...
        </div>
      ) : isMulti ? (
        <MultiSelect
          options={multiSelectOptions}
          selectedIds={normalizedIds}
          onChange={(ids) => onChange(ids as any)}
        />
      ) : (
        <Select
          value={selectValue}
          onValueChange={(val) => {
            onChange(val ? Number(val) : undefined);
          }}
        >
          <SelectTrigger>{selectedLabel}</SelectTrigger>
          <SelectContent>
            {options.map((opt: RelationOption) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default StrapiRelationField;
