---
title: "[BUG] Boolean switch does not trigger actions or updates"
status: pending
created: 2025-04-28
priority: high
tags:
  - bug
  - boolean
  - admin-table
  - integration
---

## Context
The boolean switch in the `BooleanCell` component of the admin table does not trigger any actions when toggled. The expected behavior is that toggling the switch should update the backend (Strapi) and/or the application state, reflecting the change in the UI and database.

## Problem
Currently, toggling the boolean switch does **not** update the backend or application state. This is because the `meta` prop (which should provide the `onCellUpdate` handler) is not being properly passed to the TanStack Table instance. As a result, no update logic is executed and the change is not persisted.

## Impact
- The switch appears interactive but does not persist or reflect any changes.
- This is a critical integration issue that prevents the expected behavior for boolean fields in the admin table.

## Acceptance Criteria
- [ ] Toggling the boolean switch triggers the proper update action, updating the backend and/or application state.
- [ ] The change is reflected in the UI immediately and persists after reload.
- [ ] The solution follows the integration pattern used for other editable cells (e.g., tags, relations).
- [ ] A document is created under `/docs` explaining how the workflow of updating a collection on Strapi works using the current setup, including quirks and usage notes, for future reference.

## Steps to Reproduce
1. Go to the admin table view for a collection with a boolean field.
2. Toggle the boolean switch in any row.
3. Observe that the value does not update in the UI or backend.

## References
- `src/components/admin/BooleanCell.tsx`
- `src/lib/admin-table.tsx`
- `src/app/admin/page.tsx`
