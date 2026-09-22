import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  ChevronLeft,
  Crown,
  Flag,
  Flame,
  Handshake,
  Landmark,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import GovHeader from "@/components/site/GovHeader";
import Counter from "@/components/fx/Counter";
import Reveal from "@/components/fx/Reveal";
import { ARAB_LEAGUE_FOUNDED, ARAB_LEAGUE_MEMBERS, LEAGUE_BODIES } from "@/lib/league";

export const metadata: Metadata = {
  title: "الجامعة العربية — الدول الأعضاء | وزارة الكشف الدولي لمصر ودول العالم",
  description:
    "منظومة الجامعة العربية ودولها الـ٢٢ الأعضاء — قنوات فض النزاعات العربية بالتنسيق مع وزارة الكشف الدولي لمصر ودول العالم.",
};

export default function LeaguePage() {
  const founders = ARAB_LEAGUE_MEMBERS.filter((m) => m.founder).length;

  return (
    <main className="min-h-screen bg-obsidian text-ivory">
      <GovHeader title="جامعة الدول العربية" subtitle="LEAGUE OF ARAB STATES — EST. 1945" />

      {/* hero band */}
      <section className="relative overflow-hidden border-b border-gold/15">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/summit.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/80 via-obsidian/70 to-obsidian" />
        <div className="noise pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center">
          <Reveal>
            <p className="mb-3 font-amiri text-sm text-gold/90">تأسست في {ARAB_LEAGUE_FOUNDED} — والمقر الدائم بالقاهرة</p>
            <h1 className="gold-text text-glow font-kufi text-4xl font-black md:text-5xl">جامعة الدول العربية</h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-8 text-ivory/75">
              أقدم منظمة إقليمية في العالم — تجمع ٢٢ دولة عربية تحت ميثاق واحد. وتشغل وزارة فض
              الكشف الدولي مقعد الأمانة الفنية للوساطة العربية ولجنة فض النزاعات بين الأعضاء.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {[
              { v: 22, l: "دولة عضو كاملة", icon: Flag },
              { v: founders, l: "أعضاء مؤسسون", icon: Crown },
              { v: 45, l: "قمة عربية منذ ١٩٤٦", icon: Landmark },
              { v: 11, l: "قمة طارئة للملفات الساخنة", icon: Flame },
            ].map((s) => (
              <div key={s.l} className="gold-panel flex items-center gap-3 px-6 py-4">
                <s.icon className="size-5 text-gold-bright" />
                <div className="text-right">
                  <Counter end={s.v} className="stat-num block font-kufi text-2xl font-black text-ivory" />
                  <span className="text-[10px] text-mute">{s.l}</span>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* member states */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <Reveal className="mb-10 text-center">
          <p className="mb-2 font-kufi text-[11px] font-bold tracking-[0.3em] text-gold/80">سجل العضوية الموثق</p>
          <h2 className="font-kufi text-3xl font-extrabold text-ivory">الدول الثمان والعشرون الأعضاء</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-mute">
            مرتبة حسب تاريخ الانضمام — النجمة الذهبية تعني عضوية مؤسسة لميثاق ١٩٤٥.
          </p>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ARAB_LEAGUE_MEMBERS.map((m, i) => (
            <Reveal key={m.name} delay={(i % 4) * 0.05}>
              <div
                className={`group relative h-full border p-4 transition-all duration-300 ${
                  m.founder
                    ? "border-gold/50 bg-gold/[0.07] hover:border-gold"
                    : "border-line bg-panel hover:border-gold/30"
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  {/* flag stripes */}
                  <span className="block h-5 w-9 overflow-hidden border border-ivory/20 shadow">
                    <span
                      className="block size-full"
                      style={{
                        background: `linear-gradient(to bottom, ${m.colors[0]} 0 33.4%, ${m.colors[1]} 33.4% 66.7%, ${m.colors[2]} 66.7% 100%)`,
                      }}
                    />
                  </span>
                  {m.founder ? (
                    <span className="flex items-center gap-1 border border-gold/50 bg-gold/10 px-1.5 py-0.5 text-[9px] font-bold text-gold-bright">
                      <Crown className="size-3" /> عضو مؤسس
                    </span>
                  ) : (
                    <span className="stat-num text-[10px] text-mute">انضمت {m.joined.toLocaleString("ar-EG").replace("٬", "")}</span>
                  )}
                </div>
                <h3 className="font-kufi text-sm font-bold leading-6 text-ivory group-hover:text-gold-bright">
                  {m.name}
                </h3>
                <div className="mt-2 space-y-1 text-[11px] text-mute">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="size-3 text-gold/60" /> العاصمة: <span className="text-ivory/80">{m.capital}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Building2 className="size-3 text-gold/60" /> الإقليم: <span className="text-ivory/80">{m.region}</span>
                  </p>
                </div>
                {m.note && (
                  <p className="mt-2 flex items-start gap-1 border-t border-gold/20 pt-2 text-[10px] leading-5 text-gold/85">
                    <Sparkles className="mt-0.5 size-3 shrink-0" />
                    {m.note}
                  </p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* coordination bodies */}
      <section className="border-t border-line/60 bg-panel/40 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal className="mb-10 text-center">
            <p className="mb-2 font-kufi text-[11px] font-bold tracking-[0.3em] text-gold/80">القنوات المؤسسية المشتركة</p>
            <h2 className="font-kufi text-3xl font-extrabold text-ivory">أذرع فض النزاعات داخل الجامعة</h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LEAGUE_BODIES.map((b, i) => (
              <Reveal key={b.title} delay={i * 0.06}>
                <div className="group sheen deep-panel hud-corners relative h-full p-6">
                  <Handshake className="mb-4 size-7 text-gold-bright" />
                  <h3 className="font-kufi text-[15px] font-bold leading-7 text-ivory group-hover:text-gold-bright">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-[12px] leading-6 text-mute">{b.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10">
            <div className="gold-panel flex flex-col items-center gap-4 p-8 text-center">
              <ShieldCheck className="size-8 text-gold-bright" />
              <h3 className="max-w-2xl font-kufi text-xl font-black leading-9 text-ivory">
                أمن عربي جماعي يبدأ من رصدٍ لا يتوقف
              </h3>
              <p className="max-w-2xl text-sm leading-7 text-mute">
                تتابع الجامعة والوزارة معًا نبض الجبهات العربية على مدار الساعة — انتقل إلى مرصد
                الحروب المباشر لاستعراض البؤر النشطة وقنوات الوساطة المفتوحة.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/conflicts"
                  className="flex items-center gap-2 bg-gradient-to-l from-gold-deep via-gold to-gold-bright px-6 py-3 font-kufi text-sm font-extrabold text-obsidian transition hover:brightness-110"
                >
                  <Flame className="size-4" />
                  مرصد الحروب المباشر
                </Link>
                <Link
                  href="/directorate"
                  className="flex items-center gap-2 border border-gold/40 bg-gold/5 px-6 py-3 font-kufi text-sm font-bold text-gold-bright transition hover:bg-gold/15"
                >
                  الإدارة المركزية لشؤون فض النزاعات
                  <ChevronLeft className="size-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
