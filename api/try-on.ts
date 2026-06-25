// Vercel Edge Function — virtual try-on. Takes the avatar figure that is
// currently standing in the room plus ONE garment image (a real /catalog flat-lay
// or a user photo) and dresses the figure in that exact garment, keeping the
// face, body, pose, and framing identical so it stays aligned in the room layer.
// Input:  { figure, garment, category?, name? }   (figure/garment = url or data URL)
// Output: { imageUrl }                              (transparent PNG cutout)
// Engine: fal.ai → Nano Banana edit (garment swap) → rembg (cutout).

export const config = { runtime: "edge" };

const FAL_MODEL = process.env.FAL_TRYON_MODEL || "fal-ai/nano-banana/edit";
const FAL_CUTOUT_MODEL = process.env.FAL_CUTOUT_MODEL || "fal-ai/imageutils/rembg";

const CATEGORY_WORD: Record<string, string> = {
  top: "top / shirt",
  bottom: "trousers / bottoms",
  dress: "dress",
  outerwear: "jacket or coat",
  underwear: "base layer",
  socks: "socks",
  shoes: "shoes",
  bag: "bag",
  accessory: "accessory",
};

interface TryOnBody {
  figure: string; // current avatar (url or data URL)
  garment: string; // garment image (url or data URL)
  category?: string;
  name?: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const falKey = process.env.FAL_KEY;
  if (!falKey) return jsonError(503, "FAL_KEY not configured");

  let body: TryOnBody;
  try {
    body = (await req.json()) as TryOnBody;
  } catch {
    return jsonError(400, "Invalid JSON");
  }
  if (!body.figure || !body.garment) return jsonError(400, "Missing figure or garment");

  const word = CATEGORY_WORD[body.category ?? ""] ?? "garment";

  const prompt =
    `Two reference images. The FIRST image is a full-body photo of a person standing. ` +
    `The SECOND image is a single clothing item — a ${word}${body.name ? ` ("${body.name}")` : ""} — shown on a plain background. ` +
    `Dress the person from the FIRST image in this EXACT ${word}: same color, pattern, fabric, and cut as shown in the SECOND image. ` +
    `Keep the person's face, hair, skin, body shape, pose, position, and the background EXACTLY the same — change ONLY their ${word}. ` +
    `The garment must drape naturally with realistic folds, and its lighting and shadows must match the person's photo. ` +
    `Photorealistic, full body head to toe, no text, no extra props.`;

  try {
    // 1) Dress the figure in the garment.
    const genRes = await fetch(`https://fal.run/${FAL_MODEL}`, {
      method: "POST",
      headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        image_urls: [body.figure, body.garment],
        num_images: 1,
        output_format: "png",
      }),
    });
    if (!genRes.ok) {
      console.error("fal try-on error:", genRes.status, await genRes.text().catch(() => ""));
      return jsonError(502, "Try-on failed");
    }
    const genData = (await genRes.json()) as { images?: { url: string }[] };
    const sceneUrl = genData.images?.[0]?.url;
    if (!sceneUrl) {
      console.error("fal try-on returned no image");
      return jsonError(502, "Try-on failed");
    }

    // 2) Cut the dressed figure out on transparent bg so it layers over the room.
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
    console.error("try-on error:", e);
    return jsonError(500, "Internal server error");
  }
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
