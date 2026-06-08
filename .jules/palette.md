## 2024-05-15 - Missing Accessible Labels on Form Components
**Learning:** Custom UI form wrappers (like `<Field>`) need to forward `htmlFor` attributes to their internal `<label>` elements so screen readers can semantically associate them with child input `id`s. Also standalone input fields that rely entirely on placeholder text without a visible label must still have an explicit `aria-label` for screen reader users.
**Action:** Always forward `htmlFor` from wrapper components to inner `<label>` tags, and add `aria-label` to visually labelless inputs.
