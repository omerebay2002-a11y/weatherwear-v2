## 2024-06-11 - Information Disclosure in API Error Responses
**Vulnerability:** Raw error messages and exceptions (e.g. `e.message` from the Anthropic SDK and potential internal application errors) were directly returned to clients in API responses within `api/analyze-clothing.ts`, `api/suggest-outfit.ts`, and `api/chat.ts`.
**Learning:** Returning detailed error stack traces or raw library error messages can leak sensitive backend infrastructure details or third-party service internals to end users, potentially aiding attackers in finding additional vulnerabilities.
**Prevention:** Catch errors and log them server-side using `console.error()`. Return only generic, non-revealing error messages (such as "Internal server error") to the client.

## 2024-06-28 - CPU DoS and API cost-abuse via unconstrained JSON payloads
**Vulnerability:** API endpoints handling user input (`api/chat.ts`, `api/suggest-outfit.ts`, `api/analyze-clothing.ts`, `api/analyze-style.ts`, `api/generate-avatar.ts`) parsed JSON directly using `req.json()` without any size constraints, leaving them vulnerable to CPU Denial of Service and API cost-abuse if an attacker sends an extremely large payload.
**Learning:** Calling `req.json()` on unbounded input in Edge functions allows attackers to exhaust resources and incur high backend processing costs since the engine must process the entire large payload.
**Prevention:** Always implement explicit input size validation by checking the length of `await req.text()` before calling `JSON.parse()`. Enforce strict bounds (e.g., 1MB for text, 4MB for image base64s — strictly under Vercel's 4.5MB platform limit) and return a 413 Payload Too Large if exceeded.
