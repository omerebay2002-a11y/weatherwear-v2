## 2024-06-10 - Added aria-expanded to accordion headers
**Learning:** Custom interactive components like accordions or disclosure panels using generic buttons require explicit ARIA attributes like `aria-expanded` and `aria-controls` to correctly communicate their state and relationships to screen readers.
**Action:** Always verify that custom disclosure or accordion components include an `aria-expanded` property that correctly reflects their open/closed state, and use `aria-controls` to explicitly link the button to its respective content panel.
