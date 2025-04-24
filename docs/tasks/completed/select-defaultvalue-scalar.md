# Bugfix: Select defaultValue and Placeholder Issues

**Status:** Completed (2025-04-24)

## Summary
- **Bug fixed:** Select component no longer throws React warnings about defaultValue or controlled/uncontrolled switching.
- **Root cause:** The value passed to Select was sometimes '', [], null, or undefined. This caused React to treat the select as uncontrolled or issue scalar value warnings.
- **Solution:** Bulletproof normalization now ensures only valid string/number or undefined is passed to Select. Both useFormFactory and the Select component itself defensively coerce invalid values to undefined.
- **Result:** Placeholders and selected values now display correctly. All related warnings are gone.

## Additional Findings
- After the placeholder fix, the runtime error is gone, but the following warning persisted until normalization was bulletproofed:
  > The `defaultValue` prop supplied to <select> must be a scalar value if `multiple` is false.
- The select dropdowns did not show selected values or placeholders until the fix was applied.

## References
- See related code and ticket history in previous docs location: `docs/select-defaultvalue-scalar.md`.
