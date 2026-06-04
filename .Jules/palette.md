## 2024-06-04 - Accessible Form Wrappers
**Learning:** Custom UI input wrapper components (like `<Field>`) need to explicitly accept and pass down `htmlFor` props to their internal `<label>` tags, otherwise screen readers cannot semantically associate the visual label with the child input `id`. Also, inputs relying solely on placeholders without explicit labels need `aria-label` attributes.
**Action:** Always ensure custom field wrappers support `htmlFor`/`id` linking, and verify that any standalone input (like chat inputs or text boxes) has a descriptive `aria-label`.
