// Types for Strapi API helpers and payloads

export interface StrapiRequestBody {
  method: "GET" | "POST" | "PUT" | "DELETE" | "SCHEMA";
  collection?: string;
  id?: string;
  data?: any;
  query?: any;
  schemaUid?: string;
}

export interface StrapiResponse<T> {
  data: T[];
  meta: StrapiPaginationMeta;
}

export interface StrapiPaginationMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface StrapiGetOneResponse<T> {
  data: { id: string; attributes: T };
}
