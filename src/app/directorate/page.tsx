import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenCheck,
  ChevronLeft,
  Flame,
  Gavel,
  Globe2,
  Handshake,
  Lock,
  MapPinned,
  Radio,
  Satellite,
  ScrollText,
  ShieldCheck,
  Stamp,
  Star,
  Swords,
  UserCheck,
} from "lucide-react";
import GovHeader from "@/components/site/GovHeader";
import Counter from "@/components/fx/Counter";
import Reveal from "@/components/fx/Reveal";

export const metadata: Metadata = {
  title: "الإدارة المركزية لشؤون فض النزاعات | وزارة الكشف الدولي لمصر ودول العالم",
  description:
    "الإدارة المركزية لشؤون فض النزاعات — القلب التنفيذي للوزارة: الهيكل التنظيمي، الاختصاصات، وقنوات الارتباط بوزارة الدفاع المصرية والجامعة العربية.",
};

const DEPARTMENTS = [
  {
    icon: Gavel,
    title: "إدارة التحكيم والمنازعات الدولية",
    desc: "تتولى تمثيل الدولة أمام هيئات التحكيم الكبرى، وإعداد المذكرات القانونية، وإدارة ملفات ICSID وPCA وICC.",
    staff: "١٢٠ خبيرًا قانونيًا دوليًا",
  },
  {
    icon: Handshake,
    title: "إدارة الوساطة والتفاوض",
    desc: "تدير فرق الوسطاء المعتمدين وجولات التفاوض السرية والمعلنة في ملفات المياه والحدود والأزمات الدبلوماسية.",
    staff: "٢٧ فريق وساطة ميداني",
  },
  {
    icon: MapPinned,
    title: "إدارة ترسيم الحدود والخرائط السيادية",
    desc: "حارسة الوثائق والخرائط التاريخية والسندات القانونية للتراب الوطني أمام لجان الترسيم الدولية.",
    staff: "معهد الخرائط السيادية",
  },
  {
    icon: Swords,
    title: "إدارة التنسيق الميداني — وزارة الدفاع",
    desc: "قناة الارتباط الدائمة مع هيئة عمليات القوات المسلحة لتأمين تنفيذ التسويات راجعة للملفات الحدودية.",
    staff: "مكتب ارتباط برتبة لواء",
  },
  {
    icon: Stamp,
    title: "إدارة المعاهدات والتوثيق",
    desc: "الأرشيف الرقمي المؤمّن لأكثر من أربعة آلاف معاهدة واتفاقية دولية ببصمة سيادية غير قابلة للتلاعب.",
    staff: "٤٠٠٠+ صك دولي موثق",
  },
  {
    icon: Satellite,
    title: "إدارة المرصد والتحليل الاستراتيجي",
    desc: "عين الوزارة الساهرة — رصد لحظي للبؤر الساخنة وتقدير موقف يومي يُرفع للقيادة السياسية.",
    staff: "غرفة رصد ٢٤/٧",
  },
];

const LEADERSHIP = [
  {
    rank: "بدرجة وزير مفوض",
    title: "رئيس الإدارة المركزية لشؤون فض النزاعات",
    duties: "يشرف على جميع الملفات ويرفع تقاريره مباشرة إلى رئاسة الجمهورية ومجلس الأمن القومي.",
    icon: Star,
  },
  {
    rank: "مستشار قانوني دولي",
    title: "نائب الرئيس للشؤون القانونية والتحكيم",
    duties: "يقود الفرق القانونية أمام المحافل الدولية ويعتمد الصياغات النهائية للمذكرات.",
    icon: BookOpenCheck,
  },
  {
    rank: "لواء أركان حرب",
    title: "مدير مكتب التنسيق العسكري مع وزارة الدفاع",
    duties: "يضمن التوافق الميداني بين أدوات التسوية ومتطلبات التأمين على الأرض.",
    icon: ShieldCheck,
  },
];

const CHANNELS = [
  { href: "/conflicts", label: "مرصد الحروب المباشر", desc: "خريطة البؤر النشطة على المسرح العربي", icon: Flame },
  { href: "/ops", label: "غرفة العمليات المركزية", desc: "مركز القيادة والسيطرة مع وزارة الدفاع", icon: Radio },
  { href: "/league", label: "قناة الجامعة العربية", desc: "آليات التنسيق مع الأعضاء الـ٢٢", icon: Globe2 },
  { href: "/#services", label: "تقديم طلب خدمة سيادية", desc: "القناة المشفرة للأفراد والكيانات", icon: ScrollText },
];

export default function DirectoratePage() {
  return (
    <main className="min-h-screen bg-obsidian text-ivory">
      <GovHeader
        title="الإدارة المركزية لشؤون فض النزاعات"
        subtitle="CENTRAL DIRECTORATE FOR DISPUTE SETTLEMENT AFFAIRS"
      />

      {/* hero */}
      <section className="relative overflow-hidden border-b border-gold/15">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero-building.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/85 via-obsidian/70 to-obsidian" />
        <div className="grid-bg absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4 py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <p className="mb-3 inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-3 py-1 font-kufi text-[11px] font-bold text-gold-bright">
                <Lock className="size-3.5" />
                المنشأة بقرار جمهوري رقم ٢١٧ لسنة ٢٠٢١
              </p>
              <h1 className="gold-text text-glow font-kufi text-3xl font-black leading-snug md:text-5xl md:leading-snug">
                الإدارة المركزية لشؤون فض النزاعات
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-8 text-ivory/75">
                القلب التنفيذي للوزارة — حيث تُدار ملفات التحكيم والوساطة وترسيم الحدود وتوثيق
                المعاهدات تحت سقف واحد، وتعمل كحلقة وصل يومية مع وزارة الدفاع المصرية ومجلس
                الأمن القومي والجامعة العربية. لا يمر أي ملف نزاع دولي يخص الدولة إلا عبرها.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/conflicts"
                  className="flex items-center gap-2 bg-gradient-to-l from-gold-deep via-gold to-gold-bright px-6 py-3.5 font-kufi text-sm font-extrabold text-obsidian transition hover:brightness-110"
                >
                  <Flame className="size-4" />
                  خريطة الحروب المباشرة
                </Link>
                <Link
                  href="/league"
                  className="flex items-center gap-2 border border-ivory/25 bg-ivory/5 px-6 py-3.5 font-kufi text-sm font-bold text-ivory transition hover:border-gold/60 hover:text-gold-bright"
                >
                  <Globe2 className="size-4" />
                  قناة الجامعة العربية
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="gold-panel hud-corners relative grid grid-cols-2 gap-px overflow-hidden">
                {[
                  { icon: ScrollText, v: 16, l: "ملف نزاع نشط تحت الإدارة" },
                  { icon: Handshake, v: 27, l: "فريق وساطة ميداني" },
                  { icon: UserCheck, v: 480, l: "كادر قانوني ودبلوماسي" },
                  { icon: ShieldCheck, v: 94, l: "٪ جاهزية الاستجابة", suffix: "٪" },
                ].map((s) => (
                  <div key={s.l} className="flex flex-col items-center gap-2 bg-obsidian/60 p-7 text-center">
                    <s.icon className="size-6 text-gold-bright" />
                    <Counter end={s.v} suffix={s.suffix ?? ""} className="stat-num gold-text font-kufi text-4xl font-black" />
                    <span className="text-[11px] text-mute">{s.l}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* departments */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <Reveal className="mb-10 text-center">
          <p className="mb-2 font-kufi text-[11px] font-bold tracking-[0.3em] text-gold/80">الهيكل التنظيمي</p>
          <h2 className="font-kufi text-3xl font-extrabold text-ivory">ست إدارات تحت قيادة واحدة</h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map((d, i) => (
            <Reveal key={d.title} delay={(i % 3) * 0.07}>
              <div className="group sheen deep-panel hud-corners relative h-full p-6 transition hover:border-gold/40">
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid size-12 place-items-center border border-gold/30 bg-gold/5 text-gold transition group-hover:bg-gold/15 group-hover:text-gold-bright">
                    <d.icon className="size-6" />
                  </span>
                  <span className="stat-num font-kufi text-3xl font-black text-line transition group-hover:text-gold/25">
                    {(i + 1).toLocaleString("ar-EG").padStart(2, "٠")}
                  </span>
                </div>
                <h3 className="font-kufi text-base font-bold leading-7 text-ivory group-hover:text-gold-bright">{d.title}</h3>
                <p className="mt-2 text-[12.5px] leading-6 text-mute">{d.desc}</p>
                <p className="mt-3 border-t border-line/70 pt-2.5 text-[10px] text-gold/80">{d.staff}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* leadership */}
      <section className="border-t border-line/60 bg-panel/40 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <Reveal className="mb-10 text-center">
            <p className="mb-2 font-kufi text-[11px] font-bold tracking-[0.3em] text-gold/80">القيادة</p>
            <h2 className="font-kufi text-3xl font-extrabold text-ivory">هرم المسؤولية</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-mute">
              تحفظ أسماء القيادات العاملة لأسباب أمنية — تُعرض الرتب والاختصاصات فقط وفق اللائحة السيادية.
            </p>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {LEADERSHIP.map((l, i) => (
              <Reveal key={l.title} delay={i * 0.08}>
                <div className="gold-panel hud-corners relative h-full p-7 text-center">
                  <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full border border-gold/40 bg-gold/10">
                    <l.icon className="size-7 text-gold-bright" />
                  </span>
                  <p className="text-[11px] font-bold text-gold">{l.rank}</p>
                  <h3 className="mt-2 font-kufi text-lg font-bold leading-8 text-ivory">{l.title}</h3>
                  <p className="mt-3 text-[12px] leading-6 text-mute">{l.duties}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* channels */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <Reveal className="mb-10 text-center">
          <p className="mb-2 font-kufi text-[11px] font-bold tracking-[0.3em] text-gold/80">قنوات الارتباط</p>
          <h2 className="font-kufi text-3xl font-extrabold text-ivory">من هذه الإدارة إلى كل الجبهات</h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {CHANNELS.map((c, i) => (
            <Reveal key={c.href} delay={(i % 2) * 0.07}>
              <Link
                href={c.href}
                className="group flex items-center gap-4 border border-line bg-panel p-5 transition hover:border-gold/50 hover:bg-panel-2"
              >
                <span className="grid size-12 shrink-0 place-items-center border border-gold/30 bg-gold/5 text-gold-bright">
                  <c.icon className="size-6" />
                </span>
                <span className="flex-1">
                  <span className="block font-kufi text-base font-bold text-ivory group-hover:text-gold-bright">{c.label}</span>
                  <span className="mt-0.5 block text-[11px] text-mute">{c.desc}</span>
                </span>
                <ChevronLeft className="size-5 text-mute transition group-hover:-translate-x-1 group-hover:text-gold-bright" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
