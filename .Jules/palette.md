## 2026-05-21 - Added Accessibility Labels to Inputs
**Learning:** Found that custom inputs relying only on visual placeholders lack proper accessibility for screen readers. Explicit `aria-label` attributes (or `htmlFor` mappings with `<label>` tags) are essential when visible labels aren't naturally provided.
**Action:** Always ensure any input element has either an associated `<label>` or an `aria-label` attribute if a visible label is missing, especially in chat interfaces or single-input forms.
