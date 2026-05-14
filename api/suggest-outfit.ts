// Vercel Edge Function — suggests an outfit from the user's wardrobe.
// Input: {weather, occasion, when, wardrobe[]} → Output: {itemIds[], explanation}

import Anthropic from "@anthropic-ai/sdk";

export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `את סטייליסטית אישית מנוסה שכותבת בעברית. בהינתן ארון לבוש מסויים, מזג אוויר, ואירוע — בחרי 3-5 פריטים מהארון שיוצרים לוק שלם ומתאים. החזירי JSON תקני בלבד.

הפלט המבוקש:
{
  "itemIds": ["id1", "id2", ...],   // 3-5 IDs מהארון בלבד. אסור להמציא IDs.
  "explanation": "1-2 משפטים בעברית למה הלוק הזה — קישרי לטמפרטורה ולאירוע, אישי וחם"
}

עקרונות:
- בחרי לפחות חולצה+מכנסיים+נעליים, או שמלה+נעליים. הוסיפי מעיל אם קר. אקססוריז זה בונוס.
- אם הטמפרטורה מתחת ל-15° — חובה מעיל אם יש בארון.
- אם זה ספורט — רק פריטים סגנון casual או sport.
- אם ערב — עדיפות ל-formal/smart.
- אם אין מספיק פריטים מתאימים — קחי את מה שיש, אל תמציאי.
- אסור להמציא IDs. רק מהרשימה שניתנה.
- ההסבר צריך להיות חמים, אישי, כמו של חברה טובה. לא יבש.
- החזירי JSON תקני בלי backticks ובלי \`\`\`json wrapper.`;

const OCCASION_LABEL: Record<string, string> = {
  work: "פגישת עבודה",
  evening: "ערב יציאה",
  casual: "יומיום",
  sport: "פעילות ספורט",
};

const WHEN_LABEL: Record<string, string> = {
  now: "עכשיו",
  "tomorrow-morning": "מחר בבוקר",
  "tomorrow-evening": "מחר בערב",
};

interface SuggestBody {
  weather: {
    city: string;
    current: { tempC: number; code: string; feelsLikeC?: number };
    daily: { date: string; minC: number; maxC: number; code: string }[];
  };
  occasion: string;
  when: string;
  wardrobe: Array<{
    id: string;
    name: string;
    category: string;
    color: string;
    material?: string;
    season: string;
    formality?: string;
  }>;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return jsonError(503, "ANTHROPIC_API_KEY not configured");

  let body: SuggestBody;
  try {
    body = (await req.json()) as SuggestBody;
  } catch {
    return jsonError(400, "Invalid JSON");
  }

  if (!body.wardrobe || body.wardrobe.length === 0) {
    return new Response(
      JSON.stringify({ itemIds: [], explanation: "הארון ריק — הוסיפי כמה פריטים ואחזור." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const tempForWhen =
    body.when === "now"
      ? body.weather.current.tempC
      : body.when === "tomorrow-morning"
      ? body.weather.daily?.[1]?.minC ?? body.weather.current.tempC
      : body.weather.daily?.[1]?.maxC ?? body.weather.current.tempC;

  const wardrobeText = body.wardrobe
    .map(
      (it) =>
        `- ${it.id} — ${it.name} (${it.category}, ${it.color}${
          it.material ? ", " + it.material : ""
        }, ${it.season}${it.formality ? ", " + it.formality : ""})`
    )
    .join("\n");

  const userPrompt = `מזג אוויר ב-${body.weather.city}: ${body.weather.current.tempC}°, ${body.weather.current.code}.
טמפרטורה ל"${WHEN_LABEL[body.when] ?? body.when}": ${tempForWhen}°.
אירוע: ${OCCASION_LABEL[body.occasion] ?? body.occasion}.

הארון שלה (id — תיאור):
${wardrobeText}

החזירי JSON תקני בלבד עם itemIds (3-5 מהרשימה) ו-explanation בעברית.`;

  const client = new Anthropic({ apiKey });

  try {
    const result = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = result.content
      .filter((c): c is Anthropic.TextBlock => c.type === "text")
      .map((c) => c.text)
      .join("");
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return jsonError(502, `Bad model output: ${text.slice(0, 200)}`);
    const parsed = JSON.parse(jsonMatch[0]);

    // Validate item IDs exist in wardrobe
    const validIds = new Set(body.wardrobe.map((it) => it.id));
    const itemIds = (parsed.itemIds || []).filter((id: string) => validIds.has(id));

    return new Response(
      JSON.stringify({
        itemIds,
        explanation: typeof parsed.explanation === "string" ? parsed.explanation : "",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Anthropic Suggest Outfit API Error:", e);
    return jsonError(500, "An internal server error occurred while processing the request.");
  }
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
