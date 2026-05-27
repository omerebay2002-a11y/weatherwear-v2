## 2024-05-27 - Input Accessibility With Placeholders
**Learning:** Custom UI input fields (like chat inputs or inline edit fields) that rely entirely on visual placeholders instead of explicit `<label>` tags are inaccessible to screen readers.
**Action:** Always add an explicit `aria-label` attribute to these `<input>` fields so that visually impaired users know what information is expected.
