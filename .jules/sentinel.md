## 2024-05-09 - Information Disclosure in API Error Handling
**Vulnerability:** Raw Anthropic API error messages (`e.message`) were directly returned to the client in Vercel Edge Function responses (`api/chat.ts`, `api/analyze-clothing.ts`, `api/suggest-outfit.ts`).
**Learning:** Returning detailed error messages directly to the client can leak sensitive information about the backend architecture, third-party services, and potential application logic. The error handling structure caught internal exceptions and naively exposed them without masking the details.
**Prevention:** Always log detailed errors server-side using `console.error()` for debugging. Return generic, localized error messages (e.g., "Internal server error" or equivalent) to the user to prevent information disclosure.
