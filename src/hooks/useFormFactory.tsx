// ─────────────────────────────────────────────────────────────────────────────

// useFormFactory hook

// - Initializes RHF with Zod schema + defaultValues

// - Wraps children in FormProvider

// - Renders fields by delegating to components with unified interface

// ─────────────────────────────────────────────────────────────────────────────

 

import { useForm, Controller } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import React from "react";

import { Select, SelectTrigger, SelectContent, SelectItem } from "@k2600x/design-system";

import { StrapiMediaUpload } from "@/components/admin/StrapiMediaUpload";

 

export type FieldConfig = {

  name: string;

  label: string;

  type: string;

  required?: boolean;

  disabled?: boolean;

  placeholder?: string;

  description?: string;

  variant?: string;

  component: React.ComponentType<any>;

  props?: Record<string, any>;

};

 

export function useFormFactory(

  schema: any,

  defaultValues: Record<string, any>,

  fieldsConfig: FieldConfig[],

  formContext?: {
    collection?: string;
    documentId?: string;
  }

) {

  const form = useForm({ resolver: zodResolver(schema), defaultValues });

  const {

    formState: { errors },

    register,

    control,

    setValue,

    watch,

  } = form;

 

  function renderFields() {

    return fieldsConfig.map((cfg) => {

      const Comp = cfg.component;

      if (!Comp) {

        return (

          <div key={cfg.name} style={{ color: "red" }}>

            No component mapped for field: <b>{cfg.name}</b> (type: {cfg.type})

          </div>

        );

      }

      const errorMsg = errors[cfg.name]?.message as string | undefined;

 

      // --- ENUM/SELECT FIELDS ---

      if (cfg.type === "enum" && cfg.props?.options) {

        const options = cfg.props.options;

        const value = watch(cfg.name);

        const selectedOption = options.find((opt: any) => opt.value === value);

        return (

          <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, height: '100%' }}>

            <label htmlFor={cfg.name} style={{ fontWeight: 500, marginBottom: 2 }}>

              {cfg.label}

              {cfg.required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}

            </label>

            <Select value={value} onValueChange={(e: any) => setValue(cfg.name, e)}>

              <SelectTrigger>{selectedOption ? selectedOption.label : (cfg.placeholder || "(Selecciona...)")}</SelectTrigger>

              <SelectContent>

                {options.map((opt: any) => (

                  <SelectItem key={opt.value} value={opt.value}>

                    {opt.label}

                  </SelectItem>

                ))}

              </SelectContent>

            </Select>

            {cfg.description && (

              <span style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{cfg.description}</span>

            )}

            {errorMsg && (

              <span style={{ color: "#d32f2f", fontSize: 13, marginTop: 2 }}>{errorMsg}</span>

            )}

          </div>

        );

      }

 

      // --- RELATION FIELDS ---

      if (cfg.type === "relation") {

        const { target, isMulti, displayField, apiUrl } = cfg.props || {};

        return (

          <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, height: '100%' }}>

            <label htmlFor={cfg.name} style={{ fontWeight: 500, marginBottom: 2 }}>

              {cfg.label}

              {cfg.required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}

            </label>

            <Comp

              value={watch(cfg.name)}

              onChange={(val: any) => setValue(cfg.name, val)}

              target={target}

              isMulti={isMulti}

              disabled={cfg.disabled}

              placeholder={cfg.placeholder}

              displayField={displayField}

              apiUrl={apiUrl}

            />

            {cfg.description && (

              <span style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{cfg.description}</span>

            )}

            {errorMsg && (

              <span style={{ color: "#d32f2f", fontSize: 13, marginTop: 2 }}>{errorMsg}</span>

            )}

          </div>

        );

      }

 

      // --- MULTI-SELECT FIELDS ---

      // if (cfg.type === "MultiSelect" && cfg.props?.options) {

      //   import("@k2600x/design-system/MultiSelect").then(({ default: MultiSelect }) => {

      //     // Ensure value is always an array

      //     const value = Array.isArray(watch(cfg.name)) ? watch(cfg.name) : [];

      //     return (

      //       <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, height: '100%' }}>

      //         <label htmlFor={cfg.name} style={{ fontWeight: 500, marginBottom: 2 }}>

      //           {cfg.label}

      //           {cfg.required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}

      //         </label>

      //         <MultiSelect

      //           options={cfg.props?.options}

      //           defaultValue={value}

      //           onChange={(e: any) => setValue(cfg.name, e)}

      //         />

      //         {cfg.description && (

      //           <span style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{cfg.description}</span>

      //         )}

      //         {errorMsg && (

      //           <span style={{ color: "#d32f2f", fontSize: 13, marginTop: 2 }}>{errorMsg}</span>

      //         )}

      //       </div>

      //     );

      //   });

      // }

 

      // --- MEDIA/FILE FIELDS ---

      if (cfg.type === "media" || cfg.type === "file") {

        // Defensive: always pass an array to StrapiMediaUpload

        // UI: Solo mostrar el label una vez y evitar duplicados

        return (

          <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, height: '100%' }}>

            <label htmlFor={cfg.name} style={{ fontWeight: 500, marginBottom: 2 }}>

              {cfg.label}

              {cfg.required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}

            </label>

            <Controller
              name={cfg.name}
              control={control}
              render={({ field }) => {
                let safeValue = field.value;
                if (!Array.isArray(safeValue)) {
                  if (safeValue == null) safeValue = [];
                  else safeValue = [safeValue];
                }
                return (
                  <StrapiMediaUpload
                    value={safeValue}
                    onChange={field.onChange}
                    multiple={cfg.props?.multiple}
                    accept={cfg.props?.accept}
                    maxSize={cfg.props?.maxSize}
                    disabled={cfg.disabled}
                    autoUpdate={
                      formContext?.collection && formContext?.documentId
                        ? {
                            collection: formContext.collection,
                            documentId: formContext.documentId,
                            fieldName: cfg.name,
                          }
                        : undefined
                    }
                    // No label aquí para evitar duplicados
                  />
                );
              }}
            />

            {cfg.description && (
              <span style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{cfg.description}</span>
            )}

            {errorMsg && (
              <span style={{ color: "#d32f2f", fontSize: 13, marginTop: 2 }}>{errorMsg}</span>
            )}

          </div>

        );

      }

 

      // --- NUMBER FIELDS ---

      if (cfg.type === "number") {

        return (

          <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, height: '100%' }}>

            <label htmlFor={cfg.name} style={{ fontWeight: 500, marginBottom: 2 }}>

              {cfg.label}

              {cfg.required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}

            </label>

            <input

              type="number"

              id={cfg.name}

              value={watch(cfg.name)}

              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(cfg.name, e.target.value === "" ? undefined : Number(e.target.value))}

              step="any"

            />

            {cfg.description && (
              <span style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{cfg.description}</span>
            )}

            {errorMsg && (
              <span style={{ color: "#d32f2f", fontSize: 13, marginTop: 2 }}>{errorMsg}</span>
            )}

          </div>

        );

      }

 

      // --- DATE/DATETIME FIELDS ---

      if (["date", "datetime"].includes(cfg.type)) {

        return (

          <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, height: '100%' }}>

            <label htmlFor={cfg.name} style={{ fontWeight: 500, marginBottom: 2 }}>

              {cfg.label}

              {cfg.required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}

            </label>

            <Comp

              id={cfg.name}

              type={cfg.props?.type}

              required={cfg.required}

              disabled={cfg.disabled}

              variant={cfg.variant}

              {...register(cfg.name)}

              control={control}

            />

            {cfg.description && (
              <span style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{cfg.description}</span>
            )}

            {errorMsg && (
              <span style={{ color: "#d32f2f", fontSize: 13, marginTop: 2 }}>{errorMsg}</span>
            )}

          </div>

        );

      }

 

      // --- BOOLEAN FIELDS ---
      if (cfg.type === "boolean") {
        return (
          <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, height: '100%' }}>
            <label htmlFor={cfg.name} style={{ fontWeight: 500, marginBottom: 2 }}>
              {cfg.label}
              {cfg.required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}
            </label>
            <Controller
              name={cfg.name}
              control={control}
              render={({ field }) => (
                <Comp
                  {...(cfg.props || {})}
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  disabled={cfg.disabled}
                  id={cfg.name}
                />
              )}
            />
            {cfg.description && (
              <span style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{cfg.description}</span>
            )}
            {errorMsg && (
              <span style={{ color: "#d32f2f", fontSize: 13, marginTop: 2 }}>{errorMsg}</span>
            )}
          </div>
        );
      }

      // --- DEFAULT: STRING, TEXT, ETC. ---

      return (

        <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, height: '100%' }}>

          <label htmlFor={cfg.name} style={{ fontWeight: 500, marginBottom: 2 }}>

            {cfg.label}

            {cfg.required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}

          </label>

          <Comp

            id={cfg.name}

            required={cfg.required}

            disabled={cfg.disabled}

            variant={cfg.variant}

            {...(cfg.props || {})}

            {...register(cfg.name)}

            control={control}

          />

          {cfg.description && (
            <span style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{cfg.description}</span>
          )}

          {errorMsg && (
            <span style={{ color: "#d32f2f", fontSize: 13, marginTop: 2 }}>{errorMsg}</span>
          )}

        </div>

      );

    });

  }

 

  // Return form instance and renderer

  // form.handleSubmit can be used to register a submit handler elsewhere if needed

  return {

    form,

    renderFields,

    fieldsConfig,

  };

}