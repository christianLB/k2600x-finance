import { z } from 'zod';

export const FinanceRecordSchema = z.object({
  id: z.number(),
  name: z.string(),
  amount: z.number(),
});

export type FinanceRecord = z.infer<typeof FinanceRecordSchema>;
