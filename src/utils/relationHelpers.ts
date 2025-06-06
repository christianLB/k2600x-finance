export function extractIds(value: any): Array<string | number> {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === "object" && v !== null ? v.id : v));
  }
  return [typeof value === "object" && value !== null ? value.id : value];
}

export function extractLabels(
  value: any,
  displayField: string = "name",
): string[] {
  if (value == null) return [];
  const getLabel = (v: any) => {
    if (typeof v === "object" && v !== null) {
      return v[displayField] || v.displayName || v.name || String(v.id ?? "");
    }
    return String(v);
  };
  return Array.isArray(value) ? value.map(getLabel) : [getLabel(value)];
}
