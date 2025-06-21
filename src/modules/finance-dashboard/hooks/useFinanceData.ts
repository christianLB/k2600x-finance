import { useEffect, useState, useCallback } from 'react';
import { z } from 'zod';
import strapi from '@/services/strapi';
import { FinanceRecordSchema } from '../schemas/financeSchemas';

export const FinanceRecordsSchema = z.array(FinanceRecordSchema);
export type FinanceRecord = z.infer<typeof FinanceRecordSchema>;

export function useFinanceData() {
  const [data, setData] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await strapi.post({ method: 'GET', collection: 'finance-data' });
      const parsed = FinanceRecordsSchema.parse(res.data);
      setData(parsed);
    } catch (err: any) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}
