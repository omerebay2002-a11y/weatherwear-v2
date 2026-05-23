## 2024-03-20 - Missing ARIA Labels on Chat Inputs
**Learning:** Custom UI input fields (such as chat inputs) that rely on visual placeholders instead of explicit visible `<label>` tags must include an explicit `aria-label` attribute (or `htmlFor` association) to ensure accessibility for screen readers.
**Action:** Always verify that input fields without visible labels have `aria-label` attributes.
