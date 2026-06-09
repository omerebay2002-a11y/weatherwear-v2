## 2024-06-09 - Ensure ARIA labels on placeholder-only inputs and icon-only buttons
**Learning:** Custom UI input fields (like chat inputs and search bars) that rely on visual placeholders instead of explicit `<label>` tags, as well as icon-only buttons, are inaccessible to screen readers without an explicit `aria-label`.
**Action:** Always verify that inputs without associated visible `<label>` elements and buttons without text content include a descriptive `aria-label` attribute to maintain accessibility.
