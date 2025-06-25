# Strapi Integration: Architecture & TDD Plan

## 1. Overview
This document outlines a robust architecture for integrating with the Strapi backend. It defines a clear separation of concerns between API communication, state management, and UI components. It also proposes a Test-Driven Development (TDD) strategy to ensure reliability and maintainability.

## 2. Core Architecture

### 2.1. Strapi API Proxy (`/api/strapi/route.ts`)
This endpoint acts as a secure proxy between the Next.js frontend and the Strapi backend.

*   **Purpose:** To centralize all Strapi API calls, handle authentication securely on the server-side, and abstract away the Strapi URL and tokens from the client.
*   **Request Body:** It expects a JSON object with the following properties:
    *   `method`: (Required) `GET`, `POST`, `PUT`, `DELETE`, `SCHEMA`.
    *   `collection`: (Required for most methods) The `collectionName` of the Strapi model (e.g., `categories`, `invoices`).
    *   `schemaUid`: (Required for `SCHEMA`) The UID of the content type (e.g., `api::category.category`).
    *   `id`: (Optional) The ID of a single document to fetch, update, or delete.
    *   `ids`: (Optional) An array of document IDs for bulk operations.
    *   `data`: (Optional) The payload for `POST` or `PUT` requests.
    *   `query`: (Optional) An object representing Strapi query parameters (e.g., `populate`, `filters`, `pagination`).
*   **Authentication:** It uses `getAuthHeaders()` from `lib/strapi-auth.js` to attach the necessary JWT token to every request sent to the Strapi instance. It also includes logic to refresh the token on a 401 Unauthorized response.

### 2.2. Centralized Strapi Service (`/services/strapi.ts`)
This service provides a simple, typed interface for making requests to our API proxy.

*   **Purpose:** To offer a single point of entry for all frontend components and hooks to communicate with Strapi. This prevents scattering `fetch` calls across the codebase.
*   **`strapiRequest(body)` function:** A generic function that takes the `StrapiRequestBody` and sends it to the `/api/strapi` endpoint. It handles basic response parsing and error throwing.

### 2.3. Data-Fetching Hooks
These React hooks abstract away the logic of data fetching, caching, and state management.

*   **`useStrapiSchema(schemaUid)`:**
    *   **Responsibility:** Fetches the schema for a given content type `uid`.
    *   **Returns:** `{ schema, loading, error }`.
*   **`useStrapiCollection(modelName)`:**
    *   **Responsibility:** Fetches a collection of documents. It internally uses `useStrapiSchema` (or a shared context) to get the `collectionName` from the `modelName` (`uid`).
    *   **Returns:** `{ data, columns, pagination, loading, error, refetch }`.
*   **`useStrapiDocument(modelName, id)` (New Hook):**
    *   **Responsibility:** Fetches a single document by its ID.
    *   **Returns:** `{ document, loading, error, refetch }`.
*   **`useStrapiMutation()` (New Hook):**
    *   **Responsibility:** Provides functions for creating, updating, and deleting documents. Handles loading and error states for mutation operations.
    *   **Returns:**
        *   `create(modelName, data)`
        *   `update(modelName, id, data)`
        *   `remove(modelName, id)`
        *   `{ loading, error }`

## 3. Test-Driven Development (TDD) Strategy

### 3.1. Unit & Integration Testing with Jest & React Testing Library
We will use a bottom-up approach, starting with hooks and moving to components.

*   **Mocking:** Use Mock Service Worker (MSW) to intercept requests to `/api/strapi` at the network level. This allows us to test the full data flow from the hook to the mock API response.
*   **Testing `useStrapiCollection`:**
    1.  **Test Case:** "should return loading state initially".
    2.  **Test Case:** "should fetch and return formatted data and columns".
    3.  **Test Case:** "should handle API errors gracefully".
    4.  **Test Case:** "should correctly use `collectionName` from the schema".
*   **Testing `SmartDataTable.tsx`:**
    1.  **Test Case:** "should render a loading state when data is being fetched".
    2.  **Test Case:** "should render the table with the correct data and columns".
    3.  **Test Case:** "should display an empty state when no data is returned".
    4.  **Test Case:** "should call `onEdit` when the edit button is clicked".

### 3.2. End-to-End (E2E) Testing with Cypress/Playwright (Recommended)
E2E tests will simulate real user interactions in a browser.

*   **Test Flow:**
    1.  Log in to the application.
    2.  Navigate to the Admin Dashboard.
    3.  Select a collection from the sidebar.
    4.  Verify that the table populates with data.
    5.  Click the "Edit" button on a row.
    6.  Verify the edit dialog opens with the correct data.
    7.  Modify a field and save the form.
    8.  Verify the table shows the updated data.
