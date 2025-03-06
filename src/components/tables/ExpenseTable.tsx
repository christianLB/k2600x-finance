"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Popover, Transition } from "@headlessui/react";
import { format } from "date-fns";
import { StrapiTable, ColumnDefinition } from "@/components/tables/StrapiTable";
import { useStrapiCollection } from "@/hooks/useStrapiCollection";

interface Expense {
  documentId: string;
  id: number;
  date: string;
  name: string;
  amount: number;
  currency: string;
  expense_category: { id: number; name: string } | null;
  expense_group: { id: number; name: string } | null;
  needsRevision: boolean;
}

export default function ExpenseTable() {
  const [editingDate, setEditingDate] = useState<{ id: string; date: Date | null } | null>(null);

  // Get categories and groups (for selects)
  const { data: categories = [] } = useStrapiCollection("expense-categories");
  const { data: groups = [] } = useStrapiCollection("expense-groups");

  // Get expenses via our generic hook
  const {
    refetch,
    update,
  } = useStrapiCollection<Expense>("expenses", {
    pagination: { page: 1, pageSize: 10 },
  });

  const handleUpdateDate = async (documentId: string, date: Date | null) => {
    if (!date) return;
    try {//@ts-ignore
      await update({ documentId, updatedData: { date } });
      toast.success("Fecha actualizada");
      setEditingDate(null);
      refetch();
    } catch {
      toast.error("Error al actualizar la fecha");
    }
  };

  // Define columns for expenses
  const columns: ColumnDefinition<Expense>[] = [
    {
      header: "Fecha",
      cell: (expense) => (
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
            <Popover.Panel className="absolute z-50 mt-1 bg-white border rounded-md shadow-lg p-2">
              <input
                type="date"
                className="border p-2 rounded-md"
                value={
                  editingDate?.id === expense.documentId && editingDate?.date
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
              <div className="flex justify-end space-x-2 mt-2">
                <Button
                  size="sm"
                  onClick={() =>
                    handleUpdateDate(expense.documentId, editingDate?.date || null)
                  }
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setEditingDate(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Popover.Panel>
          </Transition>
        </Popover>
      ),
    },
    {
      header: "Descripción",
      cell: (expense) => expense.name,
    },
    {
      header: "Monto",
      cell: (expense) => `${expense.amount} ${expense.currency}`,
    },
    {
      header: "Categoría",
      cell: (expense) => (
        <select className="border rounded p-1 w-full" defaultValue={expense.expense_category?.id || ""}>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: "Grupo",
      cell: (expense) => (
        <select className="border rounded p-1 w-full" defaultValue={expense.expense_group?.id || ""}>
          {groups.map((grp: any) => (
            <option key={grp.id} value={grp.id}>
              {grp.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      header: "Revisar",
      cell: (expense) => (
        <div className="flex justify-center">
          <Switch checked={expense.needsRevision} />
        </div>
      ),
    },
  ];

  return (
      <StrapiTable<Expense>
        collection="expenses"
        title="Listado de Gastos"
        columns={columns}
      />
  );
}
