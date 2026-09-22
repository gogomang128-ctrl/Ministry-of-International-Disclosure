import { NextResponse } from "next/server";
import { db } from "@/db";
import { aiIntel } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { aiEnabled, askGemini, extractJson } from "@/lib/ai";

export const dynamic = "force-dynamic";

const TTL = 60_000; // تحديث خارجي أقصاه مرة كل دقيقة — القراءات المحلية لحظية

interface IntelItem {
  title: string;
  region: string;
  country: string;
  severity: string;
  summary: string;
  source: string;
  url: string;
  at: string;
}

interface IntelCache {
  items: IntelItem[];
  refreshedAt: number;
  ok: boolean;
  inflight: Promise<void> | null;
  loadedFromDb: boolean;
}

const g = globalThis as typeof globalThis & { __intelCache?: IntelCache };
const cache: IntelCache =
  g.__intelCache ??
  (g.__intelCache = { items: [], refreshedAt: 0, ok: true, inflight: null, loadedFromDb: false });

const PROMPT = `أنت محلل استخباراتي في مركز رصد دولي. باستخدام البحث المباشر في أخبار اليوم، اجمع أهم 10 تطورات حقيقية موثقة خلال آخر 48 ساعة حول الحروب والنزاعات المسلحة والتوترات العسكرية في العالم (أوكرانيا، الشرق الأوسط، أفريقيا، آسيا، الأمريكتان...).
أعد مصفوفة JSON فقط بدون أي نص إضافي أو تنسيق ماركداون، بهذا الشكل بالضبط:
[{"title":"عنوان عربي موجز (حتى 14 كلمة)","region":"الإقليم الجغرافي بالعربية","country":"الدولة الأبرز بالعربية","severity":"war أو escalation أو clashes أو tension أو ceasefire","summary":"ملخص عربي محايد من جملتين يوضح ماذا حدث فعليًا","source":"اسم المصدر الصحفي الموثوق الذي وجدته","url":"الرابط المباشر الحقيقي للمصدر"}]
قواعد صارمة: كل معلومة يجب أن تستند لنتيجة بحث حقيقية أمامك الآن، ولا تخترع روابط أو أحداثًا، ورتّب العناصر من الأهم إلى الأقل أهمية.`;

function validate(raw: unknown): IntelItem | null {
  if (typeof raw !== "object" || !raw) return null;
  const o = raw as Record<string, unknown>;
  const title = String(o.title ?? "").trim();
  const summary = String(o.summary ?? "").trim();
  const url = String(o.url ?? "").trim();
  if (title.length < 8 || summary.length < 20) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  const sev = ["war", "escalation", "clashes", "tension", "ceasefire"].includes(String(o.severity))
    ? String(o.severity)
    : "tension";
  return {
    title: title.slice(0, 140),
    region: String(o.region ?? "العالم").slice(0, 60),
    country: String(o.country ?? "").slice(0, 60),
    severity: sev,
    summary: summary.slice(0, 400),
    source: String(o.source ?? "مصدر موثوق").slice(0, 90),
    url: url.slice(0, 300),
    at: new Date().toISOString(),
  };
}

async function refreshLock(): Promise<void> {
  if (cache.inflight) return cache.inflight;
  cache.inflight = (async () => {
    try {
      const text = await askGemini(PROMPT);
      const arr = text ? extractJson<unknown[]>(text) : null;
      const items = (Array.isArray(arr) ? arr : [])
        .map(validate)
        .filter((x): x is IntelItem => x !== null)
        .slice(0, 14);

      if (items.length) {
        // دمج مع التخزين الحالي وإزالة التكرار حسب بداية العنوان
        const seen = new Set<string>();
        const merged: IntelItem[] = [];
        for (const it of [...items, ...cache.items]) {
          const k = it.title.slice(0, 42);
          if (seen.has(k)) continue;
          seen.add(k);
          merged.push(it);
        }
        cache.items = merged.slice(0, 30);
        cache.refreshedAt = Date.now();
        cache.ok = true;

        // استمرارية عبر القاعدة — للنجاة من إعادة تشغيل السيرفر
        try {
          await db.insert(aiIntel).values(
            items.map((i) => ({
              title: i.title,
              region: i.region,
              country: i.country,
              severity: i.severity,
              summary: i.summary,
              source: i.source,
              url: i.url,
            }))
          );
          await db.execute(sql`DELETE FROM ai_intel WHERE id NOT IN (SELECT id FROM ai_intel ORDER BY id DESC LIMIT 400)`);
        } catch {
          /* القاعدة مساندة فقط */
        }
      } else {
        cache.ok = false;
      }
    } catch {
      cache.ok = false;
    } finally {
      cache.inflight = null;
    }
  })();
  return cache.inflight;
}

async function loadFromDb() {
  if (cache.loadedFromDb) return;
  cache.loadedFromDb = true;
  try {
    const rows = await db.select().from(aiIntel).orderBy(desc(aiIntel.createdAt)).limit(30);
    if (rows.length) {
      cache.items = rows.map((r) => ({
        title: r.title,
        region: r.region,
        country: r.country,
        severity: r.severity,
        summary: r.summary,
        source: r.source,
        url: r.url,
        at: new Date(r.createdAt).toISOString(),
      }));
      cache.refreshedAt = rows[0] ? new Date(rows[0].createdAt).getTime() : 0;
    }
  } catch {
    /* غير حرج */
  }
}

export async function GET() {
  await loadFromDb();

  const stale = Date.now() - (cache.refreshedAt || 0) > TTL;
  const cold = cache.items.length === 0;
  if (aiEnabled() && (cold || stale)) {
    if (cold) await refreshLock();
    else void refreshLock(); // تحديث خلفي دون حجب الاستجابة
  }

  return NextResponse.json({
    ok: true,
    aiActive: aiEnabled() && cache.ok,
    refreshedAt: new Date(cache.refreshedAt || Date.now()).toISOString(),
    items: cache.items,
  });
}
