# Task: Support Schema displayColumns for Admin Table

## Background
A new optional column, `displayColumns`, has been added to the schema for each collection. If present and set, this column contains a comma-separated string enumerating the columns that should be displayed in the admin table for that collection.

## Requirements
- Update the admin table UI so that if the `displayColumns` property exists and has a value on the schema, only those columns (in the specified order) are displayed in the table.
- If `displayColumns` is not present or empty, fall back to displaying all columns as currently implemented.
- Add UI to allow the user to see which columns are being displayed and, optionally, to override the selection for the current session (bonus: allow column selection via a UI control).
- If a user overrides the selection, the new selection should be persisted back to the `displayColumns` field in the schema for that collection.

## Acceptance Criteria
- [ ] The admin table respects the `displayColumns` property from the schema for each collection.
- [ ] The UI clearly reflects which columns are visible and (optionally) allows the user to override this.
- [ ] If `displayColumns` is not set, all columns are shown by default.
- [ ] Changes are documented and tested.

---

**Notes:**
- This feature should be implemented in a way that is robust to future schema changes.
- The UI for column selection/visibility can be simple (e.g., a dropdown or checklist).
