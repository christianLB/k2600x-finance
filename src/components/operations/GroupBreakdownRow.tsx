"use client";
import React, { useEffect, useState } from "react";
import { Loader } from "@k2600x/design-system";
import { SmartDataTable as Table, PaginationState } from "@/modules/finance-dashboard/components/SmartDataTable";
import { ColumnDef } from "@tanstack/react-table";
import fetchMonthlyGroupReport from "@/lib/fetchMonthlyGroupReport";

interface GroupData {
  group_id: number;
  tag_name: string;
  total_amount: number;
}

interface GroupBreakdownRowProps {
  category: string;
  parent_tag_id: number;
  monthIndex: number;
  year: number;
  isExpanded: boolean;
  colSpan?: number;
}

export default function GroupBreakdownRow({
  category,
  parent_tag_id,
  monthIndex,
  year,
  isExpanded,
  colSpan = 14,
}: GroupBreakdownRowProps) {
  console.log(isExpanded)
  const realMonth = String(monthIndex + 1).padStart(2, "0");

  const [groupData, setTableData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data } = await fetchMonthlyGroupReport(year, realMonth, parent_tag_id);
        setTableData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (isExpanded) {
      fetchData();
    }
  }, [year, realMonth, parent_tag_id, isExpanded]);

  const columns: ColumnDef<GroupData>[] = [
    {
      accessorKey: 'tag_name',
      header: 'Grupo',
      cell: ({ row }) => row.original.tag_name || "Sin nombre"
    },
    {
      accessorKey: 'total_amount',
      header: 'Total',
      cell: ({ row }) => Number(row.original.total_amount).toFixed(2)
    }
  ];

  if (!isExpanded) {
    return null;
  }

  return (
    <tr>
      <td colSpan={colSpan} className="bg-card p-4 transition-colors">
        {loading && <div className="flex justify-center p-2"><Loader /></div>}
        {error && (
          <div className="text-destructive text-center p-2">
            Error al cargar grupos: {error}
          </div>
        )}
        {!loading && !error && groupData && (
          <div className="space-y-2">
            <strong className="block mb-2">
              Breakdown para {category} / Mes {monthIndex + 1}
            </strong>
            {groupData.length === 0 ? (
              <div className="mt-1 italic text-muted-foreground">No hay grupos</div>
            ) : (
              <div className="overflow-x-auto">
                <Table
                  data={groupData as any}
                  columns={columns as any}
                  pagination={{ totalItems: groupData.length, itemsPerPage: groupData.length, currentPage: 1 } as PaginationState}
                  onEdit={() => {}}
                  onPageChange={() => {}}
                  collection="group-breakdown"
                />
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
