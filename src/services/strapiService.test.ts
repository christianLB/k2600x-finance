import { strapiService } from './strapiService';
import strapi from './strapi';

jest.mock('./strapi');

afterEach(() => {
  (strapi.post as jest.Mock).mockClear();
});

test('getCollection calls strapi.post with GET method', async () => {
  (strapi.post as jest.Mock).mockResolvedValue({ data: [] });
  await strapiService.getCollection('users');
  expect(strapi.post).toHaveBeenCalledWith({ method: 'GET', collection: 'users', query: undefined });
});
