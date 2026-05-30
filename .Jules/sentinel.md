## 2024-05-30 - Prevent Information Disclosure in API Error Handling
**Vulnerability:** API Edge Functions were returning raw error details (e.g., `e.message`) directly to the client in HTTP responses and stream messages.
**Learning:** Returning raw internal error details exposes underlying system implementation, potential API keys context, and internal state to users/attackers, creating an information disclosure vulnerability.
**Prevention:** Catch all errors gracefully, log detailed stack traces and messages server-side using `console.error()`, and return a generic, localized error message (e.g., 'Internal server error' or 'שגיאת שרת פנימית') to the client.
