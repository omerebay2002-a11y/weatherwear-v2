## 2024-05-29 - Input fields relying on visual placeholders
**Learning:** Custom UI input fields that rely on visual placeholders instead of explicit visible `<label>` tags lack necessary context for screen readers.
**Action:** Ensure any custom input fields that lack a visible `<label>` include an explicit `aria-label` attribute or `htmlFor` association to maintain accessibility.
