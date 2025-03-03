"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash, Check, X } from "lucide-react";
import { Popover, Transition } from "@headlessui/react";
import { format } from "date-fns";
import { useStrapiCollection } from "../../hooks/useStrapiCollection";

interface Client {
  id: number;
  name: string;
}

interface Income {
  id: number;
  amount: number;
  name: string;
  client: Client;
  currency: string;
  date: string;
  documentId: string;
}

export default function IncomeTable() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedIncomes, setSelectedIncomes] = useState(new Set<string>());
  const [editingDate, setEditingDate] = useState<{
    id: string;
    date: Date | null;
  } | null>(null);

  const {
    data: incomes = [],
    isLoading,
    update,
    delete: deleteIncome,
  } = useStrapiCollection("incomes", {
    pagination: { page, pageSize },
  });

  const handleDelete = async (documentId: string) => {
    try {
      await deleteIncome(documentId);
      toast.success("Registro eliminado exitosamente");
      setSelectedIncomes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    } catch {
      toast.error("Error al eliminar el registro");
    }
  };

  const handleUpdateDate = async (documentId: string, date: Date | null) => {
    if (!date) return;
    try {
      await update({ documentId, updatedData: { date } });
      toast.success("Fecha actualizada");
      setEditingDate(null);
    } catch {
      toast.error("Error al actualizar la fecha");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIncomes(
      checked
        ? new Set(incomes.map((income: any) => income.documentId))
        : new Set()
    );
  };

  return (
    <div className="space-y-4 border p-4 rounded-md bg-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={selectedIncomes.size === incomes.length}
            onCheckedChange={handleSelectAll}
          />
          <span>Seleccionar Todos</span>
        </div>

        <span className="font-semibold">Income List</span>

        <Button
          variant="destructive"
          size="sm"
          disabled={selectedIncomes.size === 0}
          onClick={() => {
            selectedIncomes.forEach((id) => handleDelete(id));
            setSelectedIncomes(new Set());
          }}
        >
          <Trash className="w-4 h-4 mr-2" />
          Eliminar Seleccionados
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border"></th>
              <th className="p-2 border">Fecha</th>
              <th className="p-2 border">Cliente</th>
              <th className="p-2 border">Monto</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center">
                  Cargando...
                </td>
              </tr>
            ) : (
              incomes.map((income: any) => (
                <tr key={income.documentId}>
                  <td className="p-2 border">
                    <Checkbox
                      checked={selectedIncomes.has(income.documentId)}
                      onCheckedChange={(checked) => {
                        const newSet = new Set(selectedIncomes);
                        if (checked) newSet.add(income.documentId);
                        else newSet.delete(income.documentId);
                        setSelectedIncomes(newSet);
                      }}
                    />
                  </td>

                  <td className="p-2 border">
                    <Popover className="relative">
                      <Popover.Button className="underline text-blue-500">
                        {format(new Date(income.date), "dd/MM/yyyy")}
                      </Popover.Button>

                      <Transition
                        enter="transition ease-out duration-100"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <Popover.Panel className="absolute z-50 mt-1 bg-white border rounded-md shadow-lg">
                          <input
                            type="date"
                            className="border p-2 rounded-md"
                            value={
                              editingDate?.id === income.documentId &&
                              editingDate?.date
                                ? format(editingDate.date, "yyyy-MM-dd")
                                : income.date
                            }
                            onChange={(e) =>
                              setEditingDate({
                                id: income.documentId,
                                date: new Date(e.target.value),
                              })
                            }
                          />
                          <div className="flex justify-end space-x-2 p-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleUpdateDate(
                                  income.documentId,
                                  editingDate?.date || null
                                )
                              }
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setEditingDate(null)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </Popover.Panel>
                      </Transition>
                    </Popover>
                  </td>

                  <td className="p-2 border">{income.client?.name}</td>
                  <td className="p-2 border">
                    {income.amount} {income.currency}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Anterior
        </Button>
        <span className="px-4">Página {page}</span>
        <Button size="sm" onClick={() => setPage(page + 1)}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
