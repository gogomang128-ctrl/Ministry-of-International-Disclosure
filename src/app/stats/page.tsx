import type { Metadata } from "next";
import { Database } from "lucide-react";
import { db } from "@/db";
import { arabStats } from "@/db/schema";
import GovHeader from "@/components/site/GovHeader";
import StatsExplorer, { type ArabStatRow } from "./StatsExplorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "قاعدة بيانات الوضع الإنساني العربي | وزارة الكشف الدولي",
  description:
    "قاعدة بيانات موثقة لكل الدول العربية: أعداد النازحين بسبب الحروب، والقتلى، والمناطق المحتلة والمحاصرة، ومؤشر التفكك الشعبي — بمصادر أممية لكل معلومة.",
};

export default async function StatsPage() {
  const rows = await db.select().from(arabStats);
  const initial: ArabStatRow[] = rows.map((r) => ({
    id: r.id,
    country: r.country,
    colors: r.colors,
    status: r.status,
    displaced: r.displaced,
    refugeesOut: r.refugeesOut,
    deaths: r.deaths,
    occupied: r.occupied,
    besieged: r.besieged,
    fragLevel: r.fragLevel,
    fragNote: r.fragNote,
    hosting: r.hosting,
    sourceLabel: r.sourceLabel,
    sourceUrl: r.sourceUrl,
  }));

  return (
    <main className="min-h-screen bg-obsidian text-ivory">
      <GovHeader
        title="قاعدة بيانات الوضع الإنساني العربي"
        subtitle="ARAB HUMANITARIAN DATABASE — VERIFIED"
      />

      <div className="mx-auto max-w-[1500px] px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex flex-wrap items-center gap-3 font-kufi text-2xl font-black text-ivory md:text-3xl">
              الإحصاء الإنساني للدول العربية
              <span className="flex items-center gap-1.5 border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold-bright">
                <Database className="size-4" />
                ٢٢ دولة — بمصادر أممية لكل رقم
              </span>
            </h1>
            <p className="mt-2 max-w-3xl text-xs leading-6 text-mute">
              النازحون بسبب الحروب الدائرة، وأعداد القتلى، والمناطق المحتلة والمحاصرة، ومؤشر التفكك
              الشعبي والمجتمعي — كل عنوان إحصائي مربوط بمصدره الدولي الموثق القابل للتحقق.
            </p>
          </div>
        </div>

        <StatsExplorer initial={initial} />
      </div>
    </main>
  );
}
