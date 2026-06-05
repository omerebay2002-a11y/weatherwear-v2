## 2025-02-28 - Exposing raw API errors to clients

**Vulnerability:** Edge functions returned raw error messages and exception stack/message details (`e.message`) to the client when API calls failed (e.g., Anthropic API failures). This is an information disclosure vulnerability.
**Learning:** Vercel Edge Functions or API routes must handle exceptions carefully so internal implementation details (like exact dependencies, paths, or external API responses) are not leaked to external consumers.
**Prevention:** Catch errors, log them securely on the server-side using `console.error()`, and return a sanitized, generic error message (e.g., "Internal server error") or localized equivalent to the client.
