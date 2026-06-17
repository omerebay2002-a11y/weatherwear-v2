// Vercel Edge Function — renders the user (from a selfie) as a realistic
// full-body figure, on a transparent background so it layers into the room
// exactly like the mannequin cutout.
// Input: {selfie (data URL or https), items?[]} → Output: {imageUrl}  (transparent PNG)
// Engine: fal.ai → Nano Banana edit (identity) → rembg (cutout).

export const config = { runtime: "edge" };

const FAL_MODEL = process.env.FAL_AVATAR_MODEL || "fal-ai/nano-banana/edit";
const FAL_CUTOUT_MODEL = process.env.FAL_CUTOUT_MODEL || "fal-ai/imageutils/rembg";

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
  items?: AvatarItem[];
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const falKey = process.env.FAL_KEY;
  if (!falKey) return jsonError(503, "FAL_KEY not configured");

  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return jsonError(400, "Invalid JSON");
  }

  if (!body.selfie) return jsonError(400, "Missing selfie");

  // Outfit description — the real wardrobe look, or a clean neutral default
  // (so the selfie feature works even before the user picks an outfit).
  const items = body.items ?? [];
  const outfit = items.length
    ? items
        .map((it) => {
          const word = CATEGORY_WORD[it.category] ?? it.category;
          const color = it.color || it.colorHex || "";
          const material = it.material ? `${it.material} ` : "";
          const name = it.name ? ` (${it.name})` : "";
          return `- a ${color} ${material}${word}${name}`.replace(/\s+/g, " ").trim();
        })
        .join("\n")
    : "- a plain light grey fitted t-shirt\n- slim off-white trousers\n- simple neutral shoes";

  const prompt = `Full-body fashion lookbook photograph of the person in the reference image, preserving their exact face, identity, body and skin tone. They are wearing this complete outfit:
${outfit}

Standing in a relaxed, natural, confident pose, full body visible from head to toe including feet. PLAIN PURE WHITE seamless studio background, soft even lighting, no shadows on the background. Photorealistic, sharp focus, editorial fashion style. Do not add any text, logos, or watermarks. Keep it the same real person — not a cartoon, not an illustration.`;

  try {
    // 1) Generate the realistic full-body "you".
    const genRes = await fetch(`https://fal.run/${FAL_MODEL}`, {
      method: "POST",
      headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, image_urls: [body.selfie], num_images: 1, output_format: "jpeg" }),
    });
    if (!genRes.ok) {
      console.error("fal gen error:", genRes.status, await genRes.text().catch(() => ""));
      return jsonError(502, "Image generation failed");
    }
    const genData = (await genRes.json()) as { images?: { url: string }[] };
    const personUrl = genData.images?.[0]?.url;
    if (!personUrl) {
      console.error("fal gen returned no image");
      return jsonError(502, "Image generation failed");
    }

    // 2) Remove the background → transparent cutout that layers into the room.
    let imageUrl = personUrl;
    try {
      const cutRes = await fetch(`https://fal.run/${FAL_CUTOUT_MODEL}`, {
        method: "POST",
        headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: personUrl }),
      });
      if (cutRes.ok) {
        const cutData = (await cutRes.json()) as { image?: { url: string } };
        if (cutData.image?.url) imageUrl = cutData.image.url;
      } else {
        console.error("fal cutout error:", cutRes.status, await cutRes.text().catch(() => ""));
      }
    } catch (e) {
      // Non-fatal: fall back to the person-on-white image if cutout fails.
      console.error("cutout request failed:", e);
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
