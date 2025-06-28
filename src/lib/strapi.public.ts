import { strapi } from '@strapi/client';

const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';

export const strapiPublic = strapi({
  baseURL: `${strapiUrl}/api`,
});

// Extend the client to include a generic delete method if it doesn't exist
// Note: The path for request() is relative to the baseURL
(strapiPublic as any).delete = function (slug: string, id: number) {
  return this.request('DELETE', `/${slug}/${id}`);
};
