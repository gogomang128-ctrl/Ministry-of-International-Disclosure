import type { Metadata } from "next";
import { Handshake } from "lucide-react";
import GovHeader from "@/components/site/GovHeader";
import PeaceExplorer from "./PeaceExplorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "بنود السلام والتحالفات العربية | وزارة الكشف الدولي",
  description:
    "بنود اتفاقيات السلام بين الدول العربية، والتحالفات العسكرية والأمنية والاقتصادية التي انضمت إليها الدول العربية — بوثائق رسمية ومصادر موثقة.",
};

export default function PeacePage() {
  return (
    <main className="min-h-screen bg-obsidian text-ivory">
      <GovHeader
        title="بنود السلام والتحالفات العربية"
        subtitle="PEACE TREATIES & ARAB ALLIANCES"
      />

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-5">
          <h1 className="flex flex-wrap items-center gap-3 font-kufi text-2xl font-black text-ivory md:text-3xl">
            السلام والتحالفات على الساحة العربية
            <span className="flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300">
              <Handshake className="size-4" />
              ببنود رسمية موثقة
            </span>
          </h1>
          <p className="mt-2 max-w-3xl text-xs leading-6 text-mute">
            من كامب ديفيد إلى اتفاق جدة — سجل بنود اتفاقيات السلام العربية، وعضويات الدول العربية
            في التحالفات العسكرية والأمنية والاقتصادية الراهنة، كل اتفاق ببنوده ومصدره الرسمي.
          </p>
        </div>

        <PeaceExplorer />
      </div>
    </main>
  );
}
