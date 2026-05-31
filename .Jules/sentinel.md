## 2024-10-25 - Prevent Information Disclosure in API Edge Functions
**Vulnerability:** Raw error details (`e.message` or `error.stack`) were being returned directly to the client in Vercel Edge API functions (`analyze-clothing.ts`, `chat.ts`, `suggest-outfit.ts`), potentially exposing internal system details, API keys formats, or stack traces.
**Learning:** Returning raw exceptions directly to the user is a common information disclosure vulnerability.
**Prevention:** Always log the detailed error server-side (e.g., `console.error(e)`) and return a generic error response (e.g., 'Internal server error' or 'שגיאה פנימית בשרת') to the user.
