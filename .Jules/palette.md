## 2026-05-15 - Focus States and aria-pressed on Custom Toggle Buttons
**Learning:** Custom toggle buttons built with generic `<button>` tags (like Chips and Color pickers) lack native selected states for screen readers and default visual focus rings that align well with custom designs.
**Action:** Always add `aria-pressed` to communicate the state to screen readers and explicitly style `focus-visible` states to ensure keyboard users can clearly see which item is focused.
