## 2024-06-06 - Form Wrapper Component Accessibility
**Learning:** Custom UI wrappers (like `<Field>`) that encapsulate an `<input>` alongside visual label text can break accessibility if they don't accept and forward `htmlFor` props to explicit `<label>` tags and correspond to a child input's `id`. Without this mapping, screen readers cannot associate the text with the input.
**Action:** When creating reusable form wrapper components, design them to accept an optional `htmlFor` prop, map it to the internal `<label>`, and ensure implementing components provide matching `id`s for their inputs.
