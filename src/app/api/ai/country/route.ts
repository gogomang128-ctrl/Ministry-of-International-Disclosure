import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { countryBriefs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { aiEnabled, askGemini, extractJson } from "@/lib/ai";

export const dynamic = "force-dynamic";

const FRESH_MS = 12 * 3600_000; // صلاحية الملف المخزن: 12 ساعة

interface Issue {
  title: string;
  severity: string;
  summary: string;
  source: string;
  url: string;
}

function buildPrompt(nameAr: string, nameEn: string) {
  return `أنت محلل استخباراتي في مركز رصد دولي. باستخدام البحث المباشر في أخبار هذا الأسبوع، أعد ملفًا استخباراتيًا موجزًا ومحايدًا عن «${nameAr}» (${nameEn}).
المطلوب: أهم 4 قضايا/مشكلات راهنة تواجه البلاد حاليًا (أمنية، اقتصادية، إنسانية، سياسية...) بدقة ومصادر حقيقية.
أعد كائن JSON فقط بدون أي نص آخر أو ماركداون:
{"issues":[{"title":"عنوان عربي موجز","severity":"high أو medium أو low","summary":"ملخص عربي من جملتين موثق بالوقائع","source":"اسم المصدر الصحفي","url":"رابط المصدر المباشر الحقيقي"}],"note":"سطر تقييم عام للوضع باللغة العربية"}
قواعد صارمة: لا تخترع أحداثًا أو روابط، واعتمد فقط على نتائج البحث الحقيقية أمامك الآن، وحافظ على حياد تام.`;
}

function validIssue(raw: unknown): Issue | null {
  if (typeof raw !== "object" || !raw) return null;
  const o = raw as Record<string, unknown>;
  const title = String(o.title ?? "").trim();
  const summary = String(o.summary ?? "").trim();
  if (title.length < 5 || summary.length < 15) return null;
  return {
    title: title.slice(0, 120),
    severity: ["high", "medium", "low"].includes(String(o.severity)) ? String(o.severity) : "medium",
    summary: summary.slice(0, 400),
    source: String(o.source ?? "مصدر موثوق").slice(0, 90),
    url: String(o.url ?? "").slice(0, 300),
  };
}

export async function GET(req: NextRequest) {
  const key = (req.nextUrl.searchParams.get("key") ?? "").trim().slice(0, 110);
  const nameAr = (req.nextUrl.searchParams.get("ar") ?? "").trim().slice(0, 120);
  const nameEn = (req.nextUrl.searchParams.get("en") ?? "").trim().slice(0, 120);
  if (!key || !nameAr) {
    return NextResponse.json({ ok: false, error: "معرّف الدولة واسمها مطلوبان." }, { status: 400 });
  }

  // 1) الذاكرة الثابتة — القاعدة
  try {
    const [cached] = await db.select().from(countryBriefs).where(eq(countryBriefs.key, key)).limit(1);
    if (cached) {
      const age = Date.now() - new Date(cached.updatedAt).getTime();
      if (age < FRESH_MS) {
        return NextResponse.json({
          ok: true,
          cached: true,
          updatedAt: cached.updatedAt,
          payload: JSON.parse(cached.payload),
        });
      }
    }
  } catch {
    /* تابع التوليد */
  }

  if (!aiEnabled()) {
    return NextResponse.json({ ok: false, error: "محرك الذكاء الاصطناعي غير مفعّل حاليًا." }, { status: 503 });
  }

  // 2) توليد جديد عبر محرك البحث الموثق
  const text = await askGemini(buildPrompt(nameAr, nameEn || nameAr));
  const parsed = text ? extractJson<{ issues?: unknown[]; note?: string }>(text) : null;
  const issues = (Array.isArray(parsed?.issues) ? parsed!.issues : [])
    .map(validIssue)
    .filter((x): x is Issue => x !== null)
    .slice(0, 5);

  if (!issues.length) {
    // محاولة الرجوع لنسخة منتهية الصلاحية بدلًا من الفشل
    try {
      const [stale] = await db.select().from(countryBriefs).where(eq(countryBriefs.key, key)).limit(1);
      if (stale) {
        return NextResponse.json({ ok: true, cached: true, stale: true, updatedAt: stale.updatedAt, payload: JSON.parse(stale.payload) });
      }
    } catch {
      /* لا يوجد */
    }
    return NextResponse.json(
      { ok: false, error: "تعذّر إنتاج ملف موثق الآن — أعد المحاولة بعد لحظات." },
      { status: 502 }
    );
  }

  const payload = { issues, note: String(parsed?.note ?? "").slice(0, 300), nameAr };
  try {
    await db
      .insert(countryBriefs)
      .values({ key, nameAr, payload: JSON.stringify(payload) })
      .onConflictDoUpdate({ target: countryBriefs.key, set: { payload: JSON.stringify(payload), updatedAt: new Date() } });
  } catch {
    /* غير حرج */
  }

  return NextResponse.json({ ok: true, cached: false, updatedAt: new Date().toISOString(), payload });
}
