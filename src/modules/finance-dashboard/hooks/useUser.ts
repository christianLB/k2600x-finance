import { useState, useEffect } from 'react';
import { strapiService } from '@/services/strapiService';
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
}).passthrough();

export type User = z.infer<typeof UserSchema>;

const ResponseSchema = z.object({ user: UserSchema.optional() });

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    strapiService
      .getCollection('me')
      .then((res) => {
        const parsed = ResponseSchema.parse(res);
        setUser(parsed.user ?? null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
