"use client";

import { Fragment, useEffect, useState } from "react";
import { useStrapiCollection } from "../../hooks/useStrapiCollection";
import { Loader } from "@/components/ui/loader";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import GroupBreakdownRow from "./GroupBreakdownRow"; // Ya migrado antes

interface MonthData {
  category: string;
  category_id: string;
  months: number[];
  total: number;
}

interface YearlyReportTableProps {
  year: number;
}

export default function YearlyReportTable({ year }: YearlyReportTableProps) {
  const {
    data: report,
    isLoading: reportLoading,
    error: reportError,
  } = useStrapiCollection<MonthData[]>("expenses/yearly-report", {
    filters: { year },
  });

  const [tableData, setTableData] = useState<MonthData[]>([]);
  const [expandedCells, setExpandedCells] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    if (Array.isArray(report)) {
      //@ts-ignore
      setTableData(report);
    }
  }, [report]);

  function makeCellId(category: string, monthIndex: number) {
    return `${category}-${monthIndex}`;
  }

  function toggleExpand(category: string, monthIndex: number) {
    const cellId = makeCellId(category, monthIndex);
    setExpandedCells((prev) => ({
      ...prev,
      [cellId]: !prev[cellId],
    }));
  }

  return (
    <div className="space-y-4 border p-4 rounded-md bg-white">
      <div className="font-semibold">Yearly Expense Report - {year}</div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              {[
                "Enero",
                "Febrero",
                "Marzo",
                "Abril",
                "Mayo",
                "Junio",
                "Julio",
                "Agosto",
                "Septiembre",
                "Octubre",
                "Noviembre",
                "Diciembre",
              ].map((month) => (
                <TableHead key={month}>{month}</TableHead>
              ))}
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportLoading ? (
              <TableRow>
                <TableCell colSpan={14} className="text-center">
                  <Loader />
                </TableCell>
              </TableRow>
            ) : reportError ? (
              <TableRow>
                <TableCell colSpan={14} className="text-center text-red-600">
                  Error: {reportError.message}
                </TableCell>
              </TableRow>
            ) : tableData.length > 0 ? (
              tableData.map(({ category, category_id, months, total }) => (
                <Fragment key={category}>
                  {/* Fila principal */}
                  <TableRow>
                    <TableCell className="font-semibold">{category}</TableCell>

                    {months.map((amount, monthIndex) => {
                      const cellId = makeCellId(category, monthIndex);
                      const isExpanded = expandedCells[cellId];

                      return (
                        <TableCell
                          key={monthIndex}
                          onClick={() => toggleExpand(category, monthIndex)}
                          className="cursor-pointer relative"
                        >
                          {amount === 0 ? "-" : amount.toFixed(2)}
                          {isExpanded && (
                            <div className="absolute top-0 right-0 bg-gray-200 text-xs px-1">
                              ▲
                            </div>
                          )}
                        </TableCell>
                      );
                    })}

                    <TableCell className="font-semibold">
                      {total.toFixed(2)}
                    </TableCell>
                  </TableRow>

                  {/* Sub-filas (GroupBreakdownRow) */}
                  {months.map((_, monthIndex) => {
                    const cellId = makeCellId(category, monthIndex);
                    const isExpanded = expandedCells[cellId];

                    return (
                      <GroupBreakdownRow
                        key={`${cellId}-breakdown`}
                        category={category}
                        categoryId={category_id}
                        monthIndex={monthIndex}
                        year={year}
                        isExpanded={isExpanded}
                        colSpan={14}
                      />
                    );
                  })}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={14} className="text-center">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
