// src/components/dynamic-form/DynamicStrapiForm.tsx
"use client";

import React from "react";
import { useStrapiSchemas } from "@/context/StrapiSchemaProvider";
import { useFormFactory } from "@/hooks/useFormFactory";
import { strapiToFormConfig } from "@/utils/strapiToFormConfig";
import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useRelationOptions } from "@/hooks/useRelationOptions";

export interface DynamicStrapiFormProps {
  collection: string;
  document?: any; // If provided, form is in edit mode; otherwise, create mode
  onSuccess?: (values: any) => void;
  onError?: (err: any) => void;
}

export function DynamicStrapiForm({
  collection,
  document,
  onSuccess,
  onError,
}: DynamicStrapiFormProps) {
  // 1. Get schema from context
  const { schemas, loading: schemasLoading, error: schemasError } = useStrapiSchemas();
  const schema = schemas[collection];

  // Defensive: handle loading/errors from context
  if (schemasLoading) {
    return <div>Loading schema...</div>;
  }
  if (schemasError) {
    return <div style={{ color: "red" }}>Error loading schemas: {schemasError}</div>;
  }
  if (!schema || !schema.schema || !schema.schema.attributes || Object.keys(schema.schema.attributes).length === 0) {
    return <div style={{ color: "red" }}>Error: schema not found or empty for {collection}</div>;
  }

  // Prepare form config & hooks
  const rawSchema = schema;
  const { schema: zodSchema, defaultValues, fieldsConfig } = React.useMemo(
    () => strapiToFormConfig(rawSchema),
    [rawSchema]
  );
  // Normalize relation fields in document for form compatibility
  function normalizeRelations(data: any, schema: any) {
    if (!data || !schema) return data;
    const normalized = { ...data };
    for (const [key, field] of Object.entries(schema.schema?.attributes ?? {})) {
      if (field.type === 'relation') {
        if (Array.isArray(normalized[key])) {
          normalized[key] = normalized[key].map((item: any) => item?.id ?? item);
        } else if (normalized[key] && typeof normalized[key] === 'object') {
          normalized[key] = normalized[key].id ?? normalized[key];
        }
      }
    }
    return normalized;
  }
  const initialValues = document
    ? normalizeRelations({ ...defaultValues, ...document }, schema)
    : defaultValues;
  // Pass schemas to useRelationOptions for correct pluralName resolution
  const relationOptionsMap = fieldsConfig.length > 0 ? useRelationOptions(fieldsConfig, schemas) : {};
  const formFactory = useFormFactory(
    zodSchema,
    initialValues,
    fieldsConfig,
    relationOptionsMap
  );

  // Submission handler (create or update logic should be handled outside this form)
  const handleSubmit = async (values: any) => {
    try {
      // Just call onSuccess/onError, actual mutation is handled by parent
      onSuccess?.(values);
    } catch (err: any) {
      onError?.(err);
    }
  };

  if (!fieldsConfig.length) {
    return <div style={{ color: "red" }}>Error: No valid fields for {collection}</div>;
  }

  return (
    <FormProvider {...formFactory.form}>
      <form onSubmit={formFactory.form.handleSubmit(handleSubmit)} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {formFactory.renderFields()}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit">{document ? "Update" : "Create"}</Button>
        </div>
      </form>
    </FormProvider>
  );
}

export default DynamicStrapiForm;
