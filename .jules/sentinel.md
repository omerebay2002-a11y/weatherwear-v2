## 2024-06-11 - Information Disclosure in API Error Responses
**Vulnerability:** Raw error messages and exceptions (e.g. `e.message` from the Anthropic SDK and potential internal application errors) were directly returned to clients in API responses within `api/analyze-clothing.ts`, `api/suggest-outfit.ts`, and `api/chat.ts`.
**Learning:** Returning detailed error stack traces or raw library error messages can leak sensitive backend infrastructure details or third-party service internals to end users, potentially aiding attackers in finding additional vulnerabilities.
**Prevention:** Catch errors and log them server-side using `console.error()`. Return only generic, non-revealing error messages (such as "Internal server error") to the client.

## 2024-05-18 - Missing Payload Size Limits Before JSON Parsing
**Vulnerability:** API endpoints were directly calling `await req.json()` without first checking the payload size. While Vercel enforces a 4.5MB platform limit, malicious payloads just under this limit could still cause high CPU usage and API cost-abuse during the parsing phase if not validated.
**Learning:** To prevent DoS and API cost-abuse, Vercel Edge API endpoints must implement explicit input size validation on request bodies by checking the length of the text before parsing it.
**Prevention:** Always consume the request stream as text using `await req.text()` and explicitly check the `length` against a strict maximum size (e.g., 1MB for text endpoints, 4MB for image endpoints) before passing the string to `JSON.parse()`. Return a 413 Payload Too Large response if limits are exceeded.
