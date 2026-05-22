## 2026-05-22 - Explicit ARIA labels for placeholder-only inputs
**Learning:** Custom UI input fields (such as chat inputs) that rely on visual placeholders instead of explicit visible `<label>` tags often fail accessibility audits because screen readers cannot determine their purpose.
**Action:** Always ensure that inputs lacking a visible `<label>` have an explicit `aria-label` attribute (or `htmlFor` association) to ensure accessibility for screen readers.
