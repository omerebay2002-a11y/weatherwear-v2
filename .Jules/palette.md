## 2024-05-24 - Screen Reader Accessibility for Custom Inputs
**Learning:** Custom UI inputs (e.g. chat textboxes or quick-add fields) that rely on placeholder text rather than explicit `<label>` tags are inaccessible to screen readers.
**Action:** Always add an `aria-label` attribute describing the expected input if an explicit visible `<label>` is not present in the design.
