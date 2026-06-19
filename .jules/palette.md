## 2024-06-11 - Forwarding htmlFor and adding aria-labels to text inputs
**Learning:** Custom wrapper components for inputs and inputs with visual placeholders but no visible label elements must be carefully managed to ensure screen readers can associate inputs with context. The custom `<Field>` wrapper lacked `htmlFor` forwarding, and the chat text input lacked an `aria-label`.
**Action:** Next time designing custom form fields, ensure `<label>` tags receive an `htmlFor` prop bound to their nested input's `id`. Additionally, ensure isolated text inputs have descriptive `aria-label`s.
## 2024-06-25 - Single-select custom buttons need aria-pressed

**Learning:** When using `<button>` elements to create custom single-select groups (like Chips or Pickers) that act essentially as radio buttons or toggles, their visual selected state is not automatically conveyed to screen readers.

**Action:** Always add the `aria-pressed={isActive}` attribute to custom buttons that function as stateful toggles or single-selection choices within a group, ensuring assistive technologies can announce their current selection state.
