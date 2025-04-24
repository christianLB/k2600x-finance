# Task: Investigate & Plan Field Mapping Normalization

**Status:** Completed

## Objective
Analyze the current logic for mapping Strapi (or other backend) field types to UI form components and validation schemas. Identify inconsistencies, edge cases, and areas for improvement. Plan a robust normalization strategy to ensure all field types are mapped and normalized consistently across the app.

## Expected Outcome
- A clear plan and set of recommendations for normalizing field mappings, including handling of special types (relations, media, enums, etc.) and edge cases.

## Areas to Investigate
- Current field type mapping logic (see `strapiToFormConfig.ts` and related files)
- Handling of complex field types (relations, media, enums, arrays)
- Consistency of props, placeholder, validation, and value normalization
- Opportunities for code simplification and DRYness
- Impact on form UX and data integrity
- **How to display the "selected" value for different types of relations or enums, given that only an id is available for reference. This may require different strategies for accessing and displaying the related record's display value.**
- **Ensure all normalization and mapping strategies are compatible with the existing input components from the design system library, avoiding modifications to those components.**

## Deliverables
- Written analysis of current mapping and normalization
- Recommendations and prioritized action items for refactoring
- (Optional) Example code snippets or diagrams

## Next Steps
- See actionable implementation task for next steps and future enhancements (including possible custom relation component).

---

**Created:** 2025-04-24
**Completed:** 2025-04-24
