// Vercel Serverless (Node) Function — virtual try-on. Dresses the avatar figure
// standing in the room in ONE garment, keeping the same face/body/pose so it
// stays aligned in the room layer.
//
// Runs on the Node runtime with maxDuration so FASHN can use its high-quality
// mode (realistic garment DRAPE — a dress falls like a dress, not a flat shirt).
// The edge runtime's ~25s wall forced the faster, flatter "performance" mode;
// Node + maxDuration removes that limit.
//
// Body-worn garments (top / bottom / dress / outerwear) → FASHN (purpose-built
// try-on, preserves identity + pose). Accessories FASHN doesn't cover (shoes /
// bag / …) → Nano Banana edit with garment-aware prompting. Result is cut out on
// transparent bg (rembg) so it drops into the room layer.
//
// Input:  { figure, garment, category?, name? }   (figure/garment = url or data URL)
// Output: { imageUrl }  on success  |  { error, detail } on failure

export const config = { maxDuration: 60 };

// SSRF guard for user-supplied image inputs that fal fetches server-side.
// Returns an error string if the value is unsafe, or null if OK.
function unsafeImageInput(v: unknown): string | null {
  if (typeof v !== "string" || !v) return "missing";
  if (v.startsWith("data:image/")) return v.length > 12_000_000 ? "image too large" : null;
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    return "not a valid URL";
  }
  if (u.protocol !== "https:") return "must be https or a data:image URL";
  const host = u.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    // block bare IPs (cloud metadata is 169.254.169.254; private ranges, loopback)
    /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ||
    host.includes(":")
  ) {
    return "host not allowed";
  }
  return null;
}

const FASHN_MODEL = process.env.FAL_TRYON_MODEL || "fal-ai/fashn/tryon/v1.5";
const NANO_MODEL = process.env.FAL_AVATAR_MODEL || "fal-ai/nano-banana/edit";
const CUTOUT_MODEL = process.env.FAL_CUTOUT_MODEL || "fal-ai/imageutils/rembg";

// Our wardrobe categories → FASHN garment categories. Only body-worn pieces map;
// everything else (shoes, bag, accessory, socks, underwear) goes via Nano Banana.
const FASHN_CATEGORY: Record<string, string> = {
  top: "tops",
  bottom: "bottoms",
  dress: "one-pieces",
  outerwear: "tops",
};

// Garment-aware Nano Banana prompts (from the wardrobe-buyer-critic skill) so
// accessories sit with real contact points + weight, not pasted flat.
const NANO_PROMPT: Record<string, string> = {
  shoes:
    "Replace ONLY her shoes with this exact pair, correctly scaled to her feet, soles flat on the floor with a soft contact shadow.",
  bag:
    "Add this exact bag carried naturally — held by the handle in one hand at her side or on the shoulder — hanging with its weight and a soft shadow where it meets her body, realistic scale.",
  accessory:
    "Add this exact accessory worn in its natural place, correct scale, with a soft contact shadow.",
  socks: "Put these exact socks on her feet/ankles, correct length.",
  underwear: "Put this exact base layer on her, fitted naturally.",
};

interface TryOnBody {
  figure?: string;
  garment?: string;
  category?: string;
  name?: string;
}

// Minimal req/res typing to avoid a hard @vercel/node dependency.
export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let body: TryOnBody;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }

  // SSRF guard: only allow inline data-image URLs or public https images — never
  // http:, internal hosts, or cloud-metadata IPs that fal would fetch server-side.
  for (const [field, val] of [["figure", body.figure], ["garment", body.garment]] as const) {
    const bad = unsafeImageInput(val);
    if (bad) {
      res.status(400).json({ error: `Invalid ${field}`, detail: bad });
      return;
    }
  }

  const falKey = process.env.FAL_KEY ?? process.env.falkey;
  if (!falKey) {
    res.status(503).json({
      error: "FAL_KEY not configured",
      detail: "Add FAL_KEY (or falkey) to the Vercel environment for this deployment.",
    });
    return;
  }
  if (!body.figure || !body.garment) {
    res.status(400).json({ error: "Missing figure or garment" });
    return;
  }

  const category = body.category ?? "";
  const fashnCategory = FASHN_CATEGORY[category];

  try {
    let dressedUrl: string;

    if (fashnCategory) {
      // ── Purpose-built try-on (FASHN), high-quality drape ──────────────────
      const r = await fal(FASHN_MODEL, falKey, {
        model_image: body.figure,
        garment_image: body.garment,
        category: fashnCategory,
        garment_photo_type: "flat-lay", // our catalog images are flat-lays
        mode: "quality", // realistic drape/length/silhouette (Node maxDuration covers the time)
        num_samples: 1,
        output_format: "png",
      });
      if (!r.ok) {
        res.status(502).json({ error: "Try-on failed", detail: `FASHN ${r.status}: ${r.text.slice(0, 400)}` });
        return;
      }
      const url = (r.json as { images?: { url: string }[] })?.images?.[0]?.url;
      if (!url) {
        res.status(502).json({ error: "Try-on failed", detail: "FASHN returned no image" });
        return;
      }
      dressedUrl = url;
    } else {
      // ── Accessories FASHN doesn't cover → Nano Banana edit ────────────────
      const word = NANO_PROMPT[category] ? category : "item";
      const action =
        NANO_PROMPT[category] ??
        "Add/replace only her relevant item with this exact one, correct scale and a soft contact shadow.";
      const prompt =
        `Two reference images. The FIRST is a full-body photo of a person. The SECOND is a single ${word}` +
        `${body.name ? ` ("${body.name}")` : ""} on a plain background. ${action} ` +
        `Keep her face, hair, body, pose, position, and background EXACTLY the same. ` +
        `Photorealistic, full body head to toe, no text, no extra props.`;
      const r = await fal(NANO_MODEL, falKey, {
        prompt,
        image_urls: [body.figure, body.garment],
        num_images: 1,
        output_format: "png",
      });
      if (!r.ok) {
        res.status(502).json({ error: "Try-on failed", detail: `edit ${r.status}: ${r.text.slice(0, 400)}` });
        return;
      }
      const url = (r.json as { images?: { url: string }[] })?.images?.[0]?.url;
      if (!url) {
        res.status(502).json({ error: "Try-on failed", detail: "edit returned no image" });
        return;
      }
      dressedUrl = url;
    }

    // ── Cut the dressed figure out on transparent bg (best effort) ──────────
    let imageUrl = dressedUrl;
    try {
      const cut = await fal(CUTOUT_MODEL, falKey, { image_url: dressedUrl });
      if (cut.ok) {
        const cutUrl = (cut.json as { image?: { url: string } })?.image?.url;
        if (cutUrl) imageUrl = cutUrl;
      } else {
        console.error("rembg error:", cut.status, cut.text.slice(0, 200));
      }
    } catch (e) {
      console.error("rembg request failed:", e);
    }

    res.status(200).json({ imageUrl });
  } catch (e) {
    console.error("try-on error:", e);
    res.status(500).json({ error: "Internal server error", detail: e instanceof Error ? e.message : String(e) });
  }
}

// ── helper ─────────────────────────────────────────────────────────────────
async function fal(
  model: string,
  key: string,
  payload: unknown
): Promise<{ ok: boolean; status: number; json: unknown; text: string }> {
  const r = await fetch(`https://fal.run/${model}`, {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* non-JSON error body */
  }
  if (!r.ok) console.error(`fal ${model} ${r.status}:`, text.slice(0, 300));
  return { ok: r.ok, status: r.status, json: parsed, text };
}
