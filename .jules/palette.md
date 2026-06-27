## 2024-06-11 - Forwarding htmlFor and adding aria-labels to text inputs
**Learning:** Custom wrapper components for inputs and inputs with visual placeholders but no visible label elements must be carefully managed to ensure screen readers can associate inputs with context. The custom `<Field>` wrapper lacked `htmlFor` forwarding, and the chat text input lacked an `aria-label`.
**Action:** Next time designing custom form fields, ensure `<label>` tags receive an `htmlFor` prop bound to their nested input's `id`. Additionally, ensure isolated text inputs have descriptive `aria-label`s.
## 2024-06-27 - Wardrobe Category Accordion ARIA Attributes
**Learning:** Accordions built with Framer Motion (`motion.button` and `motion.div`) in React require explicit ARIA attributes (`aria-expanded` and `aria-controls` linked to the content `id`) to ensure accessibility for screen readers.
**Action:** Always add `aria-expanded` and `aria-controls` attributes to custom toggleable buttons and ensure the corresponding content container has a matching `id`.
