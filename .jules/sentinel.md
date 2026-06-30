## 2024-06-11 - Information Disclosure in API Error Responses
**Vulnerability:** Raw error messages and exceptions (e.g. `e.message` from the Anthropic SDK and potential internal application errors) were directly returned to clients in API responses within `api/analyze-clothing.ts`, `api/suggest-outfit.ts`, and `api/chat.ts`.
**Learning:** Returning detailed error stack traces or raw library error messages can leak sensitive backend infrastructure details or third-party service internals to end users, potentially aiding attackers in finding additional vulnerabilities.
**Prevention:** Catch errors and log them server-side using `console.error()`. Return only generic, non-revealing error messages (such as "Internal server error") to the client.
## 2024-06-30 - Prevent DoS via JSON parsing in Vercel Edge API
**Vulnerability:** Unbounded `await req.json()` parsing could allow for CPU Denial of Service or excessive API cost abuse by parsing extremely large request payloads.
**Learning:** Vercel Edge functions do not automatically enforce strict, low request body size limits. Calling `req.json()` directly exposes the app to malicious payloads before any application-level checks can execute.
**Prevention:** Instead of `await req.json()`, read the raw text using `await req.text()`, validate its length against an acceptable threshold (e.g., 1MB for text, 4MB for image data), return a 413 error if exceeded, and finally parse using `JSON.parse(rawText)`.
