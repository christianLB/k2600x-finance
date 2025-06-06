import { strapiRequest } from './strapi';

beforeEach(() => {
  global.fetch = jest.fn(() => Promise.resolve(new Response(JSON.stringify({ success: true }), { status: 200 }))) as any;
});

afterEach(() => {
  (global.fetch as jest.Mock).mockClear();
});

test('strapiRequest posts to /api/strapi with given body', async () => {
  await strapiRequest({ method: 'GET', collection: 'users' });
  expect(global.fetch).toHaveBeenCalledWith('/api/strapi', expect.objectContaining({ method: 'POST' }));
  const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
  expect(body.collection).toBe('users');
});
