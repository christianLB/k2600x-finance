import { useState, useEffect, useCallback } from 'react';
import { z, ZodSchema } from 'zod';
import strapi from '@/services/strapi';
import { strapiToFormConfig } from '@/utils/strapiToFormConfig';
import type { FieldConfig } from '@/hooks/useFormFactory';

export function useFieldDefinitions(modelName: string) {
  const [fields, setFields] = useState<FieldConfig[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchSchema() {
      try {
        const res = await strapi.post({ method: 'SCHEMA', schemaUid: modelName });
        const schema = Array.isArray(res.data) ? res.data[0] : res.data;
        const { fieldsConfig } = strapiToFormConfig(schema);
        if (!cancelled) setFields(fieldsConfig);
      } catch {
        if (!cancelled) setFields([]);
      }
    }
    fetchSchema();
    return () => {
      cancelled = true;
    };
  }, [modelName]);

  return fields;
}

export function useZodSchemaFromModel(fields: FieldConfig[]): ZodSchema {
  const [schema, setSchema] = useState<ZodSchema>(z.object({}));

  useEffect(() => {
    const shape: Record<string, any> = {};
    fields.forEach((f) => {
      let field: any = z.any();
      switch (f.type) {
        case 'string':
        case 'text':
        case 'date':
        case 'datetime':
          field = z.string();
          break;
        case 'number':
          field = z.number();
          break;
        case 'boolean':
          field = z.boolean();
          break;
        case 'enum':
          const opts = (f.props?.options || []).map((o: any) => o.value);
          if (opts.length) {
            field = z.enum([opts[0], ...opts.slice(1)] as [string, ...string[]]);
          } else {
            field = z.string();
          }
          break;
        default:
          field = z.any();
      }
      if (!f.required) field = field.optional();
      shape[f.name] = field;
    });
    setSchema(z.object(shape));
  }, [fields]);

  return schema;
}

export function useDefaultValues(modelName: string) {
  const [defaults, setDefaults] = useState<Record<string, any>>({});

  useEffect(() => {
    let cancelled = false;
    async function fetchSchema() {
      try {
        const res = await strapi.post({ method: 'SCHEMA', schemaUid: modelName });
        const schema = Array.isArray(res.data) ? res.data[0] : res.data;
        const { defaultValues } = strapiToFormConfig(schema);
        if (!cancelled) setDefaults(defaultValues);
      } catch {
        if (!cancelled) setDefaults({});
      }
    }
    fetchSchema();
    return () => {
      cancelled = true;
    };
  }, [modelName]);

  return defaults;
}

export function useStrapiSubmitHandler(modelName: string, mode: 'create' | 'update') {
  return useCallback(
    async (values: any) => {
      const method = mode === 'create' ? 'POST' : 'PUT';
      const payload: any = { method, collection: modelName, data: values };
      if (mode === 'update' && values.id) {
        payload.id = values.id;
      }
      await strapi.post(payload);
    },
    [modelName, mode],
  );
}

export function useStrapiForm(modelName: string, mode: 'create' | 'update') {
  const fields = useFieldDefinitions(modelName);
  const schema = useZodSchemaFromModel(fields);
  const defaultValues = useDefaultValues(modelName);
  const onSubmit = useStrapiSubmitHandler(modelName, mode);

  return { schema, defaultValues, fields, onSubmit };
}
