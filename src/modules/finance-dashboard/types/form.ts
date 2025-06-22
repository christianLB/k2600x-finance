import { z } from 'zod';
import type { DynamicField } from '../components/DynamicForm';

export interface FormConfig<T extends Record<string, any>> {
  schema: z.ZodType<T>;
  fields: DynamicField[];
  defaultValues: Partial<T>;
}
