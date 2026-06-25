## 2024-06-11 - Information Disclosure in API Error Responses
**Vulnerability:** Raw error messages and exceptions (e.g. `e.message` from the Anthropic SDK and potential internal application errors) were directly returned to clients in API responses within `api/analyze-clothing.ts`, `api/suggest-outfit.ts`, and `api/chat.ts`.
**Learning:** Returning detailed error stack traces or raw library error messages can leak sensitive backend infrastructure details or third-party service internals to end users, potentially aiding attackers in finding additional vulnerabilities.
**Prevention:** Catch errors and log them server-side using `console.error()`. Return only generic, non-revealing error messages (such as "Internal server error") to the client.
## 2024-05-18 - Payload Limit DoS in Edge Functions
**Vulnerability:** Unbounded JSON parsing (`await req.json()`) in Edge API endpoints.
**Learning:** Vercel Edge functions processing base64 image data without size limits can be abused to cause memory exhaustion or API cost spikes.
**Prevention:** Always read the body with `await req.text()` and check `text.length` before calling `JSON.parse()`.
