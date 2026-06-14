## 2024-06-11 - Information Disclosure in API Error Responses
**Vulnerability:** Raw error messages and exceptions (e.g. `e.message` from the Anthropic SDK and potential internal application errors) were directly returned to clients in API responses within `api/analyze-clothing.ts`, `api/suggest-outfit.ts`, and `api/chat.ts`.
**Learning:** Returning detailed error stack traces or raw library error messages can leak sensitive backend infrastructure details or third-party service internals to end users, potentially aiding attackers in finding additional vulnerabilities.
**Prevention:** Catch errors and log them server-side using `console.error()`. Return only generic, non-revealing error messages (such as "Internal server error") to the client.

## 2024-06-14 - Authorization Bypass on Edge APIs
**Vulnerability:** Edge API endpoints (`api/chat.ts`, `api/analyze-clothing.ts`, `api/analyze-style.ts`, `api/suggest-outfit.ts`) that proxy requests to the third-party Anthropic API lacked authentication checks, making them publicly accessible to unauthorized users.
**Learning:** Even when API routes exist solely to proxy external services, they must implement their own authorization checks mirroring the deployment state (e.g. Supabase session tokens) to prevent unauthorized resource consumption and abuse. We must also support environments without auth configured.
**Prevention:** Always implement an authentication middleware or helper (e.g., extracting and verifying Bearer tokens via Supabase) in all server-side edge functions before processing requests or calling external APIs.
