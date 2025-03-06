"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "react-datepicker/dist/react-datepicker.css";
import { Controller } from "react-hook-form";
import { useClientForm } from "@/hooks/clients/useClientForm";
import { Client } from "./ClientTable";

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  client?: Client;
}

export default function ClientModal({ open, onClose, client }: ClientModalProps) {
  // Llamamos al hook que encapsula la lógica del formulario
  const { control, handleSubmit, isEditMode } = useClientForm({
    client,
    open,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Invoice" : "Crear Invoice"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input placeholder="Nombre" {...field} />}
          />
         
  
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
           
            <Button type="submit">{isEditMode ? "Actualizar" : "Crear"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
