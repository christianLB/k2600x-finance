// ─────────────────────────────────────────────────────────────────────────────

// useFormFactory hook

// - Initializes RHF with Zod schema + defaultValues

// - Wraps children in FormProvider

// - Renders fields by delegating to components with unified interface

// ─────────────────────────────────────────────────────────────────────────────

 

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import React from "react";
 

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

        import("@/components/ui/select").then(({ Select, SelectTrigger, SelectContent, SelectItem }) => {

          // Do NOT add placeholder as an option; use placeholder prop only

          const options = cfg.props?.options;

          // Ensure value is always a scalar (string/number/null/undefined) for single select

          let value = watch(cfg.name);

          if (value && typeof value === 'object' && 'value' in value) value = value.value;

          if (Array.isArray(value)) value = value.length ? value[0] : undefined;

          if (
            value === undefined ||
            value === null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0)
          ) value = undefined;

          // Find the selected option label for display

          const selectedOption = options?.find((opt: any) => opt.value === value);

          return (

            <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 18 }}>

              <label htmlFor={cfg.name} style={{ fontWeight: 500, marginBottom: 2 }}>

                {cfg.label}

                {cfg.required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}

              </label>

              <Select

                value={value}

                onValueChange={(e: any) => setValue(cfg.name, e)}

              >

                <SelectTrigger>

                  {/* Show selected label or placeholder */}

                  {selectedOption ? selectedOption.label : (cfg.placeholder || "(Selecciona...)")}

                </SelectTrigger>

                <SelectContent>

                  {options?.map((opt: any) => (

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

        });

      }

 

      // --- RELATION FIELDS ---

      if (cfg.type === "relation" && cfg.props?.target) {

        import("@/components/admin/StrapiRelationField").then(({ default: StrapiRelationField }) => {

          // Normalize value for single/multi

          let value = watch(cfg.name);

          // For multi, always ensure array

          if (cfg.props?.isMulti) {

            value = Array.isArray(value) ? value : [];

          } else {

            if (value && typeof value === 'object' && 'value' in value) value = value.value;

            if (Array.isArray(value)) value = value.length ? value[0] : undefined;

            if (
              value === undefined ||
              value === null ||
              value === "" ||
              (Array.isArray(value) && value.length === 0)
            ) value = undefined;

          }

          return (

            <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 18 }}>

              <label htmlFor={cfg.name} style={{ fontWeight: 500, marginBottom: 2 }}>

                {cfg.label}

                {cfg.required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}

              </label>

              <StrapiRelationField

                name={cfg.name}

                value={value}

                onChange={(e: any) => setValue(cfg.name, e)}

                target={cfg.props?.target}

                isMulti={cfg.props?.isMulti}

                disabled={cfg.disabled}

                displayField={cfg.props?.displayField || "displayName"}

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

 

      // --- MULTI-SELECT FIELDS ---

      if (cfg.type === "multi-select" && cfg.props?.options) {

        import("@/components/ui/multi-select").then(({ default: MultiSelect }) => {

          // Ensure value is always an array

          const value = Array.isArray(watch(cfg.name)) ? watch(cfg.name) : [];

          return (

            <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 18 }}>

              <label htmlFor={cfg.name} style={{ fontWeight: 500, marginBottom: 2 }}>

                {cfg.label}

                {cfg.required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}

              </label>

              <MultiSelect

                options={cfg.props?.options}

                defaultValue={value}

                onChange={(e: any) => setValue(cfg.name, e)}

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

 

      // --- MEDIA/FILE FIELDS ---

      if (cfg.type === "media") {

        return (

          <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 18 }}>

            <label htmlFor={cfg.name} style={{ fontWeight: 500, marginBottom: 2 }}>

              {cfg.label}

              {cfg.required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}

            </label>

            <Comp

              id={cfg.name}

              type="file"

              multiple={cfg.props?.multiple}

              accept={cfg.props?.accept}

              required={cfg.required}

              disabled={cfg.disabled}

              variant={cfg.variant}

              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const files = e.target.files;
                setValue(cfg.name, cfg.props?.multiple ? (files ? Array.from(files) : []) : files?.[0] ?? null);
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

          <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 18 }}>

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

          <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 18 }}>

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

 

      // --- DEFAULT: STRING, TEXT, BOOLEAN, ETC. ---

      return (

        <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 18 }}>

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