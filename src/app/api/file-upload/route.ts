/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable'; // Or use 'busboy'
import fs from 'fs';
import { getAuthHeaders } from '@/lib/strapi-auth'; // Assuming this exists

export async function POST(req: NextRequest) {
  try {
    const form = formidable({}); // Or use 'busboy'
    const [, files] = await form.parse(req.body as any);

    if (!files || !files.file || files.file.length === 0) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const uploadedFile = files.file[0]; // Assuming single file upload
    if (!uploadedFile.filepath) {
      return NextResponse.json({ error: 'Uploaded file has no path' }, { status: 500 });
    }

    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    const fileName = uploadedFile.originalFilename || `upload-${Date.now()}`; // Generate if needed
    const contentType = uploadedFile.mimetype || 'application/octet-stream'; // Default if not detected

    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
    if (!baseUrl) {
      throw new Error('Strapi URL not defined');
    }
    const uploadUrl = `${baseUrl}/api/upload`;

    const formData = new FormData();
    const fileBlob = new Blob([fileBuffer], { type: contentType });
    formData.append('files', fileBlob, fileName);

    const authHeaders = await getAuthHeaders();
    const headers = {
      ...authHeaders,
    }

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        ...headers,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorBody = await response.json();
        errorDetail = errorBody?.error?.message || JSON.stringify(errorBody);
      } catch {
        errorDetail = await response.text();
      }
      console.error('Strapi upload error:', errorDetail);
      return NextResponse.json(
        { error: `File upload to Strapi failed: ${errorDetail}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result[0]); // Return uploaded file info
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: `File upload failed: ${error.message}` }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parsing for file uploads
  },
};