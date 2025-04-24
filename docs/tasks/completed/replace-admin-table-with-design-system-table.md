# Task: Replace Admin Table with @k2600x/design-system Table

**Status:** Planned

## Objective
Replace the current table implementation in the **admin interface (specifically under `src/app/admin`)** with the `Table` component exported from `@k2600x/design-system`, which is based on `tanstack-react-table`. The new implementation should support dynamic columns according to the Strapi schema provided by the `useStrapiSchema` hook (already available in the codebase).

## Expected Outcome
- The admin table uses the `@k2600x/design-system` Table component for all data views.
- Table columns are rendered dynamically based on the schema returned by `useStrapiSchema`.
- All existing table features (sorting, filtering, pagination, etc.) are preserved or improved.

## Implementation Steps
1. **Review Current Table Usage**
   - Identify all places in the admin interface where the current table component is used.
2. **Integrate Design System Table**
   - Replace the current table component with the one from `@k2600x/design-system`.
   - Ensure the new table is properly styled and functional in the admin context.
3. **Dynamic Columns Logic**
   - Implement logic to generate table columns dynamically using the schema from `useStrapiSchema`.
   - Ensure compatibility with all field types and relationships defined in the Strapi schema.
4. **Intermediate Logic**
   - If necessary, create helper functions or hooks to map Strapi schema definitions to `tanstack-react-table` column definitions.
   - Address any data transformation needed for special field types (e.g., relations, enums).
5. **Testing & QA**
   - Test the new table implementation with various schemas and data sets.
   - Ensure all features (sorting, filtering, pagination, etc.) work as expected.
   - Address any regressions or UI issues.

## Deliverables
- Updated admin table using the design system's Table component.
- Supporting logic for dynamic column rendering based on Strapi schema.
- Documentation or code comments explaining the dynamic column logic.

## Next Steps
- Assign this task to a developer.
- Review implementation with stakeholders after completion.

---

**Created:** 2025-04-24
