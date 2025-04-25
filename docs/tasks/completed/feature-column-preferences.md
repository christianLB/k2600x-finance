# Feature: Column Preferences Refactor

- **Date created:** 2025-04-24
- **Author:** k2600x
- **Completion date:** 2025-04-25

## Description
Refactor the admin table's column visibility logic to utilize a new `column-preferences` collection for storing user/admin preferences, ensuring proper CRUD operations and integration with the existing UI. The logic should:
- Fetch preferences for the current collection using the short collection name (e.g., `operation`, not the schema UID).
- Save or update preferences using the correct documentId for updates.
- Filter out columns that do not exist in the schema when loading or saving preferences.
- Remove reliance on the schema's `displayColumns` property.
- Ensure robust type safety and error handling.

## Acceptance Criteria
- [x] Preferences are loaded and saved using the `column-preferences` collection.
- [x] Uses the short collection name (pluralName) for all queries and payloads.
- [x] Updates use the Strapi documentId, not the DB id.
- [x] Invalid/missing columns are filtered out.
- [x] No TypeScript errors (`npx tsc --noEmit` passes).
- [x] No unnecessary page reloads after saving preferences.
- [x] Old logic using `displayColumns` is removed.

## Progress Notes
- Logic implemented and tested for correct CRUD.
- Type errors resolved and robust guards added.
- Console error for missing columns fixed by filtering.

## Completion Summary
- Refactor complete. All requirements met. Code merged to main. See commit ee5c468.

## References
- Related commit: ee5c468
- [Conversation context](#)
