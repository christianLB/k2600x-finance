import { z } from 'zod';
import strapi from './strapi';
import { AccountSchema } from '@/modules/finance-dashboard/schemas/accountSchemas';

const AccountsSchema = z.array(AccountSchema);

export type Account = z.infer<typeof AccountSchema>;

export async function fetchAccounts(): Promise<Account[]> {
  const res = await strapi.post({ method: 'GET', collection: 'accounts' });
  return AccountsSchema.parse(res.data);
}
