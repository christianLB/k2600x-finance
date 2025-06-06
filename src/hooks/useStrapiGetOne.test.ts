import { useStrapiGetOne } from './useStrapiGetOne';

let capturedQueryFn: any;
jest.mock('@tanstack/react-query', () => ({
  useQuery: (config: any) => {
    capturedQueryFn = config.queryFn;
    return { data: undefined, error: undefined, isLoading: false, refetch: jest.fn() };
  }
}));

jest.mock('../services/strapi', () => ({
  post: jest.fn(() => Promise.resolve({ data: {} }))
}));
import strapi from '../services/strapi';

beforeEach(() => {
  (strapi.post as jest.Mock).mockClear();
});

test('useStrapiGetOne uses documentId when provided', async () => {
  useStrapiGetOne('items', '5', { documentId: '99' });
  await capturedQueryFn();
  expect(strapi.post).toHaveBeenCalled();
  const body = (strapi.post as jest.Mock).mock.calls[0][0];
  expect(body.id).toBe('99');
});
