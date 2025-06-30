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
  schema?: {
    attributes: { [key: string]: any };
    [key: string]: any;
  };
  attributes?: { [key: string]: any }; // Support direct attributes format
  uid?: string;
  [key: string]: any;
}

export interface DynamicStrapiFormProps<T> {
  collection: string;
  schema?: DynamicFormStrapiSchema; // Optional schema prop
  document?: Partial<T>;
  onSuccess?: (values: Partial<T>) => void;
  onError?: (err: Error) => void;
  hideSubmitButton?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
}

const fetchSchema = async (
  collection: string
): Promise<DynamicFormStrapiSchema> => {
  console.log("🔍 DynamicStrapiForm fetching schema for:", collection);
  const encodedCollection = btoa(collection);
  const res = await fetch(`/api/strapi/schemas/${encodedCollection}`);
  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Schema fetch failed:", {
      status: res.status,
      error: errorText,
    });
    throw new Error(`Failed to fetch schema for ${collection}: ${res.status}`);
  }
  const schema = await res.json();
  console.log("✅ Schema fetched successfully:", schema.uid);
  return schema;
};

export const DynamicStrapiForm = React.forwardRef(
  <T extends { id?: number }>(
    {
      collection,
      schema: propsSchema,
      document,
      onSuccess,
      onError,
      hideSubmitButton = false,
      onDirtyChange,
    }: DynamicStrapiFormProps<T>,
    ref: React.ForwardedRef<{ submitForm: () => void; isDirty: () => boolean }>
  ) => {
    const {
      data: fetchedSchema,
      isLoading: schemasLoading,
      error: schemasError,
    } = useQuery<DynamicFormStrapiSchema, Error>({
      queryKey: ["strapi", "schema", collection],
      queryFn: () => fetchSchema(collection),
      enabled: !!collection && !propsSchema, // Only fetch if no schema provided
    });

    // Use provided schema or fetched schema
    const schema = propsSchema || fetchedSchema;

    const {
      schema: zodSchema,
      defaultValues,
      fieldsConfig,
    } = React.useMemo(() => {
      if (!schema) {
        return { schema: z.object({}), defaultValues: {}, fieldsConfig: [] };
      }

      // Normalize schema format for strapiToFormConfig
      let normalizedSchema = schema;
      if (schema.attributes && !schema.schema) {
        // If schema has direct attributes, wrap it in the expected format
        normalizedSchema = {
          schema: {
            attributes: schema.attributes,
            ...schema,
          },
        };
      }

      return strapiToFormConfig(normalizedSchema);
    }, [schema]);

    const mergedDefaultValues = React.useMemo(() => {
      console.log("🔄 DynamicStrapiForm merging values:", {
        hasDocument: !!document,
        document,
        defaultValues,
        fieldsConfigLength: fieldsConfig?.length,
      });

      if (!document) return defaultValues;
      // 'id' is a valid property on T, but not on the form values
      const { id, ...restDoc } = document;
      const merged = { ...defaultValues, ...restDoc };

      console.log("✅ Merged default values:", merged);
      return merged;
    }, [defaultValues, document]);

    const formFactory = useFormFactory(
      zodSchema,
      mergedDefaultValues,
      fieldsConfig,
      {
        collection: collection,
        documentId: (document as any)?.documentId,
      }
    );

    // Force reset when document changes to ensure correct default values
    React.useEffect(() => {
      if (document && mergedDefaultValues) {
        console.log(
          "🔄 Resetting form with new document data:",
          mergedDefaultValues
        );
        formFactory.form.reset(mergedDefaultValues);
      }
    }, [document, mergedDefaultValues]);

    const handleSubmit = async (values: Partial<T>) => {
      try {
        onSuccess?.(values);
      } catch (err: any) {
        onError?.(err as Error);
      }
    };

    React.useImperativeHandle(ref, () => ({
      submitForm: () => {
        console.log("🚀 Explicit form submit called");
        formFactory.form.handleSubmit(handleSubmit)();
      },
      isDirty: () => formFactory.form.formState.isDirty,
    }));

    // Watch form values to detect changes
    const watchedValues = formFactory.form.watch();

    // Custom dirty detection since React Hook Form isn't working properly
    const isCustomDirty = React.useMemo(() => {
      if (!mergedDefaultValues || !watchedValues) return false;

      // Compare each field
      for (const key in mergedDefaultValues) {
        const defaultValue = (mergedDefaultValues as any)[key];
        const currentValue = (watchedValues as any)[key];

        // Skip comparison for system fields
        if (
          [
            "id",
            "createdAt",
            "updatedAt",
            "publishedAt",
            "documentId",
          ].includes(key)
        ) {
          continue;
        }

        // Deep comparison for objects
        if (
          typeof defaultValue === "object" &&
          typeof currentValue === "object"
        ) {
          if (JSON.stringify(defaultValue) !== JSON.stringify(currentValue)) {
            return true;
          }
        } else if (defaultValue !== currentValue) {
          return true;
        }
      }
      return false;
    }, [mergedDefaultValues, watchedValues]);

    React.useEffect(() => {
      const reactHookFormIsDirty = formFactory.form.formState.isDirty;
      const currentValues = formFactory.form.getValues();

      console.log("🔄 Form dirty state changed:", {
        reactHookFormIsDirty,
        isCustomDirty,
        usingCustomDirty: isCustomDirty,
        dirtyFields: formFactory.form.formState.dirtyFields,
        values: currentValues,
        defaultValues: mergedDefaultValues,
        // Compare specific field
        estadoComparison: {
          current: (currentValues as any).estado,
          default: (mergedDefaultValues as any).estado,
          equal:
            (currentValues as any).estado ===
            (mergedDefaultValues as any).estado,
        },
      });

      // Use our custom dirty detection
      onDirtyChange?.(isCustomDirty);
    }, [
      formFactory.form.formState.isDirty,
      watchedValues,
      mergedDefaultValues,
      isCustomDirty,
      onDirtyChange,
    ]);

    const renderFields = () => {
      if (!fieldsConfig?.length) {
        return (
          <div className="text-destructive">
            Error: No valid fields for {collection}
          </div>
        );
      }
      const fields = formFactory.renderFields();
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
        >
          {fields}
        </div>
      );
    };

    if (schemasLoading) return <div>Loading schema...</div>;
    if (schemasError)
      return <div style={{ color: "red" }}>Error: {schemasError.message}</div>;

    // Check after normalization - schema might have direct attributes or nested schema.attributes
    const hasValidSchema =
      schema &&
      ((schema.schema?.attributes &&
        Object.keys(schema.schema.attributes).length > 0) ||
        (schema.attributes && Object.keys(schema.attributes).length > 0));

    if (!hasValidSchema) {
      console.log("❌ Schema validation failed:", {
        schema,
        hasSchema: !!schema?.schema,
        hasAttributes: !!schema?.attributes,
      });
      return (
        <div style={{ color: "red" }}>
          Schema not found or empty for {collection}
        </div>
      );
    }

    return (
      <FormProvider {...formFactory.form}>
        <div
          onSubmit={(e) => {
            console.log("🚫 Div captured submit event, preventing");
            e.preventDefault();
            e.stopPropagation();
          }}
          className="flex flex-col gap-6 py-2"
        >
          <form
            onSubmit={(e) => {
              console.log("📝 Form submit event triggered - preventing");
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
          >
            {renderFields()}
            {!hideSubmitButton && (
              <div className="flex justify-end mt-4">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    console.log("🖱️ Submit button clicked");
                    formFactory.form.handleSubmit(handleSubmit)();
                  }}
                >
                  {document ? "Update" : "Create"}
                </Button>
              </div>
            )}
          </form>
        </div>
      </FormProvider>
    );
  }
);

DynamicStrapiForm.displayName = "DynamicStrapiForm";

export default DynamicStrapiForm;
