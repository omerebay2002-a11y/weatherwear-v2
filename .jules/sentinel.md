## 2024-06-11 - Information Disclosure in API Error Responses
**Vulnerability:** Raw error messages and exceptions (e.g. `e.message` from the Anthropic SDK and potential internal application errors) were directly returned to clients in API responses within `api/analyze-clothing.ts`, `api/suggest-outfit.ts`, and `api/chat.ts`.
**Learning:** Returning detailed error stack traces or raw library error messages can leak sensitive backend infrastructure details or third-party service internals to end users, potentially aiding attackers in finding additional vulnerabilities.
**Prevention:** Catch errors and log them server-side using `console.error()`. Return only generic, non-revealing error messages (such as "Internal server error") to the client.
## 2024-07-02 - JSON Payload Size Limit Validation
**Vulnerability:** Unbounded JSON parsing in Vercel Edge functions can lead to CPU DoS and high memory usage, allowing a malicious actor to send large payloads.
**Learning:** Vercel Edge endpoints must explicitly validate the input payload length by checking `await req.text().length` prior to calling `JSON.parse()`.
**Prevention:** Implement payload size limits explicitly (e.g., 4MB for image endpoints, 1MB for text endpoints) using `await req.text().length` and return a 413 status if exceeded.
