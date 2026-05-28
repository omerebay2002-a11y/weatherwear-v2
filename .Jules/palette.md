## 2024-11-20 - Adding explicit accessibility labels to inputs lacking visible labels
**Learning:** React elements with input fields that appear clear contextually (e.g., using placeholders or pseudo-labels) can fail screen reader accessibility if lacking an explicit association or ARIA attribute.
**Action:** Always ensure that custom text inputs have either an explicit `<label htmlFor="id">` or an `aria-label` attribute, especially when visual labels are omitted or implemented as non-semantic tags.
