import { z, ZodTypeAny } from "zod";
import type { FieldConfig } from "@/hooks/useFormFactory";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { StrapiRelationField } from "@/components/admin/StrapiRelationField";

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
    component: StrapiRelationField,
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

type StrapiAttr = {
  type?: string;
  enum?: string[];
  required?: boolean;
  placeholder?: string;
  default?: any;
  displayName?: string;
  disabled?: boolean;
  description?: string;
  variant?: string;
  target?: string;
  relationType?: string;
  multiple?: boolean;
  allowedTypes?: string[];
  min?: number;
  max?: number;
  step?: number;
};

export function strapiToFormConfig(strapiSchema: any) {
  const attributes = strapiSchema?.schema?.attributes || {};
  // ENHANCEMENT: Defensive - ensure attributes is a non-empty object
  if (!attributes || Object.keys(attributes).length === 0) {
    console.error("strapiToFormConfig: No attributes found in schema", strapiSchema);
    return { schema: z.object({}), defaultValues: {}, fieldsConfig: [] };
  }
  console.log("strapiToFormConfig: attributes:", attributes);
  const zodShape: Record<string, ZodTypeAny> = {};
  const defaultValues: Record<string, any> = {};
  const fieldsConfig: FieldConfig[] = [];

  for (const [name, attrRaw] of Object.entries(attributes)) {
    const attr = attrRaw as StrapiAttr;
    // ENHANCEMENT: Only process fields that are actually in the schema
    if (!attr || !attr.type) {
      console.warn(`Skipping field '${name}' due to missing type in schema`, attr);
      continue;
    }
    console.log(`Field: ${name}`, attr);

    // DEFENSIVE: Skip unknown/unsupported types
    if (!typeMap[attr.type] && attr.type !== 'relation' && attr.type !== 'media' && attr.type !== 'enumeration') {
      console.warn(`Unknown type '${attr.type}' for field '${name}', skipping.`);
      continue;
    }

    const mapping = typeMap[attr.type] || typeMap['string'];
    let zodField = mapping.zod;
    let fieldComponent = mapping.component;
    const fieldProps: Record<string, any> = { ...(mapping.props || {}) };
    let placeholder = attr.placeholder || mapping.placeholder || '';
    
    // ENUMERATION: Provide options for select
    if (attr.type === 'enumeration' && Array.isArray(attr.enum)) {
      // Defensive: Always provide non-empty options array
      const enumValues = attr.enum.length > 0 ? attr.enum : ["NO_ENUM"];
      fieldProps.options = enumValues.map((v: string) => ({ label: v, value: v }));
      fieldComponent = Select; // Force Select for enum fields
      // Defensive: Ensure zod enum is correct and optional if not required
      zodField = attr.required === true
        ? z.enum(enumValues as [string, ...string[]])
        : z.enum(enumValues as [string, ...string[]]).optional();
      // Defensive: Always provide a placeholder for enums
      placeholder = attr.placeholder || "(Select one...)";
      // Defensive: Default value is undefined if not required and no default is provided
      if (attr.required !== true && (attr.default === undefined || attr.default === null)) {
        defaultValues[name] = undefined;
      } else {
        defaultValues[name] = attr.default ?? enumValues[0];
      }
      // PATCH: Add debug if options is empty
      if (!fieldProps.options || fieldProps.options.length === 0) {
        console.warn('Enum field', name, 'has no options!', attr);
      }
    }

    // RELATION: Use StrapiRelationField for relation fields
    if (attr.type === 'relation') {
      fieldProps.target = attr.target;
      fieldProps.isMulti = attr.relationType?.includes('Many');
      fieldComponent = StrapiRelationField;
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
      zodField = z.number();
      if (typeof attr.min === 'number') zodField = zodField.min(attr.min);
      if (typeof attr.max === 'number') zodField = zodField.max(attr.max);
      zodField = attr.required === true ? zodField : zodField.optional();
    }

    // DATE/DATETIME: use correct input type
    if (["date", "datetime"].includes(attr.type)) {
      fieldProps.type = mapping.props?.type;
    }

    // Fallback: always ensure zodField is set
    if (!zodField) {
      zodField = z.any();
    }
    zodShape[name] = zodField;
    defaultValues[name] = attr.default ?? '';

    fieldsConfig.push({
      name,
      label: attr.displayName || name.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
      type: attr.type === 'enumeration' ? 'enum' : mapping.type, 
      required: attr.required === true, 
      disabled: !!attr.disabled,
      placeholder,
      description: attr.description || '',
      variant: attr.variant || undefined,
      component: fieldComponent,
      props: fieldProps,
    });
  }

  console.log("strapiToFormConfig: fieldsConfig:", fieldsConfig);
  // ENHANCEMENT: Defensive - return empty config if no valid fields
  if (fieldsConfig.length === 0) {
    console.error("strapiToFormConfig: No valid fields generated for schema", strapiSchema);
    return { schema: z.object({}), defaultValues: {}, fieldsConfig: [] };
  }

  const schema = z.object(zodShape);
  return { schema, defaultValues, fieldsConfig };
}
