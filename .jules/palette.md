## 2024-06-11 - Forwarding htmlFor and adding aria-labels to text inputs
**Learning:** Custom wrapper components for inputs and inputs with visual placeholders but no visible label elements must be carefully managed to ensure screen readers can associate inputs with context. The custom `<Field>` wrapper lacked `htmlFor` forwarding, and the chat text input lacked an `aria-label`.
**Action:** Next time designing custom form fields, ensure `<label>` tags receive an `htmlFor` prop bound to their nested input's `id`. Additionally, ensure isolated text inputs have descriptive `aria-label`s.
## 2026-06-15 - aria-pressed for custom toggle buttons
**Learning:** Custom interactive components functioning as toggle buttons or single-select groups (like chips, mode tabs, or pickers) need explicit `aria-pressed` attributes to communicate their boolean selection state to screen readers.
**Action:** Always add `aria-pressed={isActive}` to buttons that behave as toggles or single-select options within a group.
