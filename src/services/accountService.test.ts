import { fetchAccounts } from './accountService';
import strapi from './strapi';

jest.mock('./strapi');

describe('fetchAccounts', () => {
  test('requests accounts collection', async () => {
    (strapi.post as jest.Mock).mockResolvedValue({ data: [] });
    await fetchAccounts();
    expect(strapi.post).toHaveBeenCalledWith({ method: 'GET', collection: 'accounts' });
  });
});
