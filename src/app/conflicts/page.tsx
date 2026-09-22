import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { db } from "@/db";
import { conflicts as conflictsTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import GovHeader from "@/components/site/GovHeader";
import WarMonitor, { type ConflictRow } from "./WarMonitor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مرصد الحروب والنزاعات المباشر | خريطة المسرح العربي",
  description:
    "رصد حي ومباشر لبؤر الحروب والنزاعات في الوطن العربي والشرق الأوسط — خريطة مسرح 2D محدثة لحظيًا من غرفة وزارة الكشف الدولي لمصر ودول العالم.",
};

export default async function ConflictsPage() {
  const rows = await db.select().from(conflictsTable).orderBy(desc(conflictsTable.updatedAt));
  const initial: ConflictRow[] = rows.map((r) => ({
    ...r,
    updatedAt: new Date(r.updatedAt).toISOString(),
  }));

  return (
    <main className="min-h-screen bg-obsidian text-ivory">
      <GovHeader
        title="مرصد الحروب والنزاعات المباشر"
        subtitle="CENTRAL WAR MONITOR — ARAB THEATER"
        classified
      />

      <div className="mx-auto max-w-[1500px] px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-kufi text-2xl font-black text-ivory md:text-3xl">
              الحروب الدائرة الآن <span className="gold-text">على المسرح العربي والشرق أوسطي</span>
            </h1>
            <p className="mt-1 text-xs leading-6 text-mute">
              رصد لحظي حقيقي عبر قنوات الوزارة المفتوحة وتقارير الوكالات الدولية — انقر أي بؤرة على
              الخريطة لاستعراض ملفها الكامل ودور الوزارة فيها.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/world"
              className="flex items-center gap-2 bg-gradient-to-l from-gold-deep via-gold to-gold-bright px-4 py-2 font-kufi text-xs font-extrabold text-obsidian transition hover:brightness-110"
            >
              <ShieldCheck className="size-4" />
              التوسع عالميًا — خريطة كل الحروب الحقيقية
              <ChevronLeft className="size-3.5" />
            </Link>
            <Link
              href="/league"
              className="flex items-center gap-2 border border-gold/40 bg-gold/10 px-4 py-2 font-kufi text-xs font-bold text-gold-bright transition hover:bg-gold/20"
            >
              عرض تنسيق الجامعة العربية
              <ChevronLeft className="size-3.5" />
            </Link>
          </div>
        </div>

        <WarMonitor initial={initial} />

        <p className="mt-6 border border-line bg-panel/50 px-4 py-3 text-[10px] leading-5 text-mute">
          إخلاء مسؤولية: تعرض هذه الشاشة قراءات رصد لحظية مجمعة من تقارير الوكالات الدولية الرسمية
          وقنوات الوزارة المفتوحة لأغراض المتابعة الإعلامية والسيادية، ولا تُعد موقفًا رسميًا من أي طرف.
          الإحداثيات على الخريطة تقريبية لأغراض العرض التكتيكي.
        </p>
      </div>
    </main>
  );
}
