## 2024-11-20 - Accessible Placeholder-Only Inputs
**Learning:** In minimalistic UIs, input fields are frequently implemented with only visual placeholders and without visible `<label>` tags. Screen readers cannot always rely on placeholders.
**Action:** When working on such inputs, always ensure an explicit `aria-label` attribute is added, or connect a visible but styled-like-text label using `htmlFor` and `id` to ensure accessibility without breaking the design.
