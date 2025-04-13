import useStrapiMutationBase from './useStrapiMutationBase';
import { StrapiMutationResponse } from '../types';

const useStrapiUpdate = <T>(collection: string, documentId: string) => {
  return useStrapiMutationBase<T>(collection, { method: 'PUT', documentId });
};

export default useStrapiUpdate;