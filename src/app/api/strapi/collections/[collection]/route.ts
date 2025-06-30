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
    // Always populate all relations and media fields for the UI
    const queryWithPopulate = {
      ...query,
      populate: '*'  // This will populate all media fields and relations
    };
    
    console.log('📦 Fetching collection with populate:', { collection, query: queryWithPopulate });
    const data = await strapiService.find(collection, queryWithPopulate);
    console.log('✅ Data fetched with media populated');
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
  
  console.log('➕ POST request:', { collection });
  
  try {
    const body = await req.json();
    console.log('📦 POST body:', body);
    
    const data = await strapiService.create(collection, body);
    console.log('✅ POST successful:', { id: data.id, documentId: data.documentId });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('❌ POST error:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    if (error instanceof StrapiError) {
      console.error('StrapiError details:', { message: error.message, status: error.status, details: error.details });
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      );
    }
    
    // Log the actual error for debugging
    console.error('Non-StrapiError:', {
      message: (error as any)?.message,
      stack: (error as any)?.stack,
      response: (error as any)?.response?.data
    });
    
    return NextResponse.json(
      { 
        error: "Create failed", 
        details: (error as any)?.message || "Unknown error",
        actualError: String(error)
      },
      { status: 500 }
    );
  }
}

