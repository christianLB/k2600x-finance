import { useMutation } from '@tanstack/react-query';
import { StrapiMutationResponse } from '../types'; // Adjust the import path

interface MutationConfig<T> {
  method: 'POST' | 'PUT' | 'DELETE';
  documentId?: string;
  data?: Partial<T> | T; // Partial for update, full for create
}

const useStrapiMutationBase = <T>(collection: string, mutationConfig: MutationConfig<T>) => {
  return useMutation<StrapiMutationResponse<T>, Error, any>({ // TData will be derived from config
    mutationFn: async (data?: Partial<T> | T) => {
      const { method, documentId } = mutationConfig;
      const body = {
        method,
        collection,
        ...(documentId && { id: documentId }),
        ...(data && { data }),
      };

      const res = await fetch('/api/strapi', {
        method: 'POST', // Always POST to our API route
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result: StrapiMutationResponse<T> = await res.json();
      if (!res.ok) {
        throw new Error(result.error?.message || 'Mutation error');
      }
      return result;
    },
  });
};

export default useStrapiMutationBase;