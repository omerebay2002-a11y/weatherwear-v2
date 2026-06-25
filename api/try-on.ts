// Vercel Edge Function — virtual try-on. Dresses the avatar figure that is
// standing in the room in ONE garment (a real /catalog flat-lay or a user photo),
// keeping the same face, body, and pose so it stays aligned in the room layer.
//
// Body-worn garments (top / bottom / dress / outerwear) use FASHN — a model
// PURPOSE-BUILT for garment try-on, which preserves identity + pose far more
// reliably than a general image editor. Accessories that FASHN doesn't cover
// (shoes / bag / etc.) fall back to Nano Banana edit. Either way the result is
// cut out on transparent bg (rembg) so it drops into the room layer.
//
// Input:  { figure, garment, category?, name? }   (figure/garment = url or base64 data URL)
// Output: { imageUrl }  on success  |  { error, detail } on failure (real reason)

export const config = { runtime: "edge" };

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

const NANO_WORD: Record<string, string> = {
  shoes: "shoes",
  bag: "bag",
  accessory: "accessory",
  socks: "socks",
  underwear: "base layer",
};

interface TryOnBody {
  figure: string;
  garment: string;
  category?: string;
  name?: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return jsonError(405, "Method not allowed");

  // Drain the request body FIRST. Returning a response before the client has
  // finished uploading a large body resets the connection (ECONNRESET →
  // FUNCTION_INVOCATION_FAILED), masking the real error — so read, then validate.
  let body: TryOnBody;
  try {
    body = (await req.json()) as TryOnBody;
  } catch {
    return jsonError(400, "Invalid JSON");
  }

  const falKey = process.env.FAL_KEY ?? process.env.falkey;
  if (!falKey) return jsonError(503, "FAL_KEY not configured", "Add FAL_KEY to the Vercel environment for this deployment (Preview + Production).");

  if (!body.figure || !body.garment) return jsonError(400, "Missing figure or garment");

  const category = body.category ?? "";
  const fashnCategory = FASHN_CATEGORY[category];

  try {
    let dressedUrl: string;

    if (fashnCategory) {
      // ── Purpose-built try-on (FASHN) ──────────────────────────────────────
      const res = await fal(FASHN_MODEL, falKey, {
        model_image: body.figure,
        garment_image: body.garment,
        category: fashnCategory,
        garment_photo_type: "flat-lay", // our catalog images are flat-lays
        mode: "quality",
        num_samples: 1,
        output_format: "png",
      });
      if (!res.ok) {
        return jsonError(502, "Try-on failed", `FASHN ${res.status}: ${res.text.slice(0, 400)}`);
      }
      const data = res.json as { images?: { url: string }[] };
      const url = data.images?.[0]?.url;
      if (!url) return jsonError(502, "Try-on failed", "FASHN returned no image");
      dressedUrl = url;
    } else {
      // ── Fallback for accessories FASHN doesn't cover (shoes, bag, …) ───────
      const word = NANO_WORD[category] ?? "item";
      const prompt =
        `Two reference images. The FIRST is a full-body photo of a person. The SECOND is a single ${word}` +
        `${body.name ? ` ("${body.name}")` : ""} on a plain background. Add/replace ONLY the person's ${word} ` +
        `with this exact one (same color, material, shape). Keep the person's face, hair, body, pose, position, ` +
        `and background EXACTLY the same. Photorealistic, full body head to toe, no text.`;
      const res = await fal(NANO_MODEL, falKey, {
        prompt,
        image_urls: [body.figure, body.garment],
        num_images: 1,
        output_format: "png",
      });
      if (!res.ok) {
        return jsonError(502, "Try-on failed", `edit ${res.status}: ${res.text.slice(0, 400)}`);
      }
      const data = res.json as { images?: { url: string }[] };
      const url = data.images?.[0]?.url;
      if (!url) return jsonError(502, "Try-on failed", "edit returned no image");
      dressedUrl = url;
    }

    // ── Cut the dressed figure out on transparent bg (best effort) ──────────
    let imageUrl = dressedUrl;
    try {
      const cut = await fal(CUTOUT_MODEL, falKey, { image_url: dressedUrl });
      if (cut.ok) {
        const cutData = cut.json as { image?: { url: string } };
        if (cutData.image?.url) imageUrl = cutData.image.url;
      } else {
        console.error("rembg error:", cut.status, cut.text.slice(0, 200));
      }
    } catch (e) {
      console.error("rembg request failed:", e);
    }

    return json(200, { imageUrl });
  } catch (e) {
    console.error("try-on error:", e);
    return jsonError(500, "Internal server error", e instanceof Error ? e.message : String(e));
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────

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

function json(status: number, obj: unknown): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(status: number, error: string, detail?: string): Response {
  return json(status, detail ? { error, detail } : { error });
}
