// Vercel Edge Function — turns a selfie into a realistic full-body "you",
// composited INTO the wardrobe room (so the lighting matches), then cut out on
// a transparent background so it drops in as the avatar layer over the room.
// Input: {selfie, roomUrl, items?} → Output: {imageUrl}  (transparent PNG)
// Engine: fal.ai → Nano Banana edit (identity + scene blend) → rembg (cutout).

export const config = { runtime: "edge" };

const FAL_MODEL = process.env.FAL_AVATAR_MODEL || "fal-ai/nano-banana/edit";
const FAL_CUTOUT_MODEL = process.env.FAL_CUTOUT_MODEL || "fal-ai/imageutils/rembg";

const CATEGORY_WORD: Record<string, string> = {
  top: "top / shirt", bottom: "trousers", dress: "dress", outerwear: "jacket or coat",
  underwear: "base layer", socks: "socks", shoes: "shoes", bag: "bag", accessory: "accessory",
};

interface AvatarItem { name?: string; category: string; color?: string; colorHex?: string; material?: string }
interface GenerateBody { selfie: string; roomUrl?: string; items?: AvatarItem[] }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const falKey = process.env.FAL_KEY ?? process.env.falkey;
  if (!falKey) return jsonError(503, "FAL_KEY not configured");

  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return jsonError(400, "Invalid JSON");
  }
  if (!body.selfie) return jsonError(400, "Missing selfie");

  const items = body.items ?? [];
  const outfit = items.length
    ? items.map((it) => {
        const word = CATEGORY_WORD[it.category] ?? it.category;
        const color = it.color || it.colorHex || "";
        const material = it.material ? `${it.material} ` : "";
        return `a ${color} ${material}${word}`.replace(/\s+/g, " ").trim();
      }).join(", ")
    : "a simple neutral outfit (plain tee and slim trousers)";

  // If a room image is given, composite the person INTO it (best blend).
  // Otherwise render on plain white (still works, just less integrated).
  const inRoom = !!body.roomUrl;
  const prompt = inRoom
    ? `Full-body realistic photograph of the SAME person from the LAST reference image — keep their exact face and identity. Place them standing naturally in the empty standing area to the RIGHT of the wardrobe in the FIRST reference room, wearing ${outfit}. FULLY blend them into the scene: lit by the same warm room light, with a natural soft cast shadow on the rug under their feet, feet grounded on the floor, natural human proportion to the wardrobe, full body head to toe with a little space above the head. Photorealistic, seamlessly present in the room — not pasted, not a cartoon. Tall vertical 9:16 phone photo, no text.`
    : `Full-body realistic photograph of the same person from the reference image, keeping their exact face and identity, wearing ${outfit}, standing relaxed and natural, full body head to toe, on a plain pure white seamless studio background, soft even lighting, photorealistic, no text.`;

  const imageUrls = inRoom ? [body.roomUrl as string, body.selfie] : [body.selfie];

  try {
    // 1) Generate the realistic "you", composited into the room.
    const genRes = await fetch(`https://fal.run/${FAL_MODEL}`, {
      method: "POST",
      headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, image_urls: imageUrls, num_images: 1, output_format: "png" }),
    });
    if (!genRes.ok) {
      console.error("fal gen error:", genRes.status, await genRes.text().catch(() => ""));
      return jsonError(502, "Image generation failed");
    }
    const genData = (await genRes.json()) as { images?: { url: string }[] };
    const sceneUrl = genData.images?.[0]?.url;
    if (!sceneUrl) {
      console.error("fal gen returned no image");
      return jsonError(502, "Image generation failed");
    }

    // 2) Cut the figure out on transparent bg so it layers over the room/videos.
    let imageUrl = sceneUrl;
    try {
      const cutRes = await fetch(`https://fal.run/${FAL_CUTOUT_MODEL}`, {
        method: "POST",
        headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: sceneUrl }),
      });
      if (cutRes.ok) {
        const cutData = (await cutRes.json()) as { image?: { url: string } };
        if (cutData.image?.url) imageUrl = cutData.image.url;
      } else {
        console.error("fal cutout error:", cutRes.status, await cutRes.text().catch(() => ""));
      }
    } catch (e) {
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
  return new Response(JSON.stringify({ error: message }), { status, headers: { "Content-Type": "application/json" } });
}
