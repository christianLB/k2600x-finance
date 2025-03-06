// IncomeTable.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Popover, Transition } from "@headlessui/react";
import { format } from "date-fns";
import { StrapiTable, ColumnDefinition } from "@/components/tables/StrapiTable";

interface Income {
  documentId: string;
  id: number;
  date: string;
  client: { name: string };
  amount: number;
  currency: string;
}

export default function IncomeTable() {
  const [editingDate, setEditingDate] = useState<{ id: string; date: Date | null } | null>(null);
  
  const columns: ColumnDefinition<Income>[] = [
    {
      header: "Fecha",
      cell: (income) => (
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
            <Popover.Panel className="absolute z-50 mt-1 bg-white border rounded-md shadow-lg p-2">
              <input
                type="date"
                className="border p-2 rounded-md"
                value={
                  editingDate?.id === income.documentId && editingDate?.date
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
              <div className="flex justify-end space-x-2 mt-2">
                {/* <Button
                  size="sm"
                  onClick={() =>
                    editingDate && editingDate.id === income.documentId
                      ? handleUpdateDate(income.documentId, editingDate.date)
                      : null
                  }
                >
                  <Check className="w-4 h-4" />
                </Button> */}
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
      header: "Cliente",
      cell: (income) => income.client?.name || "Sin cliente",
    },
    {
      header: "Monto",
      cell: (income) => {
        return `${income.amount.toFixed(2)} ${income.currency}`;
      },
    },
  ];

  // // Función para actualizar la fecha (la misma que en el popover)
  // const handleUpdateDate = async (documentId: string, date: Date | null) => {
  //   if (!date) return;
  //   try {
  //     // Llamada a la mutación update a través de useStrapiCollection
  //     await updateIncomeDate(documentId, date);
  //     toast.success("Fecha actualizada");
  //     setEditingDate(null);
  //     refetch();
  //   } catch {
  //     toast.error("Error al actualizar la fecha");
  //   }
  // };

  return (
      <StrapiTable<Income>
        collection="incomes"
        title="Listado de Incomes"
        columns={columns}
      />
  );
}
