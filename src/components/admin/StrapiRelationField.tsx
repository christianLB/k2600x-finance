import React, { useEffect, useState } from "react";
import { useStrapiSchemas } from "@/context/StrapiSchemaProvider";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Loader,
  MultiSelect,
} from "@k2600x/design-system";
import { extractIds } from "@/utils/relationHelpers";

interface RelationOption {
  label: string;
  value: string | number;
  link?: string; // URL to the related entity (optional)
}

interface StrapiRelationFieldProps {
  name: string;
  value: string | number | Array<string | number> | null;
  onChange: (val: any) => void;
  target: string; // Strapi collection name
  isMulti?: boolean;
  disabled?: boolean;
  placeholder?: string;
  displayField?: string; // Field used as label (default: "name")
  apiUrl?: string; // Override for fetching
}

export const StrapiRelationField: React.FC<StrapiRelationFieldProps> = ({
  value,
  onChange,
  target,
  isMulti = false,
  disabled = false,
  placeholder = "(Selecciona...)",
  displayField = "name",
  apiUrl,
}) => {
  const [options, setOptions] = useState<RelationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { schemas } = useStrapiSchemas();

  // Resolve collection name using pluralName from schema when available
  const collection = React.useMemo(() => {
    if (schemas && schemas[target]?.schema?.pluralName) {
      return schemas[target].schema.pluralName as string;
    }
    return target.split(".").pop() || target;
  }, [target, schemas]);

  // Fetch related collection when component mounts or deps change
  useEffect(() => {
    let ignore = false;
    async function fetchOptions() {
      setLoading(true);
      setError(null);
      try {
        const url = apiUrl || `/api/strapi?collection=${collection}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method: "GET", collection }),
        });
        if (!res.ok) throw new Error("Failed to fetch related data");
        const json = await res.json();
        const items = json.data || [];
        const opts = items.map((item: any) => {
          const attrs = item.attributes || {};
          return {
            label:
              attrs[displayField] ||
              attrs.displayName ||
              attrs.name ||
              item[displayField] ||
              item.displayName ||
              item.name ||
              item.id,
            value: item.id,
            link: `/admin/${collection}/${item.id}`,
          };
        });
        if (!ignore) setOptions(opts);
      } catch (e: any) {
        if (!ignore) setError(e.message || "Unknown error");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchOptions();
    return () => {
      ignore = true;
    };
  }, [collection, apiUrl, displayField]);

  // Normalize incoming value to an array of ids
  const normalizedIds = extractIds(value);
  const normalizedArray = normalizedIds.map((v) => String(v));

  const selectedOptions = isMulti
    ? options.filter((opt) => normalizedArray.includes(String(opt.value)))
    : options.find((opt) => normalizedArray.includes(String(opt.value)));

  // For MultiSelect: options must have id:number, defaultValue:number[]
  // Map options to required shape for MultiSelect
  const multiSelectOptions = options.map((opt) => ({
    id: typeof opt.value === "number" ? opt.value : Number(opt.value),
    label: opt.label,
  }));
  const multiSelectDefaultValue = normalizedIds;

  // For Select: value must be string or undefined
  const selectValue =
    normalizedArray.length > 0 ? String(normalizedArray[0]) : undefined;

  if (error) {
    return <div style={{ color: "#d32f2f" }}>Error: {error}</div>;
  }

  return (
    <div>
      {loading ? (
        <div>
          <Loader /> Cargando...
        </div>
      ) : isMulti ? (
        <MultiSelect
          options={multiSelectOptions}
          defaultValue={multiSelectDefaultValue}
          onChange={onChange}
          placeholder={placeholder}
        />
      ) : (
        <Select
          value={selectValue}
          onValueChange={(val) => {
            const parsed =
              options.length > 0 && typeof options[0].value === "number"
                ? Number(val)
                : val;
            onChange(parsed);
          }}
          disabled={disabled}
        >
          <SelectTrigger>
            {selectedOptions && !Array.isArray(selectedOptions)
              ? selectedOptions.label
              : placeholder}
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
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
