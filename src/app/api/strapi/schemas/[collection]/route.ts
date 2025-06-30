import { NextRequest, NextResponse } from 'next/server';
import { strapiService, StrapiError } from '@/services/strapiService';

export async function GET(
  req: NextRequest,
  { params }: { params: { collection: string } }
) {
  try {
    console.log('🔍 GET schema for collection:', params.collection);
    
    // Decode the base64 collection name
    const collectionUid = atob(params.collection);
    console.log('📝 Decoded collection UID:', collectionUid);
    
    // Get all schemas first
    const schemas = await strapiService.getSchemas();
    console.log('📋 Available schemas:', schemas.length);
    
    // Find the specific schema
    const schema = schemas.find((s: any) => s.uid === collectionUid);
    
    if (!schema) {
      console.log('❌ Schema not found for:', collectionUid);
      return NextResponse.json(
        { error: `Schema not found for collection: ${collectionUid}` },
        { status: 404 }
      );
    }
    
    console.log('✅ Schema found:', schema.uid);
    return NextResponse.json(schema);
    
  } catch (error) {
    console.error('💥 Error fetching schema:', error);
    if (error instanceof StrapiError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch schema' },
      { status: 500 }
    );
  }
}