// src/app/api/strapi/schemas/route.ts

import { NextResponse } from "next/server";
import { strapiService, StrapiError } from "@/services/strapiService";

export async function GET() {
  try {
    const schemas = await strapiService.getSchemas();
    
    // Filter only collection types that are visible (not plugin types)
    const collectionTypes = schemas.filter((schema: any) => 
      schema.schema?.kind === 'collectionType' && 
      schema.schema?.visible === true
    );
    
    return NextResponse.json(collectionTypes);
  } catch (error) {
    console.error('Schemas endpoint error:', error);
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

