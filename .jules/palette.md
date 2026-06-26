## 2024-06-11 - Forwarding htmlFor and adding aria-labels to text inputs
**Learning:** Custom wrapper components for inputs and inputs with visual placeholders but no visible label elements must be carefully managed to ensure screen readers can associate inputs with context. The custom `<Field>` wrapper lacked `htmlFor` forwarding, and the chat text input lacked an `aria-label`.
**Action:** Next time designing custom form fields, ensure `<label>` tags receive an `htmlFor` prop bound to their nested input's `id`. Additionally, ensure isolated text inputs have descriptive `aria-label`s.

## 2024-10-25 - ARIA Pressed State for Toggle Buttons
**Learning:** Custom interactive components functioning as toggle buttons or single-select groups (like chips, occasion pickers, or color pickers) need explicit `aria-pressed` attributes linked to their selection state. Without this, screen readers cannot determine if a button is currently "active" or "selected" when visual cues alone are used.
**Action:** Always include `aria-pressed={isActive}` on custom toggle buttons and single-select group items to expose their state to assistive technologies.
