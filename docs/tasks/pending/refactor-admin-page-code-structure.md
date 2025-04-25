# Refactor: Admin Page Code Structure for Maintainability & Reusability

- **Date created:** 2025-04-25
- **Author:** k2600x

## Title
Refactor Admin Page for Separation of Concerns, Readability, and Composability

## Description
The current implementation of `src/app/admin/page.tsx` has grown in complexity, with UI logic, state management, data fetching, and utility logic intermixed. This makes the code harder to maintain, test, and extend. This task aims to analyze the file and propose a refactor plan for better maintainability, scalability, and code reusability.

## Analysis & Recommendations

### 1. **Component Isolation**
- **Sidebar**: Move the sidebar navigation to its own component (`AdminSidebar`).
- **Column Selector Dialog**: Extract the column selection UI into a `ColumnSelectorDialog` component.
- **Table & Table Controls**: Isolate the table display and controls (actions, filtering, etc.) into a reusable `AdminTable` component.
- **Record Form Dialog**: Extract the record creation/edit form into a `RecordFormDialog`.

### 2. **Hooks & State Management**
- Move logic for fetching and persisting column preferences into a custom hook (e.g., `useColumnPreferences`).
- Move record fetching, creation, update, and deletion into a custom hook (e.g., `useAdminRecords`).
- Use context or hooks to share schema and collection state as needed.

### 3. **Helpers & Utilities**
- Move Strapi API helpers (payload normalization, etc.) to `src/lib/strapi/`.
- Extract table column generation logic (`getTableColumns`) to a helper in `src/lib/admin-table.ts` for reusability.
- Any logic for mapping schema attributes to UI fields should be moved to `src/lib/schema-utils.ts`.

### 4. **General Improvements**
- Add clear type definitions for records, preferences, and schema objects in `src/types/`.
- Add JSDoc or comments for all exported functions/components.
- Reduce prop drilling by using context or hooks where appropriate.
- Ensure all components are composable and accept children/props for extension.
- Add tests for helpers and hooks (unit tests for lib, integration for hooks/components).

## Acceptance Criteria
- [ ] Major UI sections are split into isolated, reusable components.
- [ ] Data fetching and state logic is handled by custom hooks.
- [ ] Table column and schema logic is moved to helpers in `lib/`.
- [ ] Types are defined in `src/types/` and used throughout.
- [ ] Code is easier to read, extend, and test.
- [ ] Documentation/comments are added where needed.

## Definition of Done
- Code is refactored according to the above plan.
- No loss of functionality; all admin features work as before.
- Code is more readable, composable, and maintainable.
- Task doc is updated with a summary of the changes and moved to completed.

## References
- [Current admin/page.tsx implementation](../src/app/admin/page.tsx)
- [Column preferences refactor task](completed/feature-column-preferences.md)

## Subtasks

### 1. Component Extraction
- [x] Extract AdminSidebar component
- [x] Extract ColumnSelectorDialog component
- [x] Extract AdminTable component
- [x] Extract RecordFormDialog component
<!-- All major UI sections extracted and working, TypeScript checks pass. -->

### 2. Hooks & State Management
- [ ] Create useColumnPreferences hook
- [ ] Create useAdminRecords hook
- [ ] (Optional) Provide context for schema/collection state

### 3. Helpers & Utilities
- [ ] Move Strapi API helpers to src/lib/strapi/
- [ ] Move table column generation to src/lib/admin-table.ts
- [ ] Move schema-to-UI logic to src/lib/schema-utils.ts

### 4. Types & Documentation
- [ ] Define types in src/types/
- [ ] Add JSDoc/comments to exported functions/components

### 5. Testing & Validation
- [ ] Add unit tests for helpers/hooks
- [ ] Add integration tests for components/hooks
