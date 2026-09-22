import type { Metadata } from "next";
import { Brain, Cpu, Database, Gauge, Layers, Server, ShieldCheck, Zap } from "lucide-react";
import { db } from "@/db";
import { wars as warsTable } from "@/db/schema";
import { INTENSITY_RANK } from "@/lib/maps";
import GovHeader from "@/components/site/GovHeader";
import Reveal from "@/components/fx/Reveal";
import NetworkExplorer from "./NetworkExplorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "شبكة البيانات السيادية العالمية | رصد AI موثق لكل دول العالم",
  description:
    "شبكة بيانات حية تغطي ١٧٧ دولة — ملفات استخباراتية لكل دولة مولّدة بالذكاء الاصطناعي مع تحقق آلي من المصادر وتحديث كل ثانية.",
};

const ARCHITECTURE = [
  {
    icon: Brain,
    title: "محرك بحث موثق بالمصادر",
    desc: "Gemini 2.5 مدعومًا ببحث Google المباشر — كل معلومة تعود لرابط مصدر حقيقي قابل للتحقق، ورفض آلي لأي نبضة بلا مصدر صالح.",
  },
  {
    icon: Layers,
    title: "تفرد الطلبات (Single‑Flight)",
    desc: "أيًا كان عدد الزائرين، لا يخرج إلا طلب تحديث واحد كل ٦٠ ثانية إلى المصدر الخارجي — حماية كاملة من الضغط ومعدلات الاستهلاك.",
  },
  {
    icon: Database,
    title: "استمرارية عبر PostgreSQL",
    desc: "كل نبضة وملف دولة يُخزّن دائمًا في القاعدة — المعلومات تنجو من إعادة تشغيل السيرفر وتُخدم فورًا للزوار الجدد.",
  },
  {
    icon: Gauge,
    title: "قراءة محلية كل ثانية",
    desc: "المتصفح يقرأ من ذاكرة السيرفر الحية كل ثانية بأجوبة تقاس بالمللي ثانية — بيانات الشاشة لا تنتظر أحدًا أبدًا.",
  },
];

export default async function NetworkPage() {
  const wars = await db.select().from(warsTable);

  // فهرس انخراط الدول في النزاعات — الأقوى شدة لكل ISO
  const warInfo: Record<number, { code: string; name: string; intensity: string }> = {};
  for (const w of wars) {
    for (const raw of w.iso.split(",")) {
      const n = Number(raw.trim());
      if (Number.isNaN(n) || n <= 0) continue;
      const cur = warInfo[n];
      if (!cur || (INTENSITY_RANK[w.intensity] ?? 9) < (INTENSITY_RANK[cur.intensity] ?? 9)) {
        warInfo[n] = { code: w.code, name: w.name, intensity: w.intensity };
      }
    }
  }

  return (
    <main className="min-h-screen bg-obsidian text-ivory">
      <GovHeader
        title="شبكة البيانات السيادية العالمية"
        subtitle="GLOBAL SOVEREIGN DATA NETWORK — AI VERIFIED"
        classified
      />

      <div className="mx-auto max-w-[1500px] px-4 py-6">
        <div className="mb-5">
          <h1 className="flex flex-wrap items-center gap-3 font-kufi text-2xl font-black text-ivory md:text-3xl">
            شبكة بيانات دول العالم
            <span className="flex items-center gap-1.5 border border-violet-400/40 bg-violet-400/10 px-2.5 py-1 text-xs font-bold text-violet-300">
              <Brain className="size-4" />
              مدعومة بالذكاء الاصطناعي الموثق
            </span>
          </h1>
          <p className="mt-2 max-w-3xl text-xs leading-6 text-mute">
            تغطية حية لـ ١٧٧ دولة — البث الاستخباراتي يتحدث من السيرفر كل ثانية، والمحرك يتحقق من كل
            معلومة عبر مصادرها الدولية المباشرة. اسحب، ابحث، وانقر «الملف الاستخباراتي» لأي دولة
            لقراءة أهم قضاياها الراهنة بمصادرها الموثقة.
          </p>
        </div>

        <NetworkExplorer warInfo={warInfo} />

        {/* ===== strong server architecture ===== */}
        <Reveal className="mt-10">
          <div className="gold-panel p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-11 place-items-center border border-gold/40 bg-gold/10 text-gold-bright">
                <Server className="size-5" />
              </span>
              <div>
                <h2 className="font-kufi text-xl font-black text-ivory">معمارية السيرفر التحملية للبيانات الضخمة</h2>
                <p className="text-xs text-mute">مصممة لخدمة آلاف الزائرين المتزامنين دون أي تدهور في الأداء:</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ARCHITECTURE.map((a, i) => (
                <div key={a.title} className="group deep-panel hud-corners relative h-full p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="grid size-10 place-items-center border border-gold/30 bg-gold/5 text-gold-bright">
                      <a.icon className="size-5" />
                    </span>
                    <span className="stat-num font-kufi text-2xl font-black text-line group-hover:text-gold/25">{(i + 1).toLocaleString("ar-EG").padStart(2, "٠")}</span>
                  </div>
                  <h3 className="font-kufi text-sm font-bold text-ivory group-hover:text-gold-bright">{a.title}</h3>
                  <p className="mt-2 text-[11.5px] leading-6 text-mute">{a.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line/70 pt-4 text-[10px] text-mute">
              <span className="flex items-center gap-1.5"><Cpu className="size-3.5 text-gold" /> وقت توليد خلفي ~ ٧ ثوانٍ</span>
              <span className="flex items-center gap-1.5"><Zap className="size-3.5 text-emerald-400" /> زمن قراءة السيرفر أقل من ٥ مللي ثانية</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-gold" /> مفتاح الذكاء الاصطناعي محفوظ خادميًا فقط ولا يظهر للمتصفح إطلاقًا</span>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
