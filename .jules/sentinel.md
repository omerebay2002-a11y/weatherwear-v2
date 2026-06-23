## 2024-06-11 - Information Disclosure in API Error Responses
**Vulnerability:** Raw error messages and exceptions (e.g. `e.message` from the Anthropic SDK and potential internal application errors) were directly returned to clients in API responses within `api/analyze-clothing.ts`, `api/suggest-outfit.ts`, and `api/chat.ts`.
**Learning:** Returning detailed error stack traces or raw library error messages can leak sensitive backend infrastructure details or third-party service internals to end users, potentially aiding attackers in finding additional vulnerabilities.
**Prevention:** Catch errors and log them server-side using `console.error()`. Return only generic, non-revealing error messages (such as "Internal server error") to the client.

## 2024-06-11 - Input Size Validation in API Routes
**Vulnerability:** Missing input size validation on request bodies (e.g. \`messages\`, base64 image data, \`selfie\`) in Vercel Edge API endpoints (\`api/chat.ts\`, \`api/analyze-clothing.ts\`, \`api/analyze-style.ts\`, \`api/generate-avatar.ts\`, \`api/suggest-outfit.ts\`), posing a potential medium DoS or API cost-abuse risk.
**Learning:** Vercel Edge API endpoints parsing JSON payloads via \`await req.json()\` directly can process excessively large payloads. Large base64 strings or deeply nested arrays/objects can consume significant memory and compute during parsing or downstream processing (like third-party AI APIs), enabling abuse or Denial of Service.
**Prevention:** Intercept the raw text body via \`await req.text()\`, check its \`.length\` against a defined reasonable limit before attempting to parse it with \`JSON.parse()\`. Enforce strict length limits for specific nested fields (like message arrays) after parsing.
