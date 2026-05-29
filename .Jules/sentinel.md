## 2026-05-29 - Prevent Information Disclosure in API Error Responses
**Vulnerability:** Edge functions returned raw error messages (`e.message` or `error.stack`) directly to the client when API calls or stream processing failed, exposing internal system details.
**Learning:** Returning detailed error messages from the server to the client exposes system context that can be used for further exploitation.
**Prevention:** Always log detailed errors server-side using `console.error()` and return generic messages (e.g., "Internal server error") to the client.
