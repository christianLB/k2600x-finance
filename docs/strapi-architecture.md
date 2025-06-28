# Server-Side-Only Strapi Client Architecture

## Overview

This document outlines the architectural approach used for integrating with Strapi in the K2600x Finance application. The architecture follows a strict server-side-only approach for all Strapi operations, providing enhanced security, maintainability, and performance.

```
Client (Browser) <---> Next.js API Routes <---> Strapi API
                         |
                         v
                    strapiServer
                    (server-side only)
```

## Key Principles

1. **Security First**: Strapi API tokens are never exposed to the client
2. **Centralization**: All Strapi operations are routed through backend API routes
3. **Abstraction**: Frontend components interact with backend API routes, not directly with Strapi
4. **Type Safety**: TypeScript interfaces ensure consistency throughout the stack
5. **Error Handling**: Standardized error processing across all API endpoints

## Directory Structure

```
/src
├── app/api/strapi/            # API routes for Strapi operations
│   ├── schemas/               # Schema-related operations
│   │   └── route.ts           # GET: List all content types and schemas
│   ├── collections/           # Collection operations
│   │   ├── [collection]/      # Dynamic collection routes
│   │   │   ├── route.ts       # GET: List items, POST: Create item
│   │   │   └── [id]/
│   │   │       └── route.ts   # GET: Get item, PUT: Update, DELETE: Delete
│   └── media/                 # Media-related operations
│       └── route.ts
├── lib/
│   ├── strapi.server.ts       # Server-side Strapi client (secure)
│   └── strapi.public.ts       # Public API (limited functionality, no CRUD)
└── modules/finance-dashboard/
    ├── hooks/
    │   ├── useCollectionData.ts # React Query hook for collection data
    │   └── useStrapiSchema.ts   # Hook for fetching schema data
    └── components/
        ├── CollectionDataTable.tsx # Connected component using hooks
        └── SmartDataTable.tsx      # Presentational component
```

## Implementation Details

### 1. Strapi Client Configuration

- **Server-Side Client** (`strapi.server.ts`): 
  - Used exclusively by API routes
  - Contains API token
  - Never exposed to client
  - Full access to all Strapi operations

- **Public Client** (`strapi.public.ts`): 
  - Limited to non-CRUD operations only
  - Cannot modify data
  - No token required

### 2. API Routes

All Strapi operations are proxied through Next.js API routes to ensure:

- API tokens remain server-side only
- Consistent error handling
- Appropriate status codes
- Standardized response format

#### Collection Routes

- `GET /api/strapi/collections/[collection]`
  - Fetches paginated collection data
  - Supports sorting, filtering, and population
  - Query parameters:
    - `page`: Page number (default: 1)
    - `pageSize`: Items per page (default: 10)
    - `sort`: Sort field and direction
    - `filters`: JSON stringified filters
    - `populate`: Relations to populate (default: "*")

- `POST /api/strapi/collections/[collection]`
  - Creates a new record
  - Request body contains record data

- `GET /api/strapi/collections/[collection]/[id]`
  - Fetches a single record by ID
  - Supports population via query parameters

- `PUT /api/strapi/collections/[collection]/[id]`
  - Updates an existing record
  - Request body contains updated data

- `DELETE /api/strapi/collections/[collection]/[id]`
  - Deletes a record by ID

#### Schema Routes

- `GET /api/strapi/schemas`
  - Returns all available content types and their schemas

### 3. React Query Hooks

Custom React Query hooks provide a clean interface for components to interact with our API routes:

- `useCollectionData`: For fetching and manipulating collection data
- `useStrapiSchema`: For fetching schema information

These hooks handle loading states, error handling, pagination, and mutation operations.

### 4. Components

- `CollectionDataTable`: Connected component that uses hooks to fetch data
- `SmartDataTable`: Presentational component that displays and interacts with data

## Usage Guidelines

### 1. Fetching Collection Data

```tsx
import { useCollectionData } from '@/modules/finance-dashboard/hooks/useCollectionData';

function MyComponent() {
  const {
    data,
    columns,
    loading,
    error,
    pagination,
    setPage,
    create,
    update,
    remove
  } = useCollectionData('api::category.category', {
    initialPageSize: 10,
    initialPage: 1
  });
  
  // Use the data and mutation functions as needed
}
```

### 2. Creating Records

```tsx
const { create } = useCollectionData('api::category.category');

async function handleCreate(data) {
  try {
    const result = await create(data);
    // Handle success
  } catch (error) {
    // Handle error
  }
}
```

### 3. Updating Records

```tsx
const { update } = useCollectionData('api::category.category');

async function handleUpdate(id, data) {
  try {
    const result = await update({ id, ...data });
    // Handle success
  } catch (error) {
    // Handle error
  }
}
```

### 4. Deleting Records

```tsx
const { remove } = useCollectionData('api::category.category');

async function handleDelete(id) {
  try {
    await remove(id);
    // Handle success
  } catch (error) {
    // Handle error
  }
}
```

## Best Practices

1. **Never** use the Strapi client directly in client-side code
2. **Always** route all CRUD operations through API routes
3. Use the provided hooks for data fetching and mutations
4. Handle loading and error states appropriately
5. Use TypeScript for type safety
6. Follow the established patterns for new features

## Environment Variables

- `STRAPI_URL`: Base URL for Strapi API (server-side)
- `STRAPI_TOKEN`: API token for authentication (server-side only)
- `NEXT_PUBLIC_STRAPI_URL`: Public URL for non-CRUD operations

## Security Considerations

- API tokens are stored as environment variables and used server-side only
- All API routes validate inputs before passing to Strapi
- Proper error handling prevents leaking sensitive information
- Authentication and authorization must be implemented at both the Next.js and Strapi levels

## Migration Guide

If you're updating existing code to use this architecture:

1. Replace direct Strapi client usage with API route calls
2. Use the provided hooks instead of custom data fetching logic
3. Ensure all CRUD operations go through API routes
4. Remove any client-side usage of the Strapi token

## Troubleshooting

Common issues and solutions:

- **403 Forbidden**: Check API token permissions in Strapi
- **404 Not Found**: Verify collection name in API route path
- **500 Internal Error**: Check server logs for detailed error messages

## Conclusion

This server-side-only architecture provides a secure, maintainable, and performant way to integrate with Strapi. By following these guidelines, you can ensure that your application remains secure and scalable as it grows.
