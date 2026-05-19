## 2026-05-19 - ARIA Labels for Placeholder Inputs
**Learning:** Inputs that rely solely on visual placeholders (like chat inputs or inline AI search bars) are inaccessible to screen readers since there is no explicit `<label>`. This pattern appeared in multiple interactive components (StylistChat, TypeCapture).
**Action:** Always provide an explicit `aria-label` attribute on `<input>` elements that lack a visible `<label>`, even if the placeholder text visually describes the intended input.
