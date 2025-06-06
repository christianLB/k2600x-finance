import React, { useEffect, useState } from "react";
import { useStrapiSchemas } from "@/context/StrapiSchemaProvider";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Loader,
  Button,
  MultiSelect
} from "@k2600x/design-system";

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
  displayField?: string; // Field to show as label (default: displayName or name)
  apiUrl?: string; // Override for fetching
}

export const StrapiRelationField: React.FC<StrapiRelationFieldProps> = ({
  value,
  onChange,
  target,
  isMulti = false,
  disabled = false,
  placeholder = "(Selecciona...)",
  displayField = "displayName",
  apiUrl,
}) => {
  const [options, setOptions] = useState<RelationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { schemas } = useStrapiSchemas();

  // Resolve collection name using pluralName from schema when available
  const collection = React.useMemo(() => {
    if (schemas && schemas[target]?.schema?.pluralName) {
      return schemas[target].schema.pluralName as string;
    }
    return target.split(".").pop() || target;
  }, [target, schemas]);

  // Fetch related collection only when dialog opens
  useEffect(() => {
    if (!open) return;
    let ignore = false;
    async function fetchOptions() {
      setLoading(true);
      setError(null);
      try {
        const url = apiUrl || `/api/strapi?collection=${collection}`;
        const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ method: "GET", collection }) });
        if (!res.ok) throw new Error("Failed to fetch related data");
        const json = await res.json();
        const items = json.data || [];
        const opts = items.map((item: any) => ({
          label: item.attributes?.[displayField] || item.attributes?.name || item.id,
          value: item.id,
          link: `/admin/${collection}/${item.id}`,
        }));
        if (!ignore) setOptions(opts);
      } catch (e: any) {
        if (!ignore) setError(e.message || "Unknown error");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchOptions();
    return () => { ignore = true; };
  }, [open, collection, apiUrl, displayField]);

  // Ensure normalizedValue is always an array for multi-select
  const normalizedArray = Array.isArray(value) ? value : typeof value === 'undefined' ? [] : [value];
  const selectedOptions = isMulti
    ? options.filter(opt => normalizedArray.includes(opt.value))
    : options.find(opt => opt.value === value);

  // For MultiSelect: options must have id:number, defaultValue:number[]
  // Map options to required shape for MultiSelect
  const multiSelectOptions = options.map(opt => ({ ...opt, id: typeof opt.value === 'number' ? opt.value : Number(opt.value) }));
  const multiSelectDefaultValue = normalizedArray.filter((v) => typeof v === 'number') as number[];

  // For Select: value must be string or undefined
  const selectValue = typeof value === 'string' ? value : (typeof value === 'number' ? String(value) : undefined);

  if (error) {
    return <div style={{ color: '#d32f2f' }}>Error: {error}</div>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="p-0 h-auto text-left"
          disabled={disabled}
        >
          {loading ? (
            <span><Loader /> Cargando...</span>
          ) : (
            isMulti ? (
              !selectedOptions || (Array.isArray(selectedOptions) && selectedOptions.length === 0) ? (
                <span style={{ color: '#888' }}>{placeholder}</span>
              ) : (
                Array.isArray(selectedOptions) ? (
                  selectedOptions.map((opt: any) => (
                    <a key={opt.value} href={opt.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', marginRight: 6 }}>{opt.label}</a>
                  ))
                ) : null
              )
            ) : (
              !selectedOptions || Array.isArray(selectedOptions) ? (
                <span style={{ color: '#888' }}>{placeholder}</span>
              ) : (
                <a href={selectedOptions.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{selectedOptions.label}</a>
              )
            )
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Seleccionar relación</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div style={{ padding: 16 }}><Loader /> Cargando...</div>
        ) : (
          isMulti ? (
            <MultiSelect
              options={multiSelectOptions}
              defaultValue={multiSelectDefaultValue}
              onChange={onChange}
            />
          ) : (
            <Select
              value={selectValue}
              onValueChange={onChange}
            >
              <SelectTrigger>{/* placeholder handled above */}</SelectTrigger>
              <SelectContent>
                {options.map(opt => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StrapiRelationField;
