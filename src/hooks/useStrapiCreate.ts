import useStrapiMutationBase from './useStrapiMutationBase';
import { StrapiMutationResponse } from '../types';

const useStrapiCreate = <T>(collection: string) => {
  return useStrapiMutationBase<T>(collection, { method: 'POST' });
};

export default useStrapiCreate;