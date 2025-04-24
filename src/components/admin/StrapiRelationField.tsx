import React, { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import MultiSelect from "@/components/ui/multi-select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";

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
  name,
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

  // Extract real collection name (last part after dot)
  const collection = target.split(".").pop() || target;

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

  // Single value normalization
  const normalizedValue = isMulti
    ? Array.isArray(value) ? value : []
    : value === null || value === undefined ? undefined : value;

  // Find selected option(s)
  const selectedOptions = isMulti
    ? options.filter(opt => normalizedValue?.includes(opt.value))
    : options.find(opt => opt.value === normalizedValue);

  // Render selected label as link (or placeholder as link)
  const renderSelected = () => {
    if (loading) return <span><Loader /> Cargando...</span>;
    if (isMulti) {
      if (!selectedOptions || selectedOptions.length === 0) {
        return <a href="#" style={{ color: '#888', textDecoration: 'underline' }}>{placeholder}</a>;
      }
      return selectedOptions.map(opt => (
        <a key={opt.value} href={opt.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', marginRight: 6 }}>{opt.label}</a>
      ));
    } else {
      if (!selectedOptions) {
        return <a href="#" style={{ color: '#888', textDecoration: 'underline' }}>{placeholder}</a>;
      }
      return <a href={selectedOptions.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>{selectedOptions.label}</a>;
    }
  };

  if (error) {
    return <div style={{ color: '#d32f2f' }}>Error: {error}</div>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" disabled={disabled} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
          {renderSelected()}
        </button>
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
              options={options}
              defaultValue={normalizedValue}
              placeholder={placeholder}
              onChange={onChange}
              disabled={disabled}
            />
          ) : (
            <Select
              id={name}
              name={name}
              value={normalizedValue}
              onValueChange={onChange}
              disabled={disabled}
            >
              <SelectTrigger id={name} name={name} placeholder={placeholder} />
              <SelectContent>
                {options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
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
