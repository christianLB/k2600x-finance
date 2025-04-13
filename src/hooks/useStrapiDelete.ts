import useStrapiMutationBase from './useStrapiMutationBase';
import { StrapiMutationResponse } from '@/types';

const useStrapiDelete = <T>(collection: string, onSuccess?: () => void) => {
  return useStrapiMutationBase<T>(collection, { method: 'DELETE' }, onSuccess);
};

export default useStrapiDelete;