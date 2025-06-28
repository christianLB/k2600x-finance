import { strapi } from '@strapi/client';

export const strapiServer = strapi({
  baseURL: `${process.env.STRAPI_URL!}/api`,
  auth: process.env.STRAPI_TOKEN!, // nunca sale del servidor
});
