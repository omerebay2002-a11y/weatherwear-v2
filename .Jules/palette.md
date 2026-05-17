## 2026-05-17 - Custom toggle group accessibility
**Learning:** In apps using custom UI for radios/checkboxes (like WhenPicker, OccasionPicker, or Chip components), it's crucial to manually add `role="group"`, `aria-pressed`, and `focus-visible` styles. Without these, screen readers can't identify the active state, and keyboard users lose their focus context.
**Action:** Always verify custom selection components have explicit ARIA states (`aria-pressed` / `aria-checked`) and visible focus indicators (`focus-visible`).
