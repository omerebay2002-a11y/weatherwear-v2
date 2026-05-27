## 2024-05-27 - Information Disclosure in Serverless Functions
**Vulnerability:** Edge API functions (`analyze-clothing`, `chat`, `suggest-outfit`) were returning raw error objects/messages directly to the client when API calls or processing failed.
**Learning:** Returning raw error messages from Vercel Edge functions could leak sensitive information, such as API response details, internal paths, or stack traces to the public web client.
**Prevention:** Always log detailed/raw errors internally using `console.error()` on the server side and return a generic error message (e.g. "Internal server error") or localized friendly message to the client.
