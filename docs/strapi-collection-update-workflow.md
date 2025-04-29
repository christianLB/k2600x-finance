---
title: "Strapi Collection Update Workflow (Admin UI)"
created: 2025-04-28
tags:
  - strapi
  - admin-table
  - workflow
  - documentation
---

# Strapi Collection Update Workflow

This document explains how the workflow for updating a collection in Strapi works using the current admin interface setup. It covers the end-to-end flow, quirks, and best practices for developers.

## 1. Overview
- The admin UI uses a dynamic table to display and edit collections from Strapi.
- Editable cells (booleans, tags, relations, etc.) are rendered with custom React components.
- Updates are sent to the backend (Strapi) via API calls and reflected in the UI using React Query.

## 2. Main Components Involved
- **AdminTable** (`src/components/admin/AdminTable.tsx`): Renders the table and passes update logic via the `meta` prop.
- **BooleanCell**, **TagsCell**, **RelationCell**: Editable cell components that trigger updates when their value changes.
- **getTableColumns** (`src/lib/admin-table.tsx`): Generates column definitions, wiring up cell update handlers.
- **useAdminRecords** (`src/hooks/useAdminRecords.ts`): Custom hook for CRUD operations against Strapi.

## 3. Update Flow
1. **User Action:**
    - User toggles a switch (boolean), selects a tag, or changes a relation in a table cell.
2. **Cell Handler:**
    - The cell component calls the `onChange` prop, which is wired to `onCellUpdate` via the table's `meta` prop.
3. **onCellUpdate:**
    - Receives `(row, key, value)` and triggers an update (usually via `updateRecord` from `useAdminRecords`).
    - Only the changed field is sent in the payload for efficiency.
4. **API Call:**
    - The update is sent to the `/api/strapi` endpoint, which proxies to Strapi using a PUT request.
5. **React Query Invalidation:**
    - On success, React Query invalidates the relevant queries to refresh the table data.
6. **UI Update:**
    - The UI reflects the new value. If the backend update fails, an error may be shown (improve error handling if needed).

## 4. Quirks & Gotchas
- **Meta Prop Required:** The `meta` prop must be passed to the table instance so cell components can access `onCellUpdate`. If omitted, cell updates will not trigger any action.
- **Partial Updates:** Only the changed field is sent to the backend. Ensure your backend supports partial updates.
- **ID Handling:** Updates use `row.documentId` as the primary key. Records missing this field cannot be updated.
- **Consistency:** All editable cells should use the same update pattern for consistency and maintainability.
- **Error Handling:** If the backend update fails, the UI may not reflect it immediately. Consider adding user feedback for failed updates.

## 5. Usage Example
```tsx
// BooleanCell usage inside getTableColumns
cell: (info) => {
  const row = info.row.original;
  return (
    <BooleanCell
      value={!!row[key]}
      onChange={(newValue) => {
        if (typeof info.table.options.meta?.onCellUpdate === 'function') {
          info.table.options.meta.onCellUpdate(row, key, newValue);
        }
      }}
      row={row}
      name={key}
      disabled={false}
    />
  );
}
```

## 6. Best Practices
- Always test cell updates in the UI to ensure the backend and UI stay in sync.
- Document any custom logic or exceptions for specific fields/collections.
- Keep this document up to date as the workflow evolves.

---
