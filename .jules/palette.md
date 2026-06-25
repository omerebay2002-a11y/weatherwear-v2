## 2024-06-11 - Forwarding htmlFor and adding aria-labels to text inputs
**Learning:** Custom wrapper components for inputs and inputs with visual placeholders but no visible label elements must be carefully managed to ensure screen readers can associate inputs with context. The custom `<Field>` wrapper lacked `htmlFor` forwarding, and the chat text input lacked an `aria-label`.
**Action:** Next time designing custom form fields, ensure `<label>` tags receive an `htmlFor` prop bound to their nested input's `id`. Additionally, ensure isolated text inputs have descriptive `aria-label`s.

## 2024-06-25 - Custom Toggle Buttons Accessibility
**Learning:** Custom interactive components that function as toggle buttons, checkboxes, or single/multi-select groups (e.g. chips, pickers, choice cards) are inaccessible to screen readers without explicit boolean state linking.
**Action:** Always include the `aria-pressed` attribute dynamically linked to the component's boolean selection state so that screen readers can correctly identify the active/inactive state of these custom interactive elements.
