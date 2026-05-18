## 2024-05-18 - Exposed API Error Information
**Vulnerability:** Upstream Anthropic API error messages and raw AI model text output were being passed directly to the client when edge functions encountered errors.
**Learning:** Returning `e.message` or raw responses on API failure is a common pattern that inadvertently leaks internal implementation details and possibly sensitive context to the client, providing a map for potential attackers.
**Prevention:** Always log exceptions securely on the server-side with `console.error` and return generic, uninformative error messages (e.g. "Internal server error") to the client.
