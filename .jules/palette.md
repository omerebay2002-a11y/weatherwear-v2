## 2024-06-11 - Forwarding htmlFor and adding aria-labels to text inputs
**Learning:** Custom wrapper components for inputs and inputs with visual placeholders but no visible label elements must be carefully managed to ensure screen readers can associate inputs with context. The custom `<Field>` wrapper lacked `htmlFor` forwarding, and the chat text input lacked an `aria-label`.
**Action:** Next time designing custom form fields, ensure `<label>` tags receive an `htmlFor` prop bound to their nested input's `id`. Additionally, ensure isolated text inputs have descriptive `aria-label`s.

## 2026-06-21 - Add aria-pressed to custom selection components
**Learning:** Custom interactive components functioning as toggle buttons or single-select groups (like Chips or OccasionPickers) must include the `aria-pressed` attribute linked to their boolean selection state to ensure accessibility for screen readers.
**Action:** Always verify if a custom button acts as a toggle or is part of a single-select group and, if so, implement the `aria-pressed` attribute bound to its active state.
