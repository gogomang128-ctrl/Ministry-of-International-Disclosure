import { NextResponse } from "next/server";
import { db } from "@/db";
import { interiorIntel } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { aiEnabled, askGemini, extractJson } from "@/lib/ai";

export const dynamic = "force-dynamic";

const TTL = 120_000; // تحديث خارجي كل دقيقتين — القراءة المحلية كل ثانية

interface InteriorItem {
  title: string;
  category: string;
  severity: string;
  summary: string;
  governorate: string;
  source: string;
  url: string;
  image: string;
  at: string;
}

interface InteriorCache {
  items: InteriorItem[];
  refreshedAt: number;
  ok: boolean;
  inflight: Promise<void> | null;
  loadedFromDb: boolean;
}

const g = globalThis as typeof globalThis & { __interiorCache?: InteriorCache };
const cache: InteriorCache =
  g.__interiorCache ??
  (g.__interiorCache = { items: [], refreshedAt: 0, ok: true, inflight: null, loadedFromDb: false });

const PROMPT = `أنت محرر رصد أمني مصري. باستخدام البحث المباشر في الصحافة المصرية اليوم (اليوم السابع، مصراوي، المصري اليوم، الوطن، أخبار اليوم، الأهرام)، اجمع 8 أخبار حقيقية حديثة عن وزارة الداخلية المصرية (ضبط متهمين، مداهمات، حملات مخدرات، مرور، حماية مدنية، بيانات رسمية).
JSON فقط بدون نص آخر:
[{"title":"عنوان عربي رسمي موجز","severity":"war أو escalation أو clashes أو tension","summary":"ملخص عربي من جملتين","governorate":"المحافظة","source":"اسم الصحيفة","url":"رابط الخبر الحقيقي"}]
مصادر حقيقية فقط من البحث — ممنوع اختلاق أخبار أو روابط.`;

function categorize(text: string): { category: string; image: string } {
  const t = text;
  if (/مخدرات|ترامادول|حشيش|هيروين/.test(t)) return { category: "مكافحة المخدرات", image: "/images/interior-raid.jpg" };
  if (/إرهاب|متطرف|عناصر تكفيرية/.test(t)) return { category: "مكافحة الإرهاب", image: "/images/interior-raid.jpg" };
  if (/مداهمة|بؤرة|مسلح|أسلحة|سلاح|ذخيرة/.test(t)) return { category: "ضبطيات ومداهمات", image: "/images/interior-raid.jpg" };
  if (/مرور|مخالفات|حوادث الطرق|سيارة/.test(t)) return { category: "المرور والحماية", image: "/images/interior-patrol.jpg" };
  if (/حريق|حماية مدنية|إطفاء|إنقاذ/.test(t)) return { category: "الحماية المدنية", image: "/images/interior-patrol.jpg" };
  if (/آثار|تراث/.test(t)) return { category: "السياحة والآثار", image: "/images/interior-raid.jpg" };
  if (/مؤتمر|بيان|وزير|افتتاح|تعلن الوزارة/.test(t)) return { category: "بيان رسمي", image: "/images/interior-press.jpg" };
  return { category: "بيان رسمي", image: "/images/interior-press.jpg" };
}

function validate(raw: unknown): InteriorItem | null {
  if (typeof raw !== "object" || !raw) return null;
  const o = raw as Record<string, unknown>;
  const title = String(o.title ?? "").trim();
  const summary = String(o.summary ?? "").trim();
  const url = String(o.url ?? "").trim();
  if (title.length < 10 || summary.length < 20) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  const sev = ["war", "escalation", "clashes", "tension", "ceasefire"].includes(String(o.severity))
    ? String(o.severity)
    : "clashes";
  const { category, image } = categorize(`${title} ${summary}`);
  return {
    title: title.slice(0, 160),
    category,
    severity: sev,
    summary: summary.slice(0, 420),
    governorate: String(o.governorate ?? "على مستوى الجمهورية").slice(0, 40),
    source: String(o.source ?? "صحيفة مصرية").slice(0, 90),
    url: url.slice(0, 300),
    image,
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
        .filter((x): x is InteriorItem => x !== null)
        .slice(0, 12);

      if (items.length) {
        const seen = new Set<string>();
        const merged: InteriorItem[] = [];
        for (const it of [...items, ...cache.items]) {
          const k = it.title.slice(0, 44);
          if (seen.has(k)) continue;
          seen.add(k);
          merged.push(it);
        }
        cache.items = merged.slice(0, 26);
        cache.refreshedAt = Date.now();
        cache.ok = true;

        try {
          await db.insert(interiorIntel).values(
            items.map((i) => ({
              title: i.title,
              category: i.category,
              severity: i.severity,
              summary: i.summary,
              governorate: i.governorate,
              source: i.source,
              url: i.url,
              image: i.image,
            }))
          );
          await db.execute(sql`DELETE FROM interior_intel WHERE id NOT IN (SELECT id FROM interior_intel ORDER BY id DESC LIMIT 400)`);
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
    const rows = await db.select().from(interiorIntel).orderBy(desc(interiorIntel.createdAt)).limit(26);
    if (rows.length) {
      cache.items = rows.map((r) => ({
        title: r.title,
        category: r.category,
        severity: r.severity,
        summary: r.summary,
        governorate: r.governorate,
        source: r.source,
        url: r.url,
        image: r.image,
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
    else void refreshLock();
  }

  return NextResponse.json({
    ok: true,
    aiActive: aiEnabled() && cache.ok,
    refreshedAt: new Date(cache.refreshedAt || Date.now()).toISOString(),
    items: cache.items,
  });
}
