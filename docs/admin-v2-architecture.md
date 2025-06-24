# Admin V2 Architecture & Strapi Integration Plan

**Created:** 2025-06-25

## 1. Overview
This document describes the current architecture of the Admin V2 interface and outlines a proposal to convert it into a fully Strapi-integrated single-page application (SPA). The goal is to leverage existing components while modernizing the layout and data flow using the project's design system.

## 2. Current Implementation
- **Entry point:** `src/app/admin/finance-dashboard/page.tsx` renders the admin dashboard using `AppShellLayout` and loads collection schemas via `useStrapiSchema`. Selected collection data is fetched with `useStrapiCollection` and displayed in `SmartDataTable`.
- **SmartDataTable:** A wrapper around the design-system `DataTable` that provides row actions and pagination. When the user clicks "Edit", a dialog opens containing `DynamicStrapiForm` for the selected record.
- **Dynamic Forms:** `DynamicStrapiForm` uses `useFormFactory` to generate fields from the Strapi schema and validate input with Zod. It supports create and update modes.
- **Special Table Cells:** Helper components like `BooleanCell`, `RelationCell`, `TagsCell`, and `StrapiMediaUpload` handle boolean switches, relation selectors, tag editing, and media uploads.
- **Context:** `StrapiSchemaProvider` caches all Strapi schemas for use across components.

## 3. Relevant Code Snippets
- Page initialization and table rendering in `finance-dashboard/page.tsx`:
  ```tsx
  const { schemas: schemaData, loading: schemasLoading } = useStrapiSchema();
  const { data, columns, pagination, refetch } = useStrapiCollection(selectedModel);
  return (
    <AppShellLayout navbarItems={navbarItems} sidebarItems={sidebarItems}>
      <SmartDataTable
        data={data}
        columns={columns}
        pagination={tablePagination}
        onEdit={row => console.log('Editing row:', row)}
        onPageChange={() => refetch()}
        collection={selectedModel}
      />
    </AppShellLayout>
  );
  ```
- SmartDataTable with inline edit dialog (`SmartDataTable.tsx` lines 23‑94):
  ```tsx
  const [editRow, setEditRow] = useState<T | null>(null);
  <DataTable data={data} columns={cols} pagination={dataTablePagination} />
  <Dialog isOpen={!!editRow} onClose={handleClose}>
    <DynamicStrapiForm collection={collection} document={editRow} onSuccess={handleSuccess} />
  </Dialog>
  ```
- Dynamic form generation (`DynamicStrapiForm.tsx` lines 35‑140) uses the schema from context and exposes a `submitForm` method for dialogs.

## 4. Legacy Components
Existing admin components under `src/components/admin/` include:
- `AdminSidebar` and `Sidebar` – previous navigation widgets.
- `AdminTable`, `ColumnSelectorDialog`, `RecordFormDialog` – table utilities and dialogs.
- Specialized cells (`BooleanCell`, `TagsCell`, `RelationCell`, `StrapiMediaUpload`).
Many of these were used in `src/app/admin/page.tsx` (now deprecated) and can be refactored for the new SPA.

## 5. Proposed Migration Steps
1. **Central Table SPA**
   - Keep `finance-dashboard/page.tsx` as the entry and ensure routing is client-side only, avoiding full page reloads. The sidebar should list relevant collections for quick navigation.
2. **SmartDataTable Integration**
   - Use `SmartDataTable` as the unified table component. Wire its `onEdit` and future `onDelete` callbacks to Strapi mutations from `useStrapiCollection` or dedicated hooks.
   - Ensure pagination state is mapped to the design-system `DataTable` props.
3. **Specialized Cells**
   - Reuse `BooleanCell`, `RelationCell`, and `TagsCell` for inline updates. These components already invoke `table.options.meta.onCellUpdate` so they can dispatch updates to Strapi via `onCellUpdate`.
   - Implement a media thumbnail/view cell using logic from `StrapiMediaUpload` for read-only display in tables.
4. **Dynamic CRUD Forms**
   - Use `RecordFormDialog` to open `DynamicStrapiForm` in a modal for create and update operations.
   - Leverage `StrapiMediaUpload` inside forms for uploading files to the Strapi media library.
5. **Layout & UI**
   - Adopt `AppShellLayout` with a persistent sidebar and top navigation. The design system provides components (Button, Dialog, DataTable, etc.) for a professional look.
   - Consider migrating older sidebar and dialog code to smaller reusable pieces that fit this layout.
6. **Service Layer**
   - All data operations should use the existing `strapiService` and hooks (`useStrapiCreate`, `useStrapiUpdate`, `useStrapiDelete`). This keeps API access centralized and validated with Zod.

## 6. Legacy Component Refactor
- **AdminSidebar → sidebarItems**: Convert the legacy sidebar into a simple list of `sidebarItems` consumed by `AppShellLayout`.
- **AdminTable → SmartDataTable**: Replace table rendering with `SmartDataTable`. Migrate any custom logic from `AdminTable` (loading states, empty states) into the new component as needed.
- **RecordFormDialog**: Already compatible; ensure it forwards `submitForm` calls to `DynamicStrapiForm`.
- **ColumnSelectorDialog**: Adapt to work with the new schema metadata (`displayColumns`).

## 7. UI Enhancements
- Use the design system’s typography, spacing, and color utilities for consistent styling.
- Employ responsive grid utilities in forms (e.g., `DynamicStrapiForm` already renders fields in a three-column grid).
- Integrate the design-system media library styles when embedding `StrapiMediaUpload`.

## 8. Conclusion
By consolidating table management with `SmartDataTable` and reusing form and cell components, Admin V2 can evolve into a fully Strapi-driven SPA with a clean, professional UI. The existing hooks and utilities provide a solid foundation; the main effort is wiring them together and refactoring legacy pieces to align with the design system.
