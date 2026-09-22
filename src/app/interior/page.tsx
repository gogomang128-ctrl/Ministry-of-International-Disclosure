import type { Metadata } from "next";
import { ShieldHalf } from "lucide-react";
import GovHeader from "@/components/site/GovHeader";
import InteriorFeed from "./InteriorFeed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "المتابعة الإعلامية لمنشورات وزارة الداخلية المصرية | وزارة الكشف الدولي",
  description:
    "الإدارة العامة للمتابعة الإعلامية — رصد حي مباشر لكل بيانات ومنشورات وزارة الداخلية المصرية: ضبط المتهمين، المداهمات، حملات المخدرات والمرور، خطوة بخطوة بمصادرها الموثقة.",
};

export default function InteriorPage() {
  return (
    <main className="min-h-screen bg-obsidian text-ivory">
      <GovHeader
        title="المتابعة الإعلامية — وزارة الداخلية المصرية"
        subtitle="MOI PUBLICATIONS LIVE MONITOR — OFFICIAL"
        classified
      />

      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex flex-wrap items-center gap-3 font-kufi text-2xl font-black text-ivory md:text-3xl">
              أخبار وزارة الداخلية المصرية
              <span className="flex items-center gap-1.5 border border-blood/50 bg-blood/10 px-2.5 py-1 text-xs font-bold text-red-300">
                <ShieldHalf className="size-4" />
                بثٌّ مباشر — منشورًا بمنشور
              </span>
            </h1>
            <p className="mt-2 max-w-3xl text-xs leading-6 text-mute">
              بموجب قرار رئيس مجلس الوزراء وبتكليف من وزارة الكشف الدولي لمصر ودول العالم، تتولى هذه
              الإدارة رصد ومتابعة كل ما تصدره منصات وزارة الداخلية المصرية من بيانات وضبطيات ومنشورات
              أمنية مرة بمرة وفور صدورها، وعرضها بمصادرها الموثقة ووفق ضوابط الصلاحيات السيادية.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/interior-press.jpg" alt="" className="hidden h-20 w-36 rounded-sm border border-gold/25 object-cover opacity-80 md:block" />
        </div>

        <InteriorFeed />
      </div>
    </main>
  );
}
