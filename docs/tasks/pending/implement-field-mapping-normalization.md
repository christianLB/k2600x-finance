# Task: Implement Field Mapping Normalization

**Status:** Planned

## Objective
Refactor and enhance the field mapping logic to ensure robust, consistent normalization for all field types (including enums, relations, media, arrays, etc.) in the admin UI. Prepare for future replacement of the relation select with a dedicated component.

## Background
See completed analysis: `tasks/pending/field-mapping-normalization-analysis.md` (2025-04-24)

## Subtasks
- [x] **Enums Handling:** Refactor enum normalization to provide consistent `{ label, value }` options and ensure robust placeholder handling. (Completed 2025-04-24)
- [x] **StrapiRelationField Component Placeholder:** Implemented a fully custom relation field component with modal dialog, async fetch on open, and robust placeholder/selected value display. (Completed 2025-04-24)

## Action Items
- For relations, implement a utility to resolve id to label for display, supporting both pre-fetched and async options.
- For media, display filename or thumbnail as label.
- Ensure all normalization is done before passing props to the design system component.
- Document the normalization contract for all field types.
- Test with all field types, including edge cases (empty, async, large datasets, media).
- Design normalization logic to be compatible with current design system input components (no modifications to those components).
- Architect the solution so that a custom relation component can be introduced in the future with minimal changes.

## Deliverables
- Refactored and documented field mapping/normalization logic
- Utility for id-to-label resolution
- Tests and/or QA notes for all field types
- Documentation for future custom relation component integration

## Next Steps
- Assign to developer/architect
- Review implementation plan and begin refactor

---

**Created:** 2025-04-24
