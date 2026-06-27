## 2024-06-11 - Information Disclosure in API Error Responses
**Vulnerability:** Raw error messages and exceptions (e.g. `e.message` from the Anthropic SDK and potential internal application errors) were directly returned to clients in API responses within `api/analyze-clothing.ts`, `api/suggest-outfit.ts`, and `api/chat.ts`.
**Learning:** Returning detailed error stack traces or raw library error messages can leak sensitive backend infrastructure details or third-party service internals to end users, potentially aiding attackers in finding additional vulnerabilities.
**Prevention:** Catch errors and log them server-side using `console.error()`. Return only generic, non-revealing error messages (such as "Internal server error") to the client.

## 2025-02-14 - JSON Parsing CPU DoS Vulnerability
**Vulnerability:** API Edge functions used `await req.json()` without checking the payload size. Large malicious payloads could cause CPU denial-of-service (DoS) during JSON parsing and potentially incur unnecessary API cost usage for large payload sizes before failing later in the stack.
**Learning:** Vercel Edge functions can receive arbitrary sized payloads depending on platform limits (currently 4.5MB), but `JSON.parse` operations block the thread and are highly CPU intensive on large/nested objects. We must explicitly guard parsing logic for cost and stability.
**Prevention:** Always read the raw payload using `await req.text()`, validate its `length` against a strict, safe limit (e.g. 1MB for text endpoints, 4MB for image endpoints), and return a 413 error if exceeded, before passing the text to `JSON.parse()`.
