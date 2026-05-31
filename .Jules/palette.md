## 2025-01-20 - Custom Form Wrappers
**Learning:** Custom form wrapper components (like `<Field>`) need to explicitly accept and forward `htmlFor` props to their internal `<label>` tags. Otherwise, child inputs with `id`s cannot be semantically linked, which breaks screen reader accessibility and click-to-focus behavior for the label.
**Action:** When creating reusable form field wrappers, ensure they include an optional `htmlFor` prop that maps directly to the `<label>`'s `htmlFor` attribute.
