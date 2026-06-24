// Vercel Edge Function — onboarding style analysis.
// Receives the user's profile + a few outfit photos, returns a JSON array of
// wardrobe items the person likely owns (seen in the photos or strongly implied).

import Anthropic from "@anthropic-ai/sdk";

export const config = { runtime: "edge" };

const VALID_CATEGORIES = new Set([
  "top", "bottom", "dress", "outerwear", "underwear", "socks", "shoes", "bag", "accessory",
]);
const VALID_SEASONS = new Set(["summer", "winter", "all"]);
const VALID_FORMALITY = new Set(["casual", "smart", "formal", "sport"]);

const SYSTEM_PROMPT = `את סטייליסטית שמנתחת תמונות אאוטפיטים של אדם אחד כדי למפות את הארון שלו. כתבי בעברית.

החזירי אך ורק מערך JSON תקני (בלי markdown, בלי טקסט נוסף) של עד 35 פריטי לבוש:

[
  {
    "name": "תיאור קצר בעברית, למשל: ג׳ינס כחול בגזרה ישרה",
    "category": "top" | "bottom" | "dress" | "outerwear" | "underwear" | "socks" | "shoes" | "bag" | "accessory",
    "color": "שם הצבע בעברית",
    "colorHex": "#RRGGBB",
    "season": "summer" | "winter" | "all",
    "formality": "casual" | "smart" | "formal" | "sport"
  }
]

הנחיות:
- כללי קודם כל את הפריטים שממש נראים בתמונות (אלה הוודאיים).
- אחר כך הוסיפי פריטים שסביר מאוד שיש לאדם הזה לפי הסגנון שזיהית (וריאציות צבע של מה שנראה, פריטים משלימים באותו סגנון).
- שמרי על שמות קצרים וכלליים (בלי מותגים אלא אם הם ברורים בתמונה).
- אל תמציאי פריטים שלא מסתדרים עם הסגנון שבתמונות.`;

interface StyleBody {
  wardrobeFor?: string;
  ageRange?: string;
  styles?: string[];
  images?: string[]; // data URLs
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonError(503, "Service not configured");
  }

  let body: StyleBody;
  try {
    const text = await req.text();
    if (text.length > 10 * 1024 * 1024) {
      return jsonError(413, "Payload Too Large");
    }
    body = JSON.parse(text) as StyleBody;
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const images = (body.images ?? []).slice(0, 6);
  if (images.length === 0) {
    return jsonError(400, "No images provided");
  }

  const content: Anthropic.MessageParam["content"] = [];
  for (const dataUrl of images) {
    const m = /^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,(.+)$/.exec(dataUrl);
    if (!m) return jsonError(400, "Invalid image data URL");
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: m[1] as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
        data: m[2],
      },
    });
  }

  const profileLine = [
    body.wardrobeFor ? `הארון בשביל: ${body.wardrobeFor === "woman" ? "אישה" : body.wardrobeFor === "man" ? "גבר" : "מעורב"}` : "",
    body.ageRange ? `גיל: ${body.ageRange}` : "",
    body.styles?.length ? `סגנונות שנבחרו: ${body.styles.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  content.push({
    type: "text",
    text: `אלה תמונות אאוטפיטים של אותו אדם. ${profileLine}\nנתחי את הסגנון והחזירי מערך JSON בלבד של פריטי הארון.`,
  });

  try {
    const client = new Anthropic({ apiKey });
    const result = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    });

    const text = result.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("");

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return jsonError(502, "Could not parse analysis result");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return jsonError(502, "Could not parse analysis result");
    }
    if (!Array.isArray(parsed)) {
      return jsonError(502, "Could not parse analysis result");
    }

    // Keep only well-formed items the client can trust blindly
    const items = parsed
      .filter((it): it is Record<string, unknown> => !!it && typeof it === "object")
      .filter(
        (it) =>
          typeof it.name === "string" &&
          it.name.trim() &&
          VALID_CATEGORIES.has(it.category as string) &&
          typeof it.color === "string" &&
          /^#[0-9a-fA-F]{6}$/.test(it.colorHex as string)
      )
      .map((it) => ({
        name: (it.name as string).trim().slice(0, 80),
        category: it.category,
        color: (it.color as string).trim().slice(0, 40),
        colorHex: it.colorHex,
        season: VALID_SEASONS.has(it.season as string) ? it.season : "all",
        formality: VALID_FORMALITY.has(it.formality as string) ? it.formality : undefined,
      }))
      .slice(0, 35);

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    // SECURITY: Log detailed errors server-side only to prevent information disclosure
    console.error("Anthropic API Error (analyze-style):", e);
    return jsonError(500, "Internal server error");
  }
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
