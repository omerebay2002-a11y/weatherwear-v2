## 2024-06-18 - Missing ARIA attributes for custom interactive components
**Learning:** Custom interactive components like toggle buttons (`aria-pressed`) or accordion/disclosure panels (`aria-expanded`, `aria-controls`) lack crucial ARIA attributes, rendering their state inaccessible to screen readers.
**Action:** Always verify that interactive components built from generic HTML elements (like `<button>`) include appropriate ARIA attributes to reflect their current state and structure.
