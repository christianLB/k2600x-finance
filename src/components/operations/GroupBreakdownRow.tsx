"use client";
import React, { useEffect, useState } from "react";
//import { useStrapiCollection } from "../../hooks/useStrapiCollection";
import { Loader } from "@/components/ui/loader";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import fetchMonthlyGroupReport from "@/lib/fetchMonthlyGroupReport";

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

  if (!isExpanded) {
    return null;
  }

  return (
    <tr>
      <td colSpan={colSpan} className="bg-card p-4 transition-colors">
        {loading && <Loader />}
        {error && (
          <div className="text-destructive">
            Error al cargar grupos: 
          </div>
        )}
        {!loading && !error && groupData && (
          <>
            <strong>
              Breakdown para {category} / Mes {monthIndex + 1}
            </strong>
            {groupData.length === 0 ? (
              <div className="mt-1 italic text-muted-foreground">No hay grupos</div>
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
                      <TableCell>{g.tag_name || "Sin nombre"}</TableCell>
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
