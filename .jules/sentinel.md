## 2024-06-11 - Information Disclosure in API Error Responses
**Vulnerability:** Raw error messages and exceptions (e.g. `e.message` from the Anthropic SDK and potential internal application errors) were directly returned to clients in API responses within `api/analyze-clothing.ts`, `api/suggest-outfit.ts`, and `api/chat.ts`.
**Learning:** Returning detailed error stack traces or raw library error messages can leak sensitive backend infrastructure details or third-party service internals to end users, potentially aiding attackers in finding additional vulnerabilities.
**Prevention:** Catch errors and log them server-side using `console.error()`. Return only generic, non-revealing error messages (such as "Internal server error") to the client.
## 2026-06-29 - Prevent CPU DoS in Vercel Edge Endpoints
**Vulnerability:** Unbounded `await req.json()` calls could allow attackers to send massive JSON payloads, causing CPU exhaustion or excessive API costs during parsing.
**Learning:** Vercel Edge functions do not automatically enforce strict, low request body limits by default before parsing. Memory limit is 4.5MB but large payloads within that can still cause CPU issues during JSON processing.
**Prevention:** Always validate request body size explicitly using `await req.text()` and checking its length before calling `JSON.parse()`. Enforce context-appropriate limits (e.g., 1MB for text endpoints, 4MB for image endpoints).
