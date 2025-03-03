"use client";
import React from "react";
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

interface GroupBreakdownRowProps {
  category: string;
  categoryId: string;
  monthIndex: number;
  year: number;
  isExpanded: boolean;
  colSpan?: number;
}

export default function GroupBreakdownRow({
  category,
  categoryId,
  monthIndex,
  year,
  isExpanded,
  colSpan = 14,
}: GroupBreakdownRowProps) {
  const realMonth = String(monthIndex + 1).padStart(2, "0");

  const {
    data: groupData,
    isLoading,
    error,
  } = useStrapiCollection("expenses/groups", {
    enabled: isExpanded,
    filters: {
      year,
      month: realMonth,
      category: categoryId,
    },
  });

  if (!isExpanded) {
    return null;
  }

  return (
    <tr>
      <td colSpan={colSpan} className="bg-gray-100 p-4">
        {isLoading && <Loader />}
        {error && (
          <div className="text-red-600">
            Error al cargar grupos: {error.message}
          </div>
        )}
        {!isLoading && !error && groupData && (
          <>
            <strong>
              Breakdown para {category} / Mes {monthIndex + 1}
            </strong>
            {groupData.length === 0 ? (
              <div className="mt-1 italic text-gray-600">No hay grupos</div>
            ) : (
              <Table className="mt-2">
                <TableHeader>
                  <TableRow>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupData.map((g: any) => (
                    <TableRow key={g.group_id}>
                      <TableCell>{g.group_name || "Sin nombre"}</TableCell>
                      <TableCell>{Number(g.total_amount).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </td>
    </tr>
  );
}
