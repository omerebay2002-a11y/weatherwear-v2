## 2024-10-31 - Explicit Label Associations & ARIA Labels for Inputs
**Learning:** Custom UI inputs (like search/chat fields) often rely on visual placeholders instead of explicit `<label>` elements. While they look clean visually, screen readers struggle to announce what the input is for unless we provide explicit associations.
**Action:** When designing or refactoring custom form elements and wrappers, explicitly use `aria-label` for placeholder-only inputs or ensure wrapper components can forward an `htmlFor` prop down to their internal `<label>` to link with the child `<input id="...">`.
