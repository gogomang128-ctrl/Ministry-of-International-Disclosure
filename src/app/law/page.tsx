import type { Metadata } from "next";
import { Scale } from "lucide-react";
import GovHeader from "@/components/site/GovHeader";
import LawExplorer from "./LawExplorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "بنود القانون والدستور المصري | وزارة الكشف الدولي",
  description:
    "بنود وأحكام القانون المصري المدني والجنائي والمالي والاجتماعي ومواد الدستور المصري، مع دساتير والوثائق التأسيسية للدول العربية — بالنصوص والنظريات الرسمية.",
};

export default function LawPage() {
  return (
    <main className="min-h-screen bg-obsidian text-ivory">
      <GovHeader
        title="بنود القانون والدستور المصري"
        subtitle="EGYPTIAN LAW & CONSTITUTION INDEX"
      />

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-5">
          <h1 className="flex flex-wrap items-center gap-3 font-kufi text-2xl font-black text-ivory md:text-3xl">
            فهرس التشريع المصري والدستور
            <span className="flex items-center gap-1.5 border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold-bright">
              <Scale className="size-4" />
              نصوص محكومة من الجريدة الرسمية
            </span>
          </h1>
          <p className="mt-2 max-w-3xl text-xs leading-6 text-mute">
            أهم مواد دستور ٢٠١٤ (تعديل ٢٠١٩)، والقانون المدني، وقانون العقوبات والإجراءات الجنائية،
            والقانون المالي والضريبي، والقانون الاجتماعي والتأمينات وقانون العمل — بنصوص موثقة من
            الجريدة الرسمية قابلة للبحث والتصفح.
          </p>
        </div>

        <LawExplorer />
      </div>
    </main>
  );
}
