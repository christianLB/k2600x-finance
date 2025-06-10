# Bugfix: Update button stuck disabled

**Status:** Completed (2025-06-07)

## Summary
- Fixed regression where the update button inside `RecordFormDialog` remained disabled even after editing fields.
- Dirty state is now emitted from `DynamicStrapiForm` via `onDirtyChange` and tracked in the dialog.
- The dialog button re-enables when the form becomes dirty and warns if closing with unsaved changes.
