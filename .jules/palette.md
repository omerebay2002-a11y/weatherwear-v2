## 2024-06-11 - Forwarding htmlFor and adding aria-labels to text inputs
**Learning:** Custom wrapper components for inputs and inputs with visual placeholders but no visible label elements must be carefully managed to ensure screen readers can associate inputs with context. The custom `<Field>` wrapper lacked `htmlFor` forwarding, and the chat text input lacked an `aria-label`.
**Action:** Next time designing custom form fields, ensure `<label>` tags receive an `htmlFor` prop bound to their nested input's `id`. Additionally, ensure isolated text inputs have descriptive `aria-label`s.
## 2024-06-14 - ARIA Pressed for Selection Components
**Learning:** Found a recurring pattern where custom interactive components acting as toggle buttons or single-select groups (e.g., `ChoiceCard`, `OccasionPicker`, `Chip`) lacked `aria-pressed` attributes. While they had visual active states, screen readers had no way to determine if they were selected.
**Action:** Always add `aria-pressed={isActive}` to generic `<button>` elements that function as toggles or selectors to ensure their boolean state is accessible.
