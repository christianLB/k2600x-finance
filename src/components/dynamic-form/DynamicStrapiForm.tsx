// src/components/dynamic-form/DynamicStrapiForm.tsx
"use client";

import React from "react";
import { useStrapiSchemas } from "@/context/StrapiSchemaProvider";
import { useFormFactory } from "@/hooks/useFormFactory";
import { strapiToFormConfig } from "@/utils/strapiToFormConfig";
import { FormProvider } from "react-hook-form";
import { Button } from "@k2600x/design-system";
//import { useRelationOptions } from "@/hooks/useRelationOptions";

export interface DynamicStrapiFormProps {
  collection: string;
  document?: any; // If provided, form is in edit mode; otherwise, create mode
  onSuccess?: (values: any) => void;
  onError?: (err: any) => void;
  hideSubmitButton?: boolean; // Whether to hide the form's own submit button
}

export const DynamicStrapiForm = React.forwardRef<
  { submitForm: () => void },
  DynamicStrapiFormProps
>((
  {
    collection,
    document,
    onSuccess,
    onError,
    hideSubmitButton = false,
  }, 
  ref
) => {
  // 1. Get schema from context
  const { schemas, loading: schemasLoading, error: schemasError } = useStrapiSchemas();
  const schema = schemas[collection];

  // Move all hooks to the top level, before any early returns
  //const relationOptionsMap = useRelationOptions([], schemas);
  const {
    schema: baseSchema,
    defaultValues: baseDefaults,
    fieldsConfig: baseFields,
  } = React.useMemo(() => strapiToFormConfig(schema), [schema]);

  // Remove documentId from form fields and validation schema
  const zodSchema = React.useMemo(
    () =>
      baseSchema && (baseSchema as any).omit
        ? (baseSchema as any).omit({ documentId: true })
        : baseSchema,
    [baseSchema]
  );
  const fieldsConfig = React.useMemo(
    () => baseFields.filter((f) => f.name !== "documentId"),
    [baseFields]
  );
  const defaultValues = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { documentId: _docId, ...rest } = (baseDefaults || {}) as any;
    return rest;
  }, [baseDefaults]);

  // PATCH: If document is present (edit mode), override defaultValues with document
  const mergedDefaultValues = React.useMemo(() => {
    if (!document) return defaultValues;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { documentId: _docId, ...restDoc } = document;
    return { ...defaultValues, ...restDoc };
  }, [defaultValues, document]);

  const formFactory = useFormFactory(
    zodSchema,
    mergedDefaultValues,
    fieldsConfig,
    //relationOptionsMap
  );

  // Defensive: handle loading/errors from context
  const handleSubmit = async (values: any) => {
    try {
      onSuccess?.(values);
    } catch (err: any) {
      onError?.(err);
    }
  };

  // Expose submitForm method via ref
  React.useImperativeHandle(ref, () => ({
    submitForm: () => {
      formFactory.form.handleSubmit(handleSubmit)();
    },
  }));

  // Render fields in a 3-column grid
  const renderFields = () => {
    if (!fieldsConfig.length) {
      return <div className="text-destructive">Error: No valid fields for {collection}</div>;
    }

    const fields = formFactory.renderFields();
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {fields}
      </div>
    );
  };

  if (schemasLoading) {
    return <div>Loading schema...</div>;
  }
  if (schemasError) {
    return <div style={{ color: "red" }}>Error loading schemas: {schemasError}</div>;
  }
  if (!schema || !schema.schema || !schema.schema.attributes || Object.keys(schema.schema.attributes).length === 0) {
    return <div style={{ color: "red" }}>Error: schema not found or empty for {collection}</div>;
  }

  return (
    <FormProvider {...formFactory.form}>
      <form 
        onSubmit={formFactory.form.handleSubmit(handleSubmit)} 
        className="flex flex-col gap-6 py-2"
      >
        {renderFields()}
        {!hideSubmitButton && (
          <div className="flex justify-end mt-4">
            <Button type="submit" size="sm">{document ? "Update" : "Create"}</Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
});

DynamicStrapiForm.displayName = 'DynamicStrapiForm';

export default DynamicStrapiForm;
