import useStrapiSchema from './useStrapiSchema';

let capturedQueryFn: any;
jest.mock('@tanstack/react-query', () => ({
  useQuery: (config: any) => {
    capturedQueryFn = config.queryFn;
    return { data: undefined, error: undefined, isLoading: false };
  },
}));

jest.mock('@/services/strapi', () => ({
  post: jest.fn(() => Promise.resolve({ data: {} })),
}));
import strapi from '@/services/strapi';

afterEach(() => {
  (strapi.post as jest.Mock).mockClear();
});

test('fetches all schemas when no UID provided', async () => {
  useStrapiSchema();
  await capturedQueryFn();
  expect(strapi.post).toHaveBeenCalledWith({ method: 'SCHEMA' });
});

test('passes schemaUid when provided', async () => {
  useStrapiSchema('api::post.post');
  await capturedQueryFn();
  expect(strapi.post).toHaveBeenCalledWith({
    method: 'SCHEMA',
    schemaUid: 'api::post.post',
  });
});
