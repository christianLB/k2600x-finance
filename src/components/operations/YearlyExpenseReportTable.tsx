"use client";

import { Fragment, useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import GroupBreakdownRow from "./GroupBreakdownRow";
import fetchYearlyReport from "@/lib/fetchYearlyReport";

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

  return (
    <div className="space-y-4 border p-4 rounded-md bg-white">
      <div className="font-semibold">Yearly Operations Report - {year}</div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoría</TableHead>
              {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((month) => (
                <TableHead key={month}>{month}</TableHead>
              ))}
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={14} className="text-center">
                  <Loader />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={14} className="text-center text-red-600">
                  Error: {error}
                </TableCell>
              </TableRow>
            ) : tableData.length > 0 ? (
              tableData.map(({ category, tag_id, months, total }) => (
                <Fragment key={`${tag_id}-${category}`}>
                  <TableRow>
                    <TableCell className="font-semibold">
                      {category ?? "Sin categoría"}
                    </TableCell>
                    {[...Array(12)].map((_, monthIndex) => {
                      const amount = months[monthIndex] ?? 0;
                      const cellId = makeCellId(tag_id, monthIndex);
                      const isExpanded = expandedCells[cellId];

                      return (
                        <TableCell
                          key={monthIndex}
                          onClick={() => toggleExpand(tag_id, monthIndex)}
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

                  {[...Array(12)].map((_, monthIndex) => {
                    const cellId = makeCellId(tag_id, monthIndex);
                    const isExpanded = expandedCells[cellId];

                    return (
                      <GroupBreakdownRow
                        key={`${cellId}-breakdown`}
                        category={category ?? "Sin categoría"}
                        parent_tag_id={Number(tag_id)}
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
