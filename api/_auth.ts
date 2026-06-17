export async function requireAuth(req: Request): Promise<Response | null> {
  // If Supabase is not configured, the app runs in local offline mode
  // and we should bypass auth.
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null; // Bypass auth
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing or invalid authorization token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const res = await fetch(`${url}/auth/v1/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: key,
      },
    });

    if (!res.ok) {
      console.error("Supabase Auth Error:", res.status, await res.text().catch(() => ""));
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return null; // Auth succeeded
  } catch (err) {
    console.error("Supabase Auth Request Error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
