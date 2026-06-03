// Vercel Edge Function — analyzes clothing from photo or Hebrew text description.
// Returns structured JSON: {name, category, color, colorHex, material?, brand?, model?, season, formality?}

import Anthropic from "@anthropic-ai/sdk";

export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `אתה עוזר זיהוי בגדים שכותב בעברית. תפקידך לזהות פריט לבוש בודד מתמונה או מתיאור מילולי, ולהחזיר JSON תקני בלבד — בלי טקסט נוסף, בלי הסבר, בלי markdown.

תמיד החזר אובייקט JSON אחד עם השדות הבאים:

{
  "name": "תיאור קצר ומדויק בעברית, לדוגמה: ג׳ינס Levi's 501 כחול כהה",
  "category": "top" | "bottom" | "dress" | "outerwear" | "underwear" | "socks" | "shoes" | "bag" | "accessory",
  "color": "שם הצבע בעברית, לדוגמה: שחור, כחול ג׳ינס, ורוד עתיק",
  "colorHex": "#RRGGBB — קוד הקסדצימלי מדויק של הצבע הראשי",
  "material": "cotton" | "denim" | "wool" | "linen" | "silk" | "leather" | "synthetic" | "other" | null,
  "brand": "המותג אם נראה לוגו או מוכר, אחרת null",
  "model": "שם הדגם אם מזוהה (למשל '501', 'Air Force 1'), אחרת null",
  "season": "summer" | "winter" | "all",
  "formality": "casual" | "smart" | "formal" | "sport" | null
}

הנחיות:
- אם בתמונה יש כמה פריטים, התמקד בפריט המרכזי (הגדול ביותר / החזיתי).
- אם השדה לא מזוהה — החזר null, לא ניחוש.
- חולצה/טישרט/סוודר/הודי: top. מכנסיים/ג'ינס/שורט: bottom. שמלה: dress. ז'קט/מעיל: outerwear. תחתון/בוקסר/חזייה: underwear. גרביים/גרביונים: socks. נעליים/סנדלים: shoes. תיק/תרמיל: bag. תכשיט/שעון/משקפיים/חגורה/כובע: accessory.
- מותג: רק אם וודאי. ספק -> null.
- החזר JSON תקני בלי backticks ובלי json wrapper.`;

interface AnalyzeBody {
  mode: "image" | "text";
  imageBase64?: string;
  text?: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonError(
      503,
      "ANTHROPIC_API_KEY not configured. Add it in Vercel -> Settings -> Environment Variables."
    );
  }

  let body: AnalyzeBody;
  try {
    body = (await req.json()) as AnalyzeBody;
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const client = new Anthropic({ apiKey });

  let userContent: Anthropic.MessageParam["content"];
  let model: string;

  if (body.mode === "image") {
    const dataUrl = body.imageBase64 ?? "";
    const m = /^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,(.+)$/.exec(dataUrl);
    if (!m) return jsonError(400, "Invalid image data URL");
    const mediaType = m[1] as "image/jpeg" | "image/png" | "image/webp" | "image/gif";
    userContent = [
      {
        type: "image",
        source: { type: "base64", media_type: mediaType, data: m[2] },
      },
      {
        type: "text",
        text: "נתחי את הפריט בתמונה. החזירי JSON בלבד, ללא שום טקסט נוסף.",
      },
    ];
    model = "claude-sonnet-4-6";
  } else {
    if (!body.text || !body.text.trim()) {
      return jsonError(400, "Empty text input");
    }
    userContent = [
      {
        type: "text",
        text: `נתחי את התיאור הבא ויחזירי JSON בלבד:\n\n"${body.text.trim()}"`,
      },
    ];
    model = "claude-haiku-4-5-20251001";
  }

  try {
    const result = await client.messages.create({
      model,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const text = result.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("");

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      // SEC: Log detailed error server-side, do not leak to client
      console.error("Could not parse JSON. Raw:", text.slice(0, 200));
      return jsonError(502, "שגיאת שרת פנימית (Invalid model output)");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      // SEC: Log detailed error server-side, do not leak to client
      console.error("Malformed JSON from model:", jsonMatch[0].slice(0, 200), e);
      return jsonError(502, "שגיאת שרת פנימית (Malformed model output)");
    }

    const obj = parsed as Record<string, unknown>;
    for (const k of ["material", "brand", "model", "formality"]) {
      if (obj[k] === null) delete obj[k];
    }

    return new Response(JSON.stringify(obj), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    // SEC: Log detailed error server-side, do not leak to client
    console.error("Anthropic error in analyze-clothing:", e);
    return jsonError(500, "שגיאת שרת פנימית");
  }
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
