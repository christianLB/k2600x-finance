export interface StrapiMutationResponse<T> {
  data?: T;
  error?: { message: string };
}