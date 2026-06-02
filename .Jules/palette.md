## 2023-10-27 - Custom UI Input Fields Accessibility
**Learning:** Custom UI input fields (such as chat inputs) that rely on visual placeholders instead of explicit visible `<label>` tags lack context for screen readers.
**Action:** Always include an explicit `aria-label` attribute (or `htmlFor` association) to ensure accessibility for screen readers on input fields missing a visible label.
