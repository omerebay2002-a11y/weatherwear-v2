// Vercel Edge Function utility for conditional authentication

export async function requireAuth(req: Request): Promise<Response | null> {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  // If Supabase is not configured, bypass auth to support offline localStorage mode
  if (!url || !anonKey) {
    return null;
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const userUrl = new URL("/auth/v1/user", url).toString();
    const response = await fetch(userUrl, {
      headers: {
        Authorization: authHeader,
        apikey: anonKey,
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return null; // Auth passed
  } catch (error) {
    console.error("Auth validation error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
