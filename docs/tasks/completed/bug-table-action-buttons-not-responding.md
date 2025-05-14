---
title: Table action buttons not responding
date_created: 2025-05-08
author: (fill in if relevant)
---

## Description

Table action buttons (such as edit, delete, or custom actions) in the admin UI are not responding to user clicks. This bug prevents users from performing actions on table rows as expected.

## Acceptance Criteria
- Action buttons in all relevant tables respond to clicks and trigger their intended actions.
- No errors are present in the console when action buttons are clicked.
- UI feedback (such as loading, success, or error states) is displayed appropriately.

## Steps to Reproduce
1. Go to the Admin UI and select any Strapi collection with records.
2. Observe the table displaying records. Each row should have action buttons (Edit, Delete).
3. Click on the Edit or Delete button for any row.
4. Notice that nothing happens, or the expected dialog/action does not trigger.
5. Check the browser console for errors or missing handler warnings.

## Analysis
- The table action buttons (Edit, Delete) are rendered by the `getTableColumns` utility in `src/lib/admin-table.tsx`.
- These buttons call `info.table.options.meta?.onEdit` and `onDelete` handlers, which are expected to be provided via the `meta` prop to the table.
- The `AdminTable` component in `src/components/admin/AdminTable.tsx` passes the `meta` prop to the underlying `Table` component from `@k2600x/design-system`.
- The design system `Table` implementation fully supports passing a `meta` prop, which is injected into the TanStack Table instance and thus available in cell renderers as `info.table.options.meta`.
- The `AdminTable` implementation correctly forwards the `meta` prop to the design system `Table`.
- However, the connection between the `AdminPage` and `AdminTable` must ensure that the `meta` prop contains the required `onEdit` and `onDelete` handlers. If these are undefined or missing, the action buttons will not function.

### Comparison with Design System Table
- The design system `Table` expects `meta` to be passed as a prop and does not alter or transform it. It is the responsibility of the parent (`AdminTable` and ultimately `AdminPage`) to provide the correct handlers in `meta`.
- There is no mismatch between the design system Table and AdminTable regarding the `meta` prop handling; both are compatible.
- The only way the action buttons would not work is if `AdminPage` fails to supply the correct `meta` object, or if the columns are generated without the correct callbacks.

### Root Cause
- The root cause is likely that the `meta` prop passed to the `AdminTable` (and thus to the inner `Table`) does not include the required `onEdit` and `onDelete` functions, or they are not connected to the parent component's logic.
- This can happen if the `AdminPage` fails to pass these handlers down, or if the table columns are not generated with the correct callbacks.

### Fix Plan
1. Ensure that `AdminPage` constructs the `meta` object with valid `onEdit` and `onDelete` functions.
2. Pass this `meta` object as a prop to `AdminTable`.
3. Confirm that `getTableColumns` is called with the correct handlers and that the action column buttons are using them.
4. Add tests or manual checks to verify that clicking Edit/Delete triggers the appropriate dialogs or actions.

---

## Completion
- **Date completed:** 2025-05-08
- **Resolution summary:**
    - The bug was resolved by ensuring the `meta` prop passed from `AdminPage` to `AdminTable` includes the required `onEdit` and `onDelete` handlers. This ensures that the table action buttons (Edit, Delete) now correctly trigger the appropriate dialogs and actions. The implementation is now fully compatible with the design system Table and follows the intended architecture.
- **Relevant commit(s):** (add commit hash/PR link if available)

## Relevant Links/Screenshots/References
- `src/app/admin/page.tsx`
- `src/components/admin/AdminTable.tsx`
- `src/lib/admin-table.tsx` (see `getTableColumns` and action column)
- [Admin Form Architecture Documentation](../../admin-form-architecture.md)
