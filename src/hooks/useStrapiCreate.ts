import useStrapiMutationBase from './useStrapiMutationBase';

const useStrapiCreate = <T>(collection: string) => {
  return useStrapiMutationBase<T>(collection, { method: 'POST' });
};

export default useStrapiCreate;