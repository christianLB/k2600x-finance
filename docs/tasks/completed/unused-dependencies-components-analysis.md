# Analysis: Unused Dependencies and Components

**Status:** Completed

## Overview
This document lists packages declared in `package.json` that are not referenced in the source code, as well as React components that are present in the repository but unused. The goal is to identify cleanup opportunities and reduce bloat.

## Unused Dependencies
The following dependencies were detected as unused using `depcheck`:

- `@babel/preset-react`
- `@babel/preset-typescript`
- `@headlessui/react`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-dialog`
- `@radix-ui/react-icons`
- `@radix-ui/react-popover`
- `@radix-ui/react-select`
- `@radix-ui/react-slot`
- `@radix-ui/react-switch`
- `@radix-ui/react-tabs`
- `@shadcn/ui`
- `class-variance-authority`
- `date-fns`
- `formidable`
- `react-datepicker`
- `react-dom`
- `react-select`
- `tailwindcss-animate`

Unused devDependencies:

- `@babel/core`
- `@babel/preset-env`
- `@tailwindcss/postcss`
- `@types/formidable`
- `@types/react-dom`
- `eslint`
- `eslint-config-next`
- `jest`
- `jest-environment-jsdom`
- `tailwindcss`
- `typescript`

These packages may be remnants from earlier implementations or experiments. Removing them can speed up installation and reduce potential security surface area. Double-check each package before removal to ensure no indirect usage.

## Unused Components
A search across `src/` revealed several components without imports anywhere else in the project:

- `src/components/admin/MediaUploadCell.tsx`
- `src/components/operation-tags/OperationTagsManager.tsx`
- `src/components/operations/YearlyExpenseReportTable.tsx` and its child `src/components/operations/GroupBreakdownRow.tsx`

These components appear in the codebase but are never rendered or imported by other modules (except in their own files). If they are not part of upcoming features, consider deleting them to keep the repository lean.

## Recommendations
1. Review each unused dependency and component with the team.
2. Remove any that are confirmed obsolete.
3. Update documentation and tests as needed after cleanup.

---
*Generated on 2025-06-24*
