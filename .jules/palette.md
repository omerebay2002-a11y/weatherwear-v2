## 2024-06-11 - Forwarding htmlFor and adding aria-labels to text inputs
**Learning:** Custom wrapper components for inputs and inputs with visual placeholders but no visible label elements must be carefully managed to ensure screen readers can associate inputs with context. The custom `<Field>` wrapper lacked `htmlFor` forwarding, and the chat text input lacked an `aria-label`.
**Action:** Next time designing custom form fields, ensure `<label>` tags receive an `htmlFor` prop bound to their nested input's `id`. Additionally, ensure isolated text inputs have descriptive `aria-label`s.

## 2024-05-24 - ARIA State Attributes for Custom Interactive Components
**Learning:** Custom interactive components like accordions or toggle chips (frequently used in onboarding and settings flows) lack semantic meaning when built using generic `<button>` and `<motion.div>` elements. Users with screen readers rely on ARIA state attributes to understand whether an item is selected, or if a panel is expanded.
**Action:** When creating custom interactive components:
- For accordions/disclosure panels: Add `aria-expanded` to the trigger button and link it to the content panel using `id` and `aria-controls`.
- For toggle chips or single/multi-select groups built with buttons: Add the `aria-pressed` attribute reflecting their active state.
