## 2024-06-04 - [Information Disclosure in Vercel Edge API Error Responses]
**Vulnerability:** API edge functions (e.g. chat, analyze-clothing, suggest-outfit) were exposing raw error objects and stack traces (e.message) in the response body to clients.
**Learning:** Returning unhandled exception details can leak sensitive internal information (e.g. file paths, library internals) that may help an attacker fingerprint the application or understand the internal logic and configuration.
**Prevention:** Always log detailed error information server-side (using `console.error`) and return a generic error message (such as "Internal server error") to the client.
