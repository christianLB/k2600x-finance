import useStrapiMutationBase from './useStrapiMutationBase';

const useStrapiUpdate = <T>(collection: string) => {
  return useStrapiMutationBase<T>(collection, { method: 'PUT' });
};

export default useStrapiUpdate;