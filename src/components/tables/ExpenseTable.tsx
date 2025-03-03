"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Trash, Check, X } from "lucide-react";
import { Popover, Transition } from "@headlessui/react";
import { format } from "date-fns";
import { useStrapiCollection } from "../../hooks/useStrapiCollection";

// interface ExpenseCategory {
//   id: number;
//   name: string;
// }
// interface ExpenseGroup {
//   id: number;
//   name: string;
// }
// interface Expense {
//   documentId: string;
//   amount: number;
//   currency: string;
//   name: string;
//   expense_category: ExpenseCategory | null;
//   expense_group: ExpenseGroup | null;
//   date: string;
//   needsRevision: boolean;
//}

export default function ExpenseTable() {
  const [page] = useState(1);
  const pageSize = 10;
  const [selectedExpenses, setSelectedExpenses] = useState(new Set<string>());
  const [editingDate, setEditingDate] = useState<{
    id: string;
    date: Date | null;
  } | null>(null);

  const { data: categories = [] } = useStrapiCollection("expense-categories");
  const { data: groups = [] } = useStrapiCollection("expense-groups");
  const {
    data: expenses = [],
    update,
    delete: deleteExpense,
  } = useStrapiCollection("expenses", {
    pagination: { page, pageSize },
  });

  const handleDelete = async (documentId: string) => {
    try {
      await deleteExpense(documentId);
      toast.success("Registro eliminado exitosamente");
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

  return (
    <div className="space-y-4 border p-4 rounded-md bg-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={selectedExpenses.size === expenses.length}
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedExpenses(
                  new Set(expenses.map((exp: any) => exp.documentId))
                );
              } else {
                setSelectedExpenses(new Set());
              }
            }}
          />
          <span>Seleccionar Todos</span>
        </div>

        <span className="font-semibold">Lista de Gastos</span>

        <Button
          variant="destructive"
          size="sm"
          disabled={selectedExpenses.size === 0}
          onClick={() => {
            selectedExpenses.forEach((id) => handleDelete(id));
            setSelectedExpenses(new Set());
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
              <th className="p-2 border">Descripción</th>
              <th className="p-2 border">Monto</th>
              <th className="p-2 border">Categoría</th>
              <th className="p-2 border">Grupo</th>
              <th className="p-2 border">Revisar</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense: any) => (
              <tr key={expense.documentId}>
                <td className="p-2 border">
                  <Checkbox
                    checked={selectedExpenses.has(expense.documentId)}
                    onCheckedChange={(checked) => {
                      const newSet = new Set(selectedExpenses);
                      if (checked) newSet.add(expense.documentId);
                      else newSet.delete(expense.documentId);
                      setSelectedExpenses(newSet);
                    }}
                  />
                </td>

                <td className="p-2 border">
                  <Popover className="relative">
                    <Popover.Button className="underline text-blue-500">
                      {format(new Date(expense.date), "dd/MM/yyyy")}
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
                            editingDate?.id === expense.documentId &&
                            editingDate?.date
                              ? format(editingDate.date, "yyyy-MM-dd")
                              : expense.date
                          }
                          onChange={(e) =>
                            setEditingDate({
                              id: expense.documentId,
                              date: new Date(e.target.value),
                            })
                          }
                        />
                        <div className="flex justify-end space-x-2 p-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateDate(
                                expense.documentId,
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

                <td className="p-2 border">{expense.name}</td>
                <td className="p-2 border">
                  {expense.amount} {expense.currency}
                </td>
                <td className="p-2 border">
                  <select className="border rounded p-1 w-full">
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 border">
                  <select className="border rounded p-1 w-full">
                    {groups.map((group: any) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 border text-center">
                  <Switch checked={expense.needsRevision} />
                </td>
                <td className="p-2 border">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(expense.documentId)}
                  >
                    <Trash className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
