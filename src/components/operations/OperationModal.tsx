"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";

export interface OperationModalProps {
  open: boolean;
  onClose: () => void;
  operation: any; // For update only, operation is required
  onOperationUpdated?: (operation: any) => void;
}

const origenOptions = [
  { value: "automatica-gasto", label: "Automática Gasto" },
  { value: "automatica-transferencia", label: "Automática Transferencia" },
  { value: "manual", label: "Manual" },
];

const estadoOptions = [
  { value: "pendiente", label: "Pendiente" },
  { value: "procesado", label: "Procesado" },
  { value: "conciliado", label: "Conciliado" },
  { value: "revisar", label: "Revisar" },
];

export default function OperationModal({
  open,
  onClose,
  operation,
  onOperationUpdated,
}: OperationModalProps) {
  // Initialize form with all operation fields
  
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      fechaMovimiento: new Date(operation?.fechaMovimiento),
      fechaValor: new Date(operation?.fechaValor),
      monto: operation?.monto,
      moneda: operation?.moneda,
      descripcion: operation?.descripcion,
      cuenta: operation?.cuenta,
      titularCuenta: operation?.titularCuenta,
      concepto: operation?.concepto,
      observaciones: operation?.observaciones,
      origen: operation?.origen,
      posibleDuplicado: operation?.posibleDuplicado,
      estadoConciliacion: operation?.estadoConciliacion,
      procesadoPorAutomatizacion: operation?.procesadoPorAutomatizacion,
      cuentaDestino: operation?.cuentaDestino,
      referenciaBancaria: operation?.referenciaBancaria,
      comision: operation?.comision,
      justificante: operation?.justificante,
    },
  });

  const onSubmit = (data: any) => {
    // Here add your update mutation or API call.
    // For example, call onOperationUpdated callback if provided.
    if (onOperationUpdated) {
      onOperationUpdated({ ...operation, ...data });
    }
    onClose();
    reset();
  };

  if (!operation) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Operación</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Fecha Movimiento */}
          <Controller
            name="fechaMovimiento"
            control={control}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={field.onChange}
                dateFormat="yyyy-MM-dd"
                className="w-full border rounded-md p-2"
              />
            )}
          />
          {/* Fecha Valor */}
          <Controller
            name="fechaValor"
            control={control}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={field.onChange}
                dateFormat="yyyy-MM-dd"
                placeholderText="Fecha Valor"
                className="w-full border rounded-md p-2"
              />
            )}
          />
          {/* Monto */}
          <Controller
            name="monto"
            control={control}
            render={({ field }) => (
              <Input placeholder="Monto" type="number" {...field} />
            )}
          />
          {/* Moneda */}
          <Controller
            name="moneda"
            control={control}
            render={({ field }) => <Input placeholder="Moneda" {...field} />}
          />
          {/* Descripción */}
          <Controller
            name="descripcion"
            control={control}
            render={({ field }) => (
              <Input placeholder="Descripción" {...field} />
            )}
          />
          {/* Cuenta */}
          <Controller
            name="cuenta"
            control={control}
            render={({ field }) => <Input placeholder="Cuenta" {...field} />}
          />
          {/* Titular Cuenta */}
          <Controller
            name="titularCuenta"
            control={control}
            render={({ field }) => (
              <Input placeholder="Titular de Cuenta" {...field} />
            )}
          />
          {/* Concepto */}
          <Controller
            name="concepto"
            control={control}
            render={({ field }) => <Input placeholder="Concepto" {...field} />}
          />
          {/* Observaciones */}
          <Controller
            name="observaciones"
            control={control}
            render={({ field }) => (
              <Input placeholder="Observaciones" {...field} />
            )}
          />
          {/* Origen */}
          <Controller
            name="origen"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona el origen" />
                </SelectTrigger>
                <SelectContent>
                  {origenOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {/* Estado Conciliacion */}
          <Controller
            name="estadoConciliacion"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  {estadoOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {/* Posible Duplicado */}
          <Controller
            name="posibleDuplicado"
            control={control}
            render={({ field }) => (
              <div className="flex items-center">
                <Input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="mr-2"
                />
                <span>Posible duplicado</span>
              </div>
            )}
          />
          {/* Procesado Por Automatizacion */}
          <Controller
            name="procesadoPorAutomatizacion"
            control={control}
            render={({ field }) => (
              <Input placeholder="Procesado por Automatización" {...field} />
            )}
          />
          {/* Cuenta Destino */}
          <Controller
            name="cuentaDestino"
            control={control}
            render={({ field }) => (
              <Input placeholder="Cuenta Destino" {...field} />
            )}
          />
          {/* Referencia Bancaria */}
          <Controller
            name="referenciaBancaria"
            control={control}
            render={({ field }) => (
              <Input placeholder="Referencia Bancaria" {...field} />
            )}
          />
          {/* Comisión */}
          <Controller
            name="comision"
            control={control}
            render={({ field }) => (
              <Input placeholder="Comisión" type="number" {...field} />
            )}
          />
          {/* Justificante */}
          <Controller
            name="justificante"
            control={control}
            render={({ field }) => (
              <Input
                placeholder="Justificante"
                type="file"
                onChange={(e) =>
                  field.onChange(e.target.files ? e.target.files[0] : null)
                }
              />
            )}
          />
          <div className="mt-4 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                reset();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">Actualizar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export {};
