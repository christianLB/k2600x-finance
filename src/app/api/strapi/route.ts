import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders, clearJWT } from '@/lib/strapi-auth';

const strapiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_STRAPI_URL,
};

// Helper para manejar errores de Strapi
const handleStrapiError = (error: any) => {
  console.error('Strapi error:', error);
  const message =
    error.error?.message ||
    error.message?.message ||
    error.message ||
    'An error occurred';
  return {
    error: true,
    message,
    details: error,
  };
};

export async function POST(req: NextRequest) {
  try {
    const { method, collection, id, data, query } = await req.json();

    if (!collection) {
      return NextResponse.json(
        { error: true, message: 'Collection is required' },
        { status: 400 }
      );
    }

    let response;
    const baseUrl = `${strapiConfig.baseUrl}/api/${collection}`;

    for (let attempt = 0; attempt < 2; attempt++) {
      const headers = await getAuthHeaders();
      const requestConfig: RequestInit = { headers, method };

      let url = id ? `${baseUrl}/${id}` : baseUrl;

      if (query && Object.keys(query).length > 0) {
        const queryString = new URLSearchParams(query).toString();
        url += `?${queryString}`;
      }

      console.log('📡 Strapi request:', { url, method, query });

      if (['POST', 'PUT'].includes(method)) {
        if (!data) {
          return NextResponse.json(
            { error: true, message: `Data is required for ${method}` },
            { status: 400 }
          );
        }
        requestConfig.body = JSON.stringify({ data });
      }

      response = await fetch(url, requestConfig);
      console.log('📡 Strapi response status:', response.status);

      let result = null;
      if (response.status !== 204) {
        result = await response.json();
      }

      if (response.status === 401 && attempt === 0) {
        console.log('🔑 Auth failed, retrying...');
        clearJWT();
        continue;
      }

      if (!response.ok) {
        return NextResponse.json(
          { error: true, message: result?.error?.message || 'An error occurred' },
          { status: response.status }
        );
      }

      return NextResponse.json(result || {}, { status: 200 });
    }

    throw new Error('Authentication failed after retry');
  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { error: true, message: 'Internal Server Error', details: error },
      { status: 500 }
    );
  }
}
