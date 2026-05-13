## 2026-05-13 - Custom UI Controls A11y
**Learning:** Components lacking native semantic structure (like color swatches or choice chips built with generic `div` or `button` tags) fail to convey grouping context and toggle state to screen readers.
**Action:** Group non-standard inputs with `<fieldset>` and `<legend>`, add `aria-pressed` to toggleable buttons, and ensure `focus-visible` styles exist for keyboard navigation.
