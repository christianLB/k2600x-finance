import { NextRequest, NextResponse } from 'next/server';
import { strapiService } from '@/services/strapiService';

export async function POST(req: NextRequest) {
  try {
    console.log('📁 Upload endpoint called');
    
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }
    
    console.log(`📤 Processing ${files.length} file(s)`);
    
    const results = [];
    for (const file of files) {
      console.log(`📤 Uploading: ${file.name} (${file.size} bytes)`);
      
      const result = await strapiService.uploadFile(file);
      console.log('✅ File uploaded successfully:', result);
      results.push(result);
    }
    
    // Return single file or array based on count
    const response = files.length === 1 ? results[0] : results;
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('💥 Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}