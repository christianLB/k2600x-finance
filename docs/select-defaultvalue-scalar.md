# Issue: Select component defaultValue must be scalar for single-select

**File(s) involved:**
- `src/hooks/useFormFactory.tsx`
- (optionally) `src/components/ui/select.tsx`

## Description

When rendering a single-select field, React requires the `value`/`defaultValue` prop to be a scalar (string or number). If an object or array is passed, React throws a warning:

> The `defaultValue` prop supplied to <select> must be a scalar value if `multiple` is false.

This occurs in the dynamic form system when the form value for a select field is an object (e.g., `{ label, value }`) instead of just the scalar value.

## Solution

**Most efficient solution:**
- In `useFormFactory.tsx`, ensure that before rendering a Select component, the value passed is always a scalar (string/number or "").
- Example fix:
  ```js
  let value = watch(cfg.name);
  if (value && typeof value === 'object' && 'value' in value) value = value.value;
  if (Array.isArray(value)) value = value.length ? value[0] : "";
  if (value === undefined || value === null) value = "";
  ```
- Optionally, add a defensive check in the Select component to coerce non-scalar values to scalar, but the main logic should be in the form factory.

## Status
- **Fixed** (2025-04-24)
- **Bug fixed:** Select component no longer throws React warnings about defaultValue or controlled/uncontrolled switching.
- **Root cause:** The value passed to Select was sometimes '', [], null, or undefined. This caused React to treat the select as uncontrolled or issue scalar value warnings.
- **Solution:** Bulletproof normalization now ensures only valid string/number or undefined is passed to Select. Both useFormFactory and the Select component itself defensively coerce invalid values to undefined.
- **Result:** Placeholders and selected values now display correctly. All related warnings are gone.

## Additional Findings (2025-04-24)

- After the placeholder fix, the runtime error is gone, but the following warning persists:
  > The `defaultValue` prop supplied to <select> must be a scalar value if `multiple` is false.
  - This warning appears to be triggered by the underlying Primitive.select or native <select> in the custom Select component.
- The select dropdowns do not show selected values, even when a value is picked.
- The select controls appear small and do not display placeholder content.

### Console logs and observed data:
- Example field config: `operation_tag {type: 'relation', relation: 'oneToOne', ...}`
- Schema and fieldsConfig are logged and appear correct.
- The warning trace points to the Select component and its internal Primitive.select.

### Next Steps for Analysis
- Investigate how the value/defaultValue is passed to the underlying <select> or Primitive.select in the custom Select implementation.
- Ensure the value is a valid scalar and matches one of the SelectItem values.
- Check if the SelectTrigger and SelectValue are correctly displaying the selected value and placeholder.
- Review the Select component's usage of value, defaultValue, and placeholder props.
- Are we correctly mapping UI components?
  - Investigate if the right UI component is chosen for each field type in the form config and if the mapping logic is robust for all Strapi field types.

### Next Steps
- See new task: "Analyze Select & MultiSelect Strategy" for further investigation and UX improvements.

---

**References:**
- [admin-form-architecture.md](./admin-form-architecture.md)
- [React docs: Controlled Components](https://react.dev/reference/react-dom/components/select)
- Console logs and error traces provided by user (2025-04-24)
