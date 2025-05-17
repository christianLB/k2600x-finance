"use client";

import React, { Fragment, useEffect, useState } from "react";
import { Loader, Table } from "@k2600x/design-system";
import { ColumnDef } from "@tanstack/react-table";
import GroupBreakdownRow from "./GroupBreakdownRow";
import fetchYearlyReport from "@/lib/fetchYearlyReport";

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

interface MonthData {
  tag_id: number | null;
  category: string | null;
  months: number[];
  total: number;
}

interface YearlyReportTableProps {
  year: number;
}

export default function YearlyReportTable({ year }: YearlyReportTableProps) {
  const [tableData, setTableData] = useState<MonthData[]>([]);
  const [expandedCells, setExpandedCells] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data } = await fetchYearlyReport(year);
        setTableData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [year]);

  function makeCellId(tag: number | null, monthIndex: number) {
    return `${tag ?? "null"}-${monthIndex}`;
  }

  function toggleExpand(tag: number | null, monthIndex: number) {
    const cellId = makeCellId(tag, monthIndex);
    setExpandedCells((prev) => ({
      ...prev,
      [cellId]: !prev[cellId],
    }));
  }

  // Prepare data for the table
  const tableDataWithMonths = tableData.map(item => ({
    ...item,
    category: item.category ?? "Sin categoría",
    months: [...Array(12)].map((_, i) => ({
      value: item.months[i] ?? 0,
      monthIndex: i,
      tag_id: item.tag_id,
    })),
  }));

  // Define columns for the table
  const columns: ColumnDef<typeof tableDataWithMonths[0]>[] = [
    {
      accessorKey: 'category',
      header: 'Categoría',
      cell: ({ row }: { row: { original: typeof tableDataWithMonths[0] } }) => (
        <div className="font-semibold">
          {row.original.category}
        </div>
      ),
    },
    ...MONTHS.map((month, monthIndex) => ({
      accessorKey: `months.${monthIndex}`,
      header: month,
      cell: ({ row }: { row: { original: typeof tableDataWithMonths[0] } }) => {
        const monthData = row.original.months[monthIndex];
        const cellId = makeCellId(monthData.tag_id, monthIndex);
        const isExpanded = expandedCells[cellId];
        const amount = monthData.value;

        return (
          <div 
            onClick={() => toggleExpand(monthData.tag_id, monthIndex)}
            className="cursor-pointer relative"
          >
            {amount === 0 ? "-" : amount.toFixed(2)}
            {isExpanded && (
              <div className="absolute top-0 right-0 bg-gray-200 text-xs px-1">
                ▲
              </div>
            )}
          </div>
        );
      },
    })),
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }: { row: { original: typeof tableDataWithMonths[0] } }) => (
        <div className="font-semibold">
          {row.original.total.toFixed(2)}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 border p-4 rounded-md bg-white">
      <div className="font-semibold">Yearly Operations Report - {year}</div>

      <div className="overflow-x-auto">
        <div className="bg-card rounded-lg shadow-sm p-2 md:p-4 transition-colors">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 p-4">
              Error: {error}
            </div>
          ) : tableData.length > 0 ? (
            <>
              <Table 
                data={tableDataWithMonths} 
                columns={columns}
                className="w-full"
              />
              
              {/* Render expanded rows */}
              {tableData.map(({ category, tag_id }) => (
                [...Array(12)].map((_, monthIndex) => {
                  const cellId = makeCellId(tag_id, monthIndex);
                  const isExpanded = expandedCells[cellId];
                  
                  if (!isExpanded) return null;
                  
                  return (
                    <div key={`${cellId}-breakdown`} className="mt-2">
                      <GroupBreakdownRow
                        category={category ?? "Sin categoría"}
                        parent_tag_id={Number(tag_id)}
                        monthIndex={monthIndex}
                        year={year}
                        isExpanded={isExpanded}
                        colSpan={14}
                      />
                    </div>
                  );
                })
              ))}
            </>
          ) : (
            <div className="text-center p-4">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
