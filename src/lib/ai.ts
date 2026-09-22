/**
 * محرك التحليل الاستخباراتي — عميل Gemini مع بحث Google الموثق بالمصادر.
 * يعمل خادميًا فقط: المفتاح لا يغادر الخادم أبدًا.
 */

const API_KEY = process.env.GEMINI_API_KEY;
const MODELS = ["gemini-2.5-flash"];
const RETRY_DELAYS = [1500, 4000, 8000];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface GeminiPart {
  text?: string;
}

interface GeminiResponse {
  candidates?: {
    content?: { parts?: GeminiPart[] };
    groundingMetadata?: unknown;
  }[];
}

export function aiEnabled() {
  return Boolean(API_KEY);
}

export async function askGemini(prompt: string, timeoutMs = 55_000): Promise<string | null> {
  if (!API_KEY) return null;

  for (const model of MODELS) {
    for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": API_KEY,
            },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              tools: [{ googleSearch: {} }],
              generationConfig: {
                temperature: 0.15,
                maxOutputTokens: 6000,
                thinkingConfig: { thinkingBudget: 0 },
              },
            }),
            cache: "no-store",
            signal: controller.signal,
          }
        );
        clearTimeout(timer);

        if (res.status === 503 || res.status === 429) {
          if (attempt < RETRY_DELAYS.length) {
            await sleep(RETRY_DELAYS[attempt]);
            continue; // إعادة المحاولة مع تدرج زمني — النموذج يتعرض لضغط متقطع
          }
          break; // نموذج آخر
        }
        if (!res.ok) break;

        const data = (await res.json()) as GeminiResponse;
        const text = data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .filter(Boolean)
          .join("\n")
          .trim();
        if (text && text.length > 20) return text;
        break;
      } catch {
        break;
      }
    }
  }
  return null;
}

/** يستخرج مصفوفة أو كائن JSON حتى لو أُحيط بأقفال ماركداون أو قُصّ في المنتصف. */
export function extractJson<T = unknown>(raw: string): T | null {
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.search(/[[{]/);
  if (start === -1) return null;
  const open = cleaned[start];
  const close = open === "[" ? "]" : "}";
  const end = cleaned.lastIndexOf(close);

  if (end > start) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1)) as T;
    } catch {
      /* يجرب الإصلاح */
    }
  }

  // إصلاح: الناتج قُصّ — أغلق المصفوفة عند آخر عنصر مكتمل
  if (open === "[") {
    const lastObj = cleaned.lastIndexOf("}");
    if (lastObj > start) {
      try {
        return JSON.parse(cleaned.slice(start, lastObj + 1) + "]") as T;
      } catch {
        return null;
      }
    }
  }
  return null;
}
