## 2024-06-11 - Forwarding htmlFor and adding aria-labels to text inputs
**Learning:** Custom wrapper components for inputs and inputs with visual placeholders but no visible label elements must be carefully managed to ensure screen readers can associate inputs with context. The custom `<Field>` wrapper lacked `htmlFor` forwarding, and the chat text input lacked an `aria-label`.
**Action:** Next time designing custom form fields, ensure `<label>` tags receive an `htmlFor` prop bound to their nested input's `id`. Additionally, ensure isolated text inputs have descriptive `aria-label`s.

## 2024-10-25 - ARIA Pressed State on Toggleable Buttons
**Learning:** Custom interactive components like picker groups and chips that act as toggle buttons must include the `aria-pressed` attribute to communicate their current selection state to screen readers, especially when they don't use standard `<input type="radio">` or `<input type="checkbox">` elements.
**Action:** When creating grouped selection buttons (like tabs or chips), always pass the selection boolean to an `aria-pressed` attribute.
