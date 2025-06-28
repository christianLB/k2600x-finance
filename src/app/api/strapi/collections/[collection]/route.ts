// src/app/api/strapi/collections/[collection]/route.ts
import { NextResponse } from "next/server";
import { strapiService, StrapiError } from "@/services/strapiService";

export async function GET(
  req: Request,
  { params }: { params: { collection: string } }
) {
  // Decode the collection UID from base64
  const collection = atob(params.collection);
  const { searchParams } = new URL(req.url);

  // Convert searchParams to Strapi 5 format with pagination object
  const rawParams = Object.fromEntries(searchParams.entries());
  const query: any = {};
  
  // Handle pagination parameters for Strapi 5
  if (rawParams.page || rawParams.pageSize) {
    query.pagination = {};
    if (rawParams.page) query.pagination.page = parseInt(rawParams.page);
    if (rawParams.pageSize) query.pagination.pageSize = parseInt(rawParams.pageSize);
  }
  
  // Add other parameters (skip empty or invalid parameters)
  Object.keys(rawParams).forEach(key => {
    if (key !== 'page' && key !== 'pageSize') {
      const value = rawParams[key];
      // Skip empty parameters or empty keys to avoid Strapi 5 validation errors
      if (!key.trim() || value === '' || value === null || value === undefined) {
        return;
      }
      query[key] = value;
    }
  });

  try {
    const data = await strapiService.find(collection, query);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof StrapiError) {
      // If it's a 404, return empty data structure instead of error
      if (error.status === 404) {
        return NextResponse.json({
          data: [],
          meta: {
            pagination: {
              page: 1,
              pageSize: 25,
              pageCount: 0,
              total: 0
            }
          }
        });
      }
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { collection: string } }
) {
  // Decode the collection UID from base64
  const collection = atob(params.collection);
  try {
    const body = await req.json();
    const data = await strapiService.create(collection, body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof StrapiError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

