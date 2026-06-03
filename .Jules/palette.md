## 2024-05-24 - Semantic Linking of Form Fields
**Learning:** Custom form wrapper components (like `Field`) must be designed to accept and forward `htmlFor` props to their internal `<label>` elements so they can be semantically linked to child input `id`s for proper screen reader accessibility. Also, standalone visual inputs like chat bars require explicit `aria-label` attributes.
**Action:** Always ensure custom label wrappers support the `htmlFor` attribute and that associated inputs have unique `id`s. Add `aria-label` to custom input fields that lack visible labels.
