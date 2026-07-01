## 2024-06-11 - Information Disclosure in API Error Responses
**Vulnerability:** Raw error messages and exceptions (e.g. `e.message` from the Anthropic SDK and potential internal application errors) were directly returned to clients in API responses within `api/analyze-clothing.ts`, `api/suggest-outfit.ts`, and `api/chat.ts`.
**Learning:** Returning detailed error stack traces or raw library error messages can leak sensitive backend infrastructure details or third-party service internals to end users, potentially aiding attackers in finding additional vulnerabilities.
**Prevention:** Catch errors and log them server-side using `console.error()`. Return only generic, non-revealing error messages (such as "Internal server error") to the client.
## 2025-07-01 - Prevent CPU DoS in Vercel Edge Functions via JSON.parse
**Vulnerability:** Node.js `JSON.parse` is synchronous and can block the event loop while consuming massive amounts of CPU/Memory for extremely large JSON payloads, leading to Denial of Service.
**Learning:** Vercel Edge functions directly using `await req.json()` pass untrusted request bodies straight to `JSON.parse` without any length validation, making them vulnerable to DoS attacks.
**Prevention:** Always validate payload size before parsing. Use `await req.text()`, check its length against an endpoint-appropriate limit (e.g., 1MB for text, 4MB for image base64 strings), and only then call `JSON.parse()`.
