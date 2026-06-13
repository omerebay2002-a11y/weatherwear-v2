## 2024-06-11 - Forwarding htmlFor and adding aria-labels to text inputs
**Learning:** Custom wrapper components for inputs and inputs with visual placeholders but no visible label elements must be carefully managed to ensure screen readers can associate inputs with context. The custom `<Field>` wrapper lacked `htmlFor` forwarding, and the chat text input lacked an `aria-label`.
**Action:** Next time designing custom form fields, ensure `<label>` tags receive an `htmlFor` prop bound to their nested input's `id`. Additionally, ensure isolated text inputs have descriptive `aria-label`s.
## 2024-05-14 - Add aria-pressed to custom toggle buttons
**Learning:** Custom interactive components functioning as toggle buttons or single-select groups (like chips or pickers) lack the semantic state meaning provided by standard `<input type="radio">` or `<input type="checkbox">` elements.
**Action:** Always include the `aria-pressed` attribute linked to their boolean selection state (e.g. `aria-pressed={value === v}`) to ensure their active state is communicated properly to screen readers.
