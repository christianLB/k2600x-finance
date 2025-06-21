import { z } from 'zod';

export const AccountSchema = z.object({
  id: z.number(),
  name: z.string(),
  balance: z.number(),
});

export type Account = z.infer<typeof AccountSchema>;
