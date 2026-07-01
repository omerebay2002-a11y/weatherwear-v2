// Vercel Edge Function — renders the user wearing an outfit.
// Input: {selfie (data URL or https), items[]} → Output: {imageUrl}
// Engine: fal.ai → Nano Banana (Gemini Flash Image) "edit", identity-preserving.

export const config = { runtime: "edge" };

// Overridable so we can A/B Nano Banana vs other fal models without a code change.
const FAL_MODEL = process.env.FAL_AVATAR_MODEL || "fal-ai/nano-banana/edit";

// ClothingCategory → English garment word for the image prompt.
const CATEGORY_WORD: Record<string, string> = {
  top: "top / shirt",
  bottom: "trousers",
  dress: "dress",
  outerwear: "jacket or coat",
  underwear: "base layer",
  socks: "socks",
  shoes: "shoes",
  bag: "bag",
  accessory: "accessory",
};

interface AvatarItem {
  name?: string;
  category: string;
  color?: string;
  colorHex?: string;
  material?: string;
}

interface GenerateBody {
  selfie: string; // data URL (data:image/...) or https URL
  items: AvatarItem[];
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const falKey = process.env.FAL_KEY;
  if (!falKey) return jsonError(503, "FAL_KEY not configured");

  let body: GenerateBody;
  try {
    const raw = await req.text();
    if (raw.length > 4194304) {
      return jsonError(413, "Payload too large");
    }
    body = JSON.parse(raw) as GenerateBody;
  } catch {
    return jsonError(400, "Invalid JSON");
  }

  if (!body.selfie) return jsonError(400, "Missing selfie");
  if (!body.items || body.items.length === 0) return jsonError(400, "No outfit items");

  const garments = body.items
    .map((it) => {
      const word = CATEGORY_WORD[it.category] ?? it.category;
      const color = it.color || it.colorHex || "";
      const material = it.material ? `${it.material} ` : "";
      const name = it.name ? ` (${it.name})` : "";
      return `- a ${color} ${material}${word}${name}`.replace(/\s+/g, " ").trim();
    })
    .join("\n");

  const prompt = `Full-body fashion lookbook photograph of the person in the reference image, preserving their exact face, identity, body and skin tone. They are wearing this complete outfit:
${garments}

Standing in a relaxed, natural, confident pose, full body visible from head to toe. Clean bright photo studio with a plain light-grey seamless background. Soft, even studio lighting. Photorealistic, sharp focus, editorial fashion style. Do not add any text, logos, or watermarks. Keep it the same real person — not a cartoon, not an illustration.`;

  try {
    // fal synchronous endpoint — blocks until the image is ready (well within maxDuration 30s).
    const r = await fetch(`https://fal.run/${FAL_MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${falKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_urls: [body.selfie],
        num_images: 1,
        output_format: "jpeg",
      }),
    });

    if (!r.ok) {
      // SECURITY: log details server-side only; return a generic message.
      console.error("fal error:", r.status, await r.text().catch(() => ""));
      return jsonError(502, "Image generation failed");
    }

    const data = (await r.json()) as { images?: { url: string }[] };
    const imageUrl = data.images?.[0]?.url;
    if (!imageUrl) {
      console.error("fal returned no image:", JSON.stringify(data).slice(0, 300));
      return jsonError(502, "Image generation failed");
    }

    return new Response(JSON.stringify({ imageUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-avatar error:", e);
    return jsonError(500, "Internal server error");
  }
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
