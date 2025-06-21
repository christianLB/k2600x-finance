"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z, ZodSchema } from "zod";
import {
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Button,
  Label,
} from "@k2600x/design-system";

export type DynamicField = {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox" | "date";
  placeholder?: string;
  options?: { label: string; value: string | number }[];
};

export interface DynamicFormProps<T extends Record<string, any>> {
  schema: ZodSchema<T>;
  fields: DynamicField[];
  defaultValues: Partial<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

export function DynamicForm<T extends Record<string, any>>({
  schema,
  fields,
  defaultValues,
  onSubmit,
}: DynamicFormProps<T>) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  });

  const [success, setSuccess] = React.useState(false);

  const submitHandler = async (values: T) => {
    await onSubmit(values);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="flex flex-col gap-4">
      {fields.map((field) => {
        const errorMsg = (errors as any)[field.name]?.message as string | undefined;
        const commonProps = {
          id: field.name,
          placeholder: field.placeholder,
          ...register(field.name as any),
        };

        return (
          <div key={field.name} className="flex flex-col gap-1">
            <Label htmlFor={field.name}>{field.label}</Label>
            {field.type === "select" ? (
              <Controller
                control={control}
                name={field.name as any}
                render={({ field: ctrl }) => (
                  <Select
                    value={ctrl.value}
                    onValueChange={(val) => ctrl.onChange(val)}
                  >
                    <SelectTrigger>{ctrl.value || field.placeholder}</SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ) : field.type === "checkbox" ? (
              <Controller
                control={control}
                name={field.name as any}
                render={({ field: ctrl }) => (
                  <input
                    type="checkbox"
                    checked={!!ctrl.value}
                    onChange={(e) => ctrl.onChange(e.target.checked)}
                  />
                )}
              />
            ) : (
              <Input type={field.type} {...commonProps} />
            )}
            {errorMsg && <span className="text-destructive text-sm">{errorMsg}</span>}
          </div>
        );
      })}
      {isSubmitSuccessful && success && (
        <p className="text-success">Guardado correctamente</p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar"}
      </Button>
    </form>
  );
}

export default DynamicForm;
