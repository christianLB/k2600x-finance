// src/app/api/strapi/collections/[collection]/[id]/route.ts
import { NextResponse } from "next/server";
import { strapiService, StrapiError } from "@/services/strapiService";

export async function GET(
  req: Request,
  { params }: { params: { collection: string; id: string } }
) {
  // Decode the collection UID from base64
  const collection = atob(params.collection);
  const { id } = params;
  const { searchParams } = new URL(req.url);
  const query = Object.fromEntries(searchParams.entries());

  try {
    const data = await strapiService.findOne(collection, id, query);
    return NextResponse.json(data);
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

export async function PUT(
  req: Request,
  { params }: { params: { collection: string; id: string } }
) {
  // Decode the collection UID from base64
  const collection = atob(params.collection);
  const { id } = params;
  try {
    const body = await req.json();
    const data = await strapiService.update(collection, id, body);
    return NextResponse.json(data);
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

export async function DELETE(
  _req: Request,
  { params }: { params: { collection: string; id: string } }
) {
  // Decode the collection UID from base64
  const collection = atob(params.collection);
  const { id } = params;
  
  console.log('🗑️ DELETE request:', { collection, id });
  
  try {
    await strapiService.delete(collection, id);
    console.log('✅ DELETE successful');
    // 204 responses should not have a body
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('❌ DELETE error:', error);
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
        error: "Delete failed", 
        details: (error as any)?.message || "Unknown error",
        actualError: String(error)
      },
      { status: 500 }
    );
  }
}

