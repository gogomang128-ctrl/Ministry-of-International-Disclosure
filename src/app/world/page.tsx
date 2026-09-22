import type { Metadata } from "next";
import Link from "next/link";
import { BookMarked, ChevronLeft, ExternalLink, FileSearch, Globe2 } from "lucide-react";
import { db } from "@/db";
import { wars as warsTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import GovHeader from "@/components/site/GovHeader";
import Reveal from "@/components/fx/Reveal";
import WorldWarMap, { type WarRow } from "./WorldWarMap";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الخريطة التفاعلية الحقيقية لحروب العالم | بمصادر موثوقة",
  description:
    "خريطة عالمية تفاعلية بحدود دول حقيقية لكل الحروب والنزاعات المسلحة الجارية الآن — بأسماء الدول المتحاربة ومصادر موثقة من CFR وACLED وUCDP وReliefWeb.",
};

const SOURCES = [
  {
    name: "CFR — Global Conflict Tracker",
    desc: "مجلس العلاقات الخارجية الأمريكي: متتبع النزاعات الأكاديمي الأشهر عالميًا.",
    url: "https://www.cfr.org/global-conflict-tracker",
  },
  {
    name: "ACLED — Conflict Index",
    desc: "قاعدة بيانات الأحداث المسلحة الأدق ميدانيًا — تحديث أسبوعي موثق لكل حادثة.",
    url: "https://acleddata.com/",
  },
  {
    name: "UCDP — جامعة أوبسالا",
    desc: "برنامج أوبسالا لبيانات النزاعات — المرجع الأكاديمي المعتمد لإحصاءات الحروب منذ ١٩٤٦.",
    url: "https://ucdp.uu.se/",
  },
  {
    name: "ReliefWeb — OCHA",
    desc: "مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية — تقارير ميدانية رسمية لكل دولة.",
    url: "https://reliefweb.int/",
  },
  {
    name: "Crisis Group — CrisisWatch",
    desc: "المجموعة الدولية للأزمات: نشرة التحذير المبكر الشهرية لكل بؤر التوتر.",
    url: "https://www.crisisgroup.org/crisiswatch",
  },
  {
    name: "SIPRI — معهد ستوكهولم",
    desc: "معهد أبحاث السلام الدولي — الإنفاق العسكري وأطلس الصراعات السنوي المعتمد.",
    url: "https://www.sipri.org/",
  },
];

export default async function WorldPage() {
  const rows = await db.select().from(warsTable).orderBy(desc(warsTable.updatedAt));
  const initial: WarRow[] = rows.map((r) => ({
    ...r,
    updatedAt: new Date(r.updatedAt).toISOString(),
  }));

  return (
    <main className="min-h-screen bg-obsidian text-ivory">
      <GovHeader
        title="الخريطة التفاعلية لحروب العالم"
        subtitle="GLOBAL CONFLICTS — REAL INTERACTIVE MAP"
        classified
      />

      <div className="mx-auto max-w-[1500px] px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-kufi text-2xl font-black text-ivory md:text-3xl">
              كل حروب دول العالم الآن — <span className="gold-text">على خريطة حقيقية تفاعلية</span>
            </h1>
            <p className="mt-1 max-w-3xl text-xs leading-6 text-mute">
              حدود الدول الحقيقية (Natural Earth) مع الدول المتحاربة ملوّنة بأسمائها حسب شدة النزاع
              — اسحب الخريطة، كبّر بالعجلة أو الأزرار، وانقر أي دولة أو نقطة لعرض ملفها ومصدرها الموثّق.
            </p>
          </div>
          <Link
            href="/conflicts"
            className="flex items-center gap-2 border border-gold/40 bg-gold/10 px-4 py-2 font-kufi text-xs font-bold text-gold-bright transition hover:bg-gold/20"
          >
            <Globe2 className="size-4" />
            عرض مرصد المسرح العربي 2D
            <ChevronLeft className="size-3.5" />
          </Link>
        </div>

        <WorldWarMap initial={initial} />

        {/* ===== sources ===== */}
        <Reveal className="mt-10">
          <div className="gold-panel p-6 md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-11 place-items-center border border-gold/40 bg-gold/10 text-gold-bright">
                <BookMarked className="size-5" />
              </span>
              <div>
                <h2 className="font-kufi text-xl font-black text-ivory">المصادر الدولية الموثّقة للبيانات</h2>
                <p className="text-xs text-mute">
                  كل ملف نزاع في قاعدة البيانات مربوط برابط مصدره المباشر — هذه القنوات المرجعية المعتمدة للرصد:
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SOURCES.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-3 border border-line bg-obsidian/60 p-4 transition hover:border-gold/40 hover:bg-panel"
                >
                  <FileSearch className="mt-0.5 size-4 shrink-0 text-sky-300" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-kufi text-[12.5px] font-bold text-ivory/90 group-hover:text-gold-bright" dir="ltr">
                      {s.name}
                    </span>
                    <span className="mt-1 block text-[11px] leading-5 text-mute">{s.desc}</span>
                  </span>
                  <ExternalLink className="size-3.5 shrink-0 text-mute transition group-hover:text-gold-bright" />
                </a>
              ))}
            </div>
            <p className="mt-5 border-t border-line/70 pt-4 text-[10px] leading-5 text-mute">
              منهجية الاعتماد: تُصنَّف شدة كل نزاع وفق معايير UCDP (حرب: أكثر من ١٠٠٠ قتال مرتبط
              بالمعارك سنويًا — نزاع مسلح: ٢٥ فأكثر)، مع مطابقة ميدانية عبر ACLED وتقارير OCHA.
              الإحداثيات على الخريطة التفاعلية دقيقة جغرافيًا حسب نظام WGS84، ومجاميع النزوح وفق UNHCR.
              هذه الشاشة أداة رصد إعلامية تحليلية ولا تمثل موقفًا رسميًا تجاه أي طرف من الأطراف المذكورة.
            </p>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
