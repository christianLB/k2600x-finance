import useStrapiMutationBase from './useStrapiMutationBase';
import { StrapiMutationResponse } from '../types';

const useStrapiDelete = <T>(collection: string, documentId: string) => {
  return useStrapiMutationBase<T>(collection, { method: 'DELETE', documentId });
};

export default useStrapiDelete;