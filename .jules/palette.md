## 2024-06-11 - Forwarding htmlFor and adding aria-labels to text inputs
**Learning:** Custom wrapper components for inputs and inputs with visual placeholders but no visible label elements must be carefully managed to ensure screen readers can associate inputs with context. The custom `<Field>` wrapper lacked `htmlFor` forwarding, and the chat text input lacked an `aria-label`.
**Action:** Next time designing custom form fields, ensure `<label>` tags receive an `htmlFor` prop bound to their nested input's `id`. Additionally, ensure isolated text inputs have descriptive `aria-label`s.
## 2026-06-30 - Adding ARIA to Custom Accordions
**Learning:** Custom interactive components functioning as accordion or disclosure panels using generic buttons need explicit ARIA linking for screen readers to understand their structure and state.
**Action:** Ensure `aria-expanded` is linked to the open state on the toggle button and `aria-controls` on the button matches the `id` on the expandable content panel.
