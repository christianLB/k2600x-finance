import { z, ZodTypeAny } from "zod";
import type { FieldConfig } from "@/hooks/useFormFactory";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";

// Helper for allowedTypes to accept string for accept attribute
function mapMediaAccept(allowedTypes: string[] = []) {
  const map: Record<string, string> = {
    images: 'image/*',
    videos: 'video/*',
    audios: 'audio/*',
    files: '*/*',
  };
  return allowedTypes.map(t => map[t] || '*/*').join(',');
}

const typeMap: Record<string, any> = {
  string: {
    type: "string",
    zod: z.string(),
    component: Input,
    placeholder: "Enter text...",
    props: { type: "text" },
  },
  text: {
    type: "text",
    zod: z.string(),
    component: Textarea,
    placeholder: "Enter text...",
  },
  boolean: {
    type: "boolean",
    zod: z.boolean(),
    component: Switch,
    placeholder: undefined,
  },
  enumeration: {
    type: "enum",
    // zod and options will be handled in the loop
    component: Select,
    placeholder: "Select one...",
  },
  integer: {
    type: "number",
    zod: z.number().int(),
    component: Input,
    placeholder: "Enter number...",
    props: { type: "number" },
  },
  float: {
    type: "number",
    zod: z.number(),
    component: Input,
    placeholder: "Enter number...",
    props: { type: "number" },
  },
  decimal: {
    type: "number",
    zod: z.number(),
    component: Input,
    placeholder: "Enter number...",
    props: { type: "number" },
  },
  date: {
    type: "date",
    zod: z.string(),
    component: Input,
    placeholder: "Select date...",
    props: { type: "date" },
  },
  datetime: {
    type: "datetime",
    zod: z.string(),
    component: Input,
    placeholder: "Select datetime...",
    props: { type: "datetime-local" },
  },
  relation: {
    type: "relation",
    zod: z.any(),
    component: Select,
    placeholder: "Select related...",
  },
  media: {
    type: "media",
    zod: z.any(),
    component: Input,
    placeholder: "Upload file...",
    props: { type: "file" },
  },
};

export function strapiToFormConfig(strapiSchema: any) {
  const attributes = strapiSchema?.schema?.attributes || {};
  const zodShape: Record<string, ZodTypeAny> = {};
  const defaultValues: Record<string, any> = {};
  const fieldsConfig: FieldConfig<any>[] = [];

  for (const [name, attr] of Object.entries<any>(attributes)) {
    let mapping = typeMap[attr.type] || typeMap['string'];
    let zodField = mapping.zod;
    let fieldComponent = mapping.component;
    let fieldProps: Record<string, any> = { ...(mapping.props || {}) };
    let placeholder = attr.placeholder || mapping.placeholder || '';
    let options;

    // ENUMERATION: Provide options for select
    if (attr.type === 'enumeration' && Array.isArray(attr.enum)) {
      options = attr.enum.map((v) => ({ label: v, value: v }));
      fieldProps.options = options;
      fieldComponent = Select; // Force Select for enum fields
      zodField = z.enum([...attr.enum]);
      // PATCH: Add debug if options is empty
      if (!options || options.length === 0) {
        console.warn('Enum field', name, 'has no options!', attr);
      }
    }

    // RELATION: Mark for async options (handled at page level)
    if (attr.type === 'relation') {
      fieldProps.target = attr.target;
      fieldProps.isMulti = attr.relationType?.includes('Many');
    }

    // MEDIA: File input specifics
    if (attr.type === 'media') {
      fieldProps.multiple = attr.multiple || false;
      fieldProps.accept = mapMediaAccept(attr.allowedTypes);
    }

    // NUMBER: min/max/step
    if (["integer", "float", "decimal"].includes(attr.type)) {
      if (typeof attr.min === 'number') fieldProps.min = attr.min;
      if (typeof attr.max === 'number') fieldProps.max = attr.max;
      if (typeof attr.step === 'number') fieldProps.step = attr.step;
    }

    // DATE/DATETIME: use correct input type
    if (["date", "datetime"].includes(attr.type)) {
      fieldProps.type = mapping.props?.type;
    }

    // Fallback: always ensure zodField is set
    if (!zodField) {
      zodField = z.any();
    }
    if (attr.required) {
      zodField = zodField.min ? zodField.min(1) : zodField;
    }
    zodShape[name] = attr.required ? zodField : zodField.optional();
    defaultValues[name] = attr.default ?? '';

    fieldsConfig.push({
      name,
      label: attr.displayName || name.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
      type: attr.type === 'enumeration' ? 'enum' : mapping.type, // PATCH: force type to enum for enum fields
      required: !!attr.required,
      disabled: !!attr.disabled,
      placeholder,
      description: attr.description || '',
      variant: attr.variant || undefined,
      component: fieldComponent,
      props: fieldProps,
    });
  }

  const schema = z.object(zodShape);
  return { schema, defaultValues, fieldsConfig };
}
