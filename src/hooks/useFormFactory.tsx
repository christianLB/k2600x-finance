// ─────────────────────────────────────────────────────────────────────────────

// useFormFactory hook

// - Initializes RHF with Zod schema + defaultValues

// - Wraps children in FormProvider

// - Renders fields by delegating to components with unified interface

// ─────────────────────────────────────────────────────────────────────────────

 

import { useForm, FieldValues, FormProvider as RHFFormProvider } from "react-hook-form";

import { z, ZodSchema } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";

import React from "react";
 

export type FieldConfig<T> = {

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

 

function useRelationOptions(target: string) {

  // Fetches options from /api/{target} endpoint

  const [options, setOptions] = React.useState<{ label: string; value: any }[]>([]);

  React.useEffect(() => {

    if (!target) return;

    // Extract collection name from target (e.g., api::invoice.invoice -> invoice)

    const match = target.match(/([^.]+)$/);

    const collection = match ? match[1] : target;

    fetch(`/api/${collection}`)

      .then(res => res.json())

      .then(data => {

        if (Array.isArray(data.data)) {

          setOptions(

            data.data.map((item: any) => ({

              label: item.attributes?.displayName || item.attributes?.name || item.id || "(no label)",

              value: item.id,

            }))

          );

        }

      })

      .catch(() => setOptions([]));

  }, [target]);

  return options;

}

 

export function useFormFactory<T extends FieldValues = any>(

  schema: ZodSchema<T>,

  defaultValues: Record<string, any>,

  fieldsConfig: FieldConfig<T>[],

  relationOptionsMap?: Record<string, { label: string; value: any }[]>

) {

  const form = useForm<T>({ resolver: zodResolver(schema), defaultValues });

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

        const { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } = require("@/components/ui/select");

        return (

          <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 18 }}>

            <label htmlFor={cfg.name} style={{ fontWeight: 500, marginBottom: 2 }}>

              {cfg.label}

              {cfg.required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}

            </label>

            <Select

              value={watch(cfg.name) ?? ""}

              onValueChange={val => setValue(cfg.name, val)}

              required={cfg.required}

              disabled={cfg.disabled}

            >

              <SelectTrigger id={cfg.name} name={cfg.name} placeholder={cfg.placeholder} />

              <SelectContent>

                {cfg.props.options.map((opt: any) => (

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

      if (cfg.type === "relation" && cfg.props?.target) {

        const relOptions = relationOptionsMap?.[cfg.name] || [];

        return (

          <div key={cfg.name} style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 18 }}>

            <label htmlFor={cfg.name} style={{ fontWeight: 500, marginBottom: 2 }}>

              {cfg.label}

              {cfg.required && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}

            </label>

            <Comp

              id={cfg.name}

              name={cfg.name}

              options={relOptions}

              placeholder={cfg.placeholder}

              required={cfg.required}

              disabled={cfg.disabled}

              variant={cfg.variant}

              isMulti={cfg.props.isMulti}

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

              name={cfg.name}

              type="file"

              multiple={cfg.props.multiple}

              accept={cfg.props.accept}

              required={cfg.required}

              disabled={cfg.disabled}

              variant={cfg.variant}

              onChange={e => setValue(cfg.name, cfg.props.multiple ? Array.from(e.target.files) : e.target.files?.[0])}

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

            <Comp

              id={cfg.name}

              name={cfg.name}

              type="number"

              min={cfg.props?.min}

              max={cfg.props?.max}

              step={cfg.props?.step}

              placeholder={cfg.placeholder}

              required={cfg.required}

              disabled={cfg.disabled}

              variant={cfg.variant}

              {...register(cfg.name, { valueAsNumber: true })}

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

              name={cfg.name}

              type={cfg.props?.type}

              placeholder={cfg.placeholder}

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

            name={cfg.name}

            placeholder={cfg.placeholder}

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