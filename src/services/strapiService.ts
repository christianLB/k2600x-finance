import strapi from './strapi';

export async function getCollection<T = any>(collection: string, query?: any) {
  return strapi.post({ method: 'GET', collection, query });
}

export const strapiService = {
  getCollection,
};

export default strapiService;
