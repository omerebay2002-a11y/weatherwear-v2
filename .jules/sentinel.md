
## 2024-05-24 - Do not expose API errors to client
**Vulnerability:** Raw Anthropic API errors (`e.message`) were being directly returned to the client in HTTP 500 responses across multiple API endpoints.
**Learning:** Returning raw third-party service errors can leak sensitive internal configuration, prompt injection attempts, or underlying infrastructure details.
**Prevention:** Always log specific error details server-side using `console.error` and return a sanitized, generic error message (e.g., "Internal server error") to the client.
