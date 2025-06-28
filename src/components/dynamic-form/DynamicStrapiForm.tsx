// src/components/dynamic-form/DynamicStrapiForm.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormFactory } from "@/hooks/useFormFactory";
import { strapiToFormConfig } from "@/utils/strapiToFormConfig";
import { FormProvider } from "react-hook-form";
import { Button } from "@k2600x/design-system";
import { z } from "zod";

// Renamed to avoid potential conflicts
interface DynamicFormStrapiSchema {
  schema: {
    attributes: { [key: string]: any };
    [key: string]: any;
  };
  [key: string]: any;
}

export interface DynamicStrapiFormProps<T> {
  collection: string;
  document?: Partial<T>;
  onSuccess?: (values: Partial<T>) => void;
  onError?: (err: Error) => void;
  hideSubmitButton?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
}

const fetchSchema = async (collection: string): Promise<DynamicFormStrapiSchema> => {
  const res = await fetch(`/api/strapi/schemas/${collection}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch schema for ${collection}`);
  }
  return res.json();
};

export const DynamicStrapiForm = React.forwardRef(
  <T extends { id?: number }>(
    {
      collection,
      document,
      onSuccess,
      onError,
      hideSubmitButton = false,
      onDirtyChange,
    }: DynamicStrapiFormProps<T>,
    ref: React.ForwardedRef<{ submitForm: () => void; isDirty: () => boolean }>
  ) => {
    const { 
      data: schema, 
      isLoading: schemasLoading, 
      error: schemasError 
    } = useQuery<DynamicFormStrapiSchema, Error>({
      queryKey: ['strapi', 'schema', collection],
      queryFn: () => fetchSchema(collection),
      enabled: !!collection,
    });

    const { schema: zodSchema, defaultValues, fieldsConfig } = React.useMemo(
      () => {
        if (!schema) {
          return { schema: z.object({}), defaultValues: {}, fieldsConfig: [] };
        }
        return strapiToFormConfig(schema);
      },
      [schema]
    );

    const mergedDefaultValues = React.useMemo(() => {
      if (!document) return defaultValues;
      // 'id' is a valid property on T, but not on the form values
      const { id, ...restDoc } = document;
      return { ...defaultValues, ...restDoc };
    }, [defaultValues, document]);

    const formFactory = useFormFactory(zodSchema, mergedDefaultValues, fieldsConfig);

    const handleSubmit = async (values: Partial<T>) => {
      try {
        onSuccess?.(values);
      } catch (err: any) {
        onError?.(err as Error);
      }
    };

    React.useImperativeHandle(ref, () => ({
      submitForm: () => formFactory.form.handleSubmit(handleSubmit)(),
      isDirty: () => formFactory.form.formState.isDirty,
    }));

    React.useEffect(() => {
      onDirtyChange?.(formFactory.form.formState.isDirty);
    }, [formFactory.form.formState.isDirty, onDirtyChange]);

    const renderFields = () => {
      if (!fieldsConfig?.length) {
        return <div className="text-destructive">Error: No valid fields for {collection}</div>;
      }
      const fields = formFactory.renderFields();
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {fields}
        </div>
      );
    };

    if (schemasLoading) return <div>Loading schema...</div>;
    if (schemasError) return <div style={{ color: "red" }}>Error: {schemasError.message}</div>;
    if (!schema?.schema?.attributes) return <div style={{ color: "red" }}>Schema not found or empty for {collection}</div>;

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
  }
);

DynamicStrapiForm.displayName = 'DynamicStrapiForm';

export default DynamicStrapiForm;
