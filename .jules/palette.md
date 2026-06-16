## 2024-06-11 - Forwarding htmlFor and adding aria-labels to text inputs
**Learning:** Custom wrapper components for inputs and inputs with visual placeholders but no visible label elements must be carefully managed to ensure screen readers can associate inputs with context. The custom `<Field>` wrapper lacked `htmlFor` forwarding, and the chat text input lacked an `aria-label`.
**Action:** Next time designing custom form fields, ensure `<label>` tags receive an `htmlFor` prop bound to their nested input's `id`. Additionally, ensure isolated text inputs have descriptive `aria-label`s.
## 2024-06-16 - Add aria-pressed to toggle buttons
**Learning:** Custom interactive components functioning as toggle buttons or single-select groups (like chips or pickers) must include the `aria-pressed` attribute linked to their boolean selection state to ensure accessibility for screen readers.
**Action:** When creating custom single-select groups or toggle buttons, ensure each button includes an `aria-pressed={isSelected}` attribute to correctly announce its state to screen reader users.
