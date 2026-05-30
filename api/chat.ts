// Vercel Edge Function — streaming chat with the stylist persona.
// Input: {messages: ChatMessage[], context: {weather, wardrobe[]}}
// Output: text stream of deltas (Content-Type: text/plain)

import Anthropic from "@anthropic-ai/sdk";

export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `את סטייליסטית אישית של המשתמשת. את כותבת בעברית בלבד, נשי, חם, מנוסה — כמו חברה טובה שמבינה אופנה וגם מכירה את הארון שלה. את תמיד מסתמכת על הפריטים שיש לה בארון, ועל מזג האוויר.

עקרונות:
- ענייני וקצרה. 1-3 משפטים אלא אם נשאלת על משהו עמוק יותר.
- אם המשתמשת שואלת ספציפית על פריטים — אזכרי אותם בשמם הקצר ("הז'קט החום", "השמלה השחורה").
- אם אין בארון משהו מתאים — אמרי בכנות ותציעי מה לקנות.
- אל תכתבי בסגנון "אני AI" או "כשפה דיגיטלית" — את הסטייליסטית.
- אם המשתמשת רוצה לוק → תני המלצה ברורה (2-4 פריטים) + הסבר קצר.
- שמרי על תקינות לשונית בעברית: לפעמים לבן הופך ל"לבנה" לפי הקשר.`;

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

interface ChatBody {
  messages: ChatMsg[];
  context: {
    weather?: {
      city: string;
      current: { tempC: number; code: string };
    };
    wardrobe?: Array<{
      id: string;
      name: string;
      category: string;
      color: string;
      season: string;
    }>;
  };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("ANTHROPIC_API_KEY not configured. Add it in Vercel.", {
      status: 503,
    });
  }

  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Build context block (sent in system as cacheable suffix)
  const wardrobeText = (body.context.wardrobe ?? [])
    .map((it) => `- ${it.name} (${it.category}, ${it.color}, ${it.season})`)
    .join("\n");

  const contextBlock = `הקשר נוכחי:
מזג אוויר${body.context.weather ? ` ב-${body.context.weather.city}: ${body.context.weather.current.tempC}°, ${body.context.weather.current.code}` : ": לא זמין"}.

הארון שלה:
${wardrobeText || "(ריק)"}`;

  const client = new Anthropic({ apiKey });

  try {
    const stream = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      stream: true,
      system: `${SYSTEM_PROMPT}\n\n${contextBlock}`,
      messages: body.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Forward only text deltas to client as a plain text stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (e) {
          // Security: Log the detailed error internally but return a generic response
          console.error("Chat streaming error:", e);
          controller.enqueue(
            encoder.encode(`\n[שגיאת שרת פנימית]`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    // Security: Log the detailed error internally but return a generic response
    console.error("Chat handler error:", e);
    return new Response(
      `שגיאת שרת פנימית`,
      { status: 500 }
    );
  }
}
