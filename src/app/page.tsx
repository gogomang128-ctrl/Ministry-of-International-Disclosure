import Link from "next/link";
import { db } from "@/db";
import { disputes as disputesTable, treaties as treatiesTable, news as newsTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  AlertTriangle,
  ArrowDown,
  BarChart3,
  Building2,
  ChevronLeft,
  Droplets,
  FileSearch,
  FileText,
  Gavel,
  Globe2,
  Handshake,
  Landmark,
  Lock,
  Mail,
  MapPin,
  MessagesSquare,
  Mic,
  Phone,
  Plane,
  Radio,
  Scale,
  ScrollText,
  ShieldCheck,
  Ship,
  Stamp,
  Swords,
} from "lucide-react";
import {
  PRIORITY_CLASSES,
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  STATUS_CLASSES,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/lib/maps";
import LiveClock from "@/components/fx/LiveClock";
import Counter from "@/components/fx/Counter";
import Reveal from "@/components/fx/Reveal";
import Ticker from "@/components/fx/Ticker";
import Particles from "@/components/fx/Particles";
import MobileNav from "@/components/fx/MobileNav";
import RequestForm from "@/components/site/RequestForm";
import TrackingWidget from "@/components/site/TrackingWidget";
import DisputeExplorer from "@/components/site/DisputeExplorer";

export const dynamic = "force-dynamic";

function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/70" />
      <span className="size-1.5 rotate-45 border border-gold" />
      <span className="size-2 rotate-45 border border-gold bg-gold/20" />
      <span className="size-1.5 rotate-45 border border-gold" />
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/70" />
    </div>
  );
}

function SectionHead({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <Reveal className="mb-12 text-center">
      <p className="mb-3 font-kufi text-[11px] font-bold tracking-[0.3em] text-gold/80">{kicker}</p>
      <h2 className="font-kufi text-3xl font-extrabold leading-snug text-ivory md:text-4xl">{title}</h2>
      <Ornament className="mt-5" />
      {sub && <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-mute">{sub}</p>}
    </Reveal>
  );
}

const MANDATES = [
  { icon: Scale, title: "التحكيم الدولي", desc: "تمثيل الدولة أمام هيئات التحكيم الكبرى (PCA / ICSID / ICC) وصياغة المذكرات القانونية السيادية." },
  { icon: Handshake, title: "الوساطة والمساعي الحميدة", desc: "قيادة الوساطات الإقليمية والدولية عبر مسارات سرية ومعلنة لنزع فتيل الصراعات قبل اندلاعها." },
  { icon: MessagesSquare, title: "التفاوض الدولي", desc: "إدارة جولات التفاوض الاستراتيجي في الملفات المعقدة بفرق تفاوضية من النخبة الدبلوماسية والقانونية." },
  { icon: Swords, title: "دعم عمليات وزارة الدفاع", desc: "غرفة تنسيق قانوني دائمة مع وزارة الدفاع المصرية والقيادة الاستراتيجية الموحدة للقوات المسلحة." },
  { icon: Ship, title: "المنازعات البحرية", desc: "ترسيم الحدود البحرية وحماية الثروات في المنطقة الاقتصادية الخالصة وخطوط الملاحة الدولية." },
  { icon: Droplets, title: "نزاعات المياه العابرة", desc: "صون الحقوق المائية التاريخية وإفشال أي إجراءات أحادية عبر الأدوات القانونية والتفاوضية المُلزمة." },
  { icon: BarChart3, title: "المنازعات التجارية والاستثمارية", desc: "الدفاع عن مصالح الدولة والمصدرين أمام منظمة التجارة العالمية ومراكز تسوية الاستثمار." },
  { icon: Plane, title: "منازعات المجال الجوي", desc: "معالجة تعارضات المسارات والمناطق المحظورة بالتنسيق مع الطيران المدني والمنظمات الدولية." },
  { icon: Stamp, title: "توثيق المعاهدات", desc: "أرشفة سيادية مؤمّنة لأكثر من ٤٠٠٠ معاهدة واتفاقية ببصمة رقمية غير قابلة للتلاعب." },
];

const PROCESS = [
  { icon: FileText, title: "تقديم الطلب", desc: "قيد الطلب أو البلاغ عبر البوابة السيادية المؤمّنة برمز تتبع فريد." },
  { icon: FileSearch, title: "الفحص والتكييف", desc: "تكييف قانوني دقيق ودراسة الاختصاص والقابلية للفصل خلال ٤٨ ساعة." },
  { icon: Handshake, title: "جلسات الوساطة", desc: "مسارات سرية برئاسة وسيط دولي معتمد من الوزارة لتقريب المواقف." },
  { icon: Gavel, title: "هيئة التحكيم", desc: "تشكيل هيئة تحكيم من ثلاثة محكمين دوليين عند تعذر التسوية الودية." },
  { icon: ScrollText, title: "النطق بالحكم", desc: "حكم نهائي مُلزم قابل للتنفيذ في ١٧٢ دولة وفق اتفاقية نيويورك." },
  { icon: ShieldCheck, title: "الإشراف على التنفيذ", desc: "متابعة التنفيذ الميداني بالتنسيق مع وزارة الدفاع المصرية عند الاقتضاء." },
];

const NAV = [
  { href: "#mandate", label: "الاختصاصات" },
  { href: "/interior", label: "أخبار وزارة الداخلية" },
  { href: "/network", label: "شبكة البيانات" },
  { href: "/stats", label: "بيانات النزوح العربي" },
  { href: "/world", label: "خريطة الحروب العالمية" },
  { href: "/peace", label: "السلام والتحالفات" },
  { href: "/law", label: "القانون والدستور" },
  { href: "/conflicts", label: "مرصد الحروب" },
  { href: "/league", label: "الجامعة العربية" },
  { href: "/directorate", label: "الإدارة المركزية" },
  { href: "#services", label: "الخدمات" },
];

export default async function HomePage() {
  const [allDisputes, allTreaties, allNews] = await Promise.all([
    db.select().from(disputesTable),
    db.select().from(treatiesTable).orderBy(desc(treatiesTable.signedAt)),
    db.select().from(newsTable).orderBy(desc(newsTable.publishedAt)),
  ]);

  const activeCount = allDisputes.filter((d) => d.status !== "resolved" && d.status !== "frozen").length;
  const resolvedCount = allDisputes.filter((d) => d.status === "resolved").length;
  const mediationCount = allDisputes.filter((d) => d.status === "mediation" || d.status === "negotiation").length;

  const explorerRows = allDisputes.map((d) => ({
    id: d.id,
    code: d.code,
    title: d.title,
    type: d.type,
    status: d.status,
    statusLabel: STATUS_LABELS[d.status] ?? d.status,
    priorityLabel: PRIORITY_LABELS[d.priority] ?? d.priority,
    progress: d.progress,
    region: d.region,
  }));

  const tableRows = [...allDisputes]
    .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9))
    .slice(0, 8);

  const urgent = allNews.filter((n) => n.urgent).map((n) => n.title);
  const [featured, ...restNews] = allNews;

  return (
    <main id="top" className="relative overflow-x-clip bg-obsidian">
      {/* ======= top sovereign strip ======= */}
      <div className="border-b border-line/70 bg-panel/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/emblem.png" alt="شعار الجمهورية" className="size-6 rounded-full ring-1 ring-gold/40" />
            <span className="font-kufi text-[11px] font-bold text-ivory/90">جمهورية مصر العربية</span>
            <Link
              href="/directorate"
              className="hidden border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold-bright transition hover:bg-gold/25 sm:inline"
            >
              الإدارة المركزية لشؤون فض النزاعات
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <LiveClock variant="bar" />
            <span className="hidden items-center gap-1.5 text-[11px] text-gold-bright md:flex">
              <Phone className="size-3" /> الخط الساخن <span className="stat-num font-bold" dir="ltr">19455</span>
            </span>
          </div>
        </div>
      </div>

      {/* ======= header / nav ======= */}
      <header className="sticky top-0 z-50 border-b border-gold/15 bg-obsidian/85 backdrop-blur-xl">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="#top" className="flex items-center gap-3">
            <span className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/emblem.png" alt="شعار وزارة الكشف الدولي لمصر ودول العالم" className="size-12 rounded-full object-cover ring-2 ring-gold/50" />
              <span className="absolute inset-0 rounded-full border border-gold/40 ping-ring" />
            </span>
            <span>
              <span className="block font-kufi text-sm font-extrabold leading-5 text-ivory md:text-base">
                وزارة الكشف الدولي لمصر ودول العالم
              </span>
              <span dir="ltr" className="block text-[9px] tracking-[0.22em] text-gold/70">
                MINISTRY OF INTERNATIONAL DISCLOSURE
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-3.5 lg:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="whitespace-nowrap text-[12px] text-ivory/75 transition hover:text-gold-bright">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/interior"
              className="flex items-center gap-2 border border-sky-700/70 bg-sky-700/15 px-3.5 py-2 text-xs font-bold text-sky-300 transition hover:bg-sky-700/30"
            >
              <ShieldCheck className="size-3.5" />
              <span className="hidden md:inline">أخبار الداخلية</span>
              <span className="md:hidden">الداخلية</span>
            </Link>
            <Link
              href="/ops"
              className="group flex items-center gap-2 border border-blood/60 bg-blood/10 px-3.5 py-2 text-xs font-bold text-red-300 transition hover:bg-blood/25"
            >
              <span className="size-1.5 rounded-full bg-blood anim-blink" />
              <span className="hidden sm:inline">غرفة العمليات</span>
              <Lock className="size-3.5" />
            </Link>
            <MobileNav links={NAV} />
          </div>
        </div>
      </header>

      {/* ======= urgent ticker ======= */}
      {urgent.length > 0 && <Ticker items={urgent} />}

      {/* ======= HERO ======= */}
      <section className="relative flex min-h-[96svh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/hero-building.jpg" alt="" className="anim-hero-zoom h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/85 via-obsidian/60 to-obsidian" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(6,8,12,0.8)_75%)]" />
        </div>
        <Particles />
        <div className="noise scanlines pointer-events-none absolute inset-0" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-24 text-center">
          <Reveal>
            <div className="relative mx-auto mb-8 size-40 md:size-48">
              <div className="anim-spin-slow absolute inset-0 rounded-full border border-dashed border-gold/40" />
              <div className="anim-spin-slower absolute inset-3 rounded-full border border-gold/25" />
              <div className="absolute inset-0 rounded-full bg-gold/10 blur-2xl" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/emblem.png"
                alt="الشعار السيادي لوزارة الكشف الدولي لمصر ودول العالم"
                className="anim-float absolute inset-4 rounded-full object-cover shadow-[0_0_80px_rgba(201,162,39,0.35)] ring-2 ring-gold/60"
              />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mb-4 font-amiri text-sm text-gold/90 md:text-base">
              صادرةٌ بالقرار الجمهوري رقم ٢١٧ لسنة ٢٠٢١ والمعدَّل بالقرار رقم ٨٩ لسنة ٢٠٢٦ — جهاز سيادي يتبع رئاسة الجمهورية مباشرةً
            </p>
            <h1 className="gold-text text-glow font-kufi text-[clamp(2.4rem,7vw,5rem)] font-black leading-[1.15]">
              وزارة الكشف الدولي
            </h1>
            <p className="mt-2 font-kufi text-lg font-bold tracking-[0.2em] text-ivory/85 md:text-xl">— لمصر ودول العالم —</p>
            <Ornament className="mt-6" />
            <p className="mx-auto mt-6 max-w-3xl font-kufi text-base leading-8 text-ivory/80 md:text-lg">
              الجهاز السيادي الأعلى المختص برصد وكشف وتحليل النزاعات والمستجدات الدولية ومتابعة الشأن
              الأمني الوطني، يعمل بموجب أحكام الدستور والقانون وقرارات رئيس الجمهورية، وبالتنسيق
              الكامل مع وزارة الدفاع المصرية ووزارة الداخلية المصرية وأجهزة الدولة السيادية.
            </p>
          </Reveal>

          <Reveal delay={0.22} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#services"
              className="group relative overflow-hidden bg-gradient-to-l from-gold-deep via-gold to-gold-bright px-8 py-4 font-kufi text-sm font-extrabold text-obsidian transition hover:brightness-110"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Landmark className="size-4" />
                تقديم طلب فض نزاع
              </span>
            </a>
            <a
              href="#tracking"
              className="flex items-center gap-2 border border-ivory/25 bg-ivory/5 px-8 py-4 font-kufi text-sm font-bold text-ivory backdrop-blur transition hover:border-gold/60 hover:text-gold-bright"
            >
              <FileSearch className="size-4" />
              تتبّع قضية مسجلة
            </a>
          </Reveal>

          <Reveal delay={0.32} className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {[
              { label: "ملف نشط تحت الإدارة", value: activeCount },
              { label: "وساطة وتفاوض جاريان", value: mediationCount },
              { label: "معاهدة موثقة", value: allTreaties.length + 140 },
            ].map((c) => (
              <span
                key={c.label}
                className="flex items-center gap-2 border border-gold/25 bg-obsidian/60 px-4 py-2 text-xs text-ivory/80 backdrop-blur"
              >
                <span className="size-1.5 rounded-full bg-gold anim-pulse-soft" />
                <span className="stat-num font-kufi text-base font-extrabold text-gold-bright">
                  {c.value.toLocaleString("ar-EG")}
                </span>
                {c.label}
              </span>
            ))}
          </Reveal>
        </div>

        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-mute">
          <div className="flex flex-col items-center gap-2 text-[10px]">
            <span className="font-kufi tracking-widest">استكشف البوابة</span>
            <ArrowDown className="size-4 animate-bounce text-gold" />
          </div>
        </div>
      </section>

      {/* ======= STATS BAND ======= */}
      <section className="relative border-y border-gold/15 bg-panel/60">
        <div className="grid-bg absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 divide-x divide-x-reverse divide-line/60 md:grid-cols-4">
          {[
            { value: resolvedCount + 298, label: "قضية محسومة لصالح الدولة", suffix: "" },
            { value: allTreaties.length + 140, label: "معاهدة دولية موثقة", suffix: "" },
            { value: 172, label: "دولة طرف في اتفاقياتنا", suffix: "" },
            { value: 27, label: "فريق وساطة ميداني", suffix: "" },
          ].map((s) => (
            <div key={s.label} className="px-6 py-10 text-center">
              <Counter end={s.value} suffix={s.suffix} className="stat-num gold-text font-kufi text-4xl font-black md:text-5xl" />
              <p className="mt-2 text-xs text-mute">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======= MANDATES ======= */}
      <section id="mandate" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-24">
        <SectionHead
          kicker="الاختصاصات الدستورية"
          title="أسلحة القانون في يد الدولة"
          sub="تمارس الوزارة اختصاصاتها السيادية عبر تسع إدارات مركزية تعمل على مدار الساعة بالتنسيق الكامل مع مؤسسات الدولة السيادية."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MANDATES.map((m, i) => (
            <Reveal key={m.title} delay={(i % 3) * 0.08}>
              <div className="group sheen deep-panel hud-corners relative h-full p-6 transition-all duration-300 hover:border-gold/40">
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid size-12 place-items-center border border-gold/30 bg-gold/5 text-gold transition group-hover:bg-gold/15 group-hover:text-gold-bright">
                    <m.icon className="size-6" />
                  </span>
                  <span className="stat-num font-kufi text-4xl font-black text-line transition group-hover:text-gold/25">
                    {(i + 1).toLocaleString("ar-EG").padStart(2, "٠")}
                  </span>
                </div>
                <h3 className="font-kufi text-lg font-bold text-ivory transition group-hover:text-gold-bright">
                  {m.title}
                </h3>
                <p className="mt-2 text-[13px] leading-6 text-mute">{m.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ======= DISPUTE EXPLORER ======= */}
      <section id="disputes" className="relative scroll-mt-24 border-t border-line/60 bg-panel/40 py-24">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-4">
          <SectionHead
            kicker="قاعدة البيانات السيادية"
            title="خارطة ملفات النزاع الدولي"
            sub="تصفح التصنيفات الثمانية لملفات النزاع المُدارة من الوزارة — بيانات حية من السجل المركزي."
          />
          <Reveal>
            <DisputeExplorer disputes={explorerRows} />
          </Reveal>
        </div>
      </section>

      {/* ======= ACTIVE CASES TABLE ======= */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <SectionHead
          kicker="الأولويات الاستراتيجية"
          title="أخطر الملفات قيد المتابعة"
          sub="تحديث لحظي من غرفة العمليات المركزية — مرتبة حسب درجة الأولوية السيادية."
        />
        <Reveal>
          <div className="gold-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-gold/20 px-5 py-3.5">
              <span className="flex items-center gap-2 font-kufi text-sm font-bold text-ivory">
                <Radio className="size-4 text-blood anim-pulse-soft" />
                السجل المركزي للنزاعات — بث مباشر
              </span>
              <span className="border border-line px-2 py-1 text-[10px] text-mute">سرّي — مستوى ثانٍ</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-right text-sm">
                <thead>
                  <tr className="border-b border-line bg-obsidian/60 text-[11px] text-mute">
                    <th className="px-5 py-3 font-medium">رمز الملف</th>
                    <th className="px-5 py-3 font-medium">عنوان النزاع</th>
                    <th className="px-5 py-3 font-medium">التصنيف</th>
                    <th className="px-5 py-3 font-medium">الأولوية</th>
                    <th className="px-5 py-3 font-medium">الحالة</th>
                    <th className="px-5 py-3 font-medium">مرحلة المعالجة</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((d) => (
                    <tr key={d.code} className="group border-b border-line/50 transition hover:bg-gold/5">
                      <td className="px-5 py-4">
                        <span dir="ltr" className="stat-num font-kufi text-xs font-bold tracking-wide text-gold">
                          {d.code}
                        </span>
                      </td>
                      <td className="max-w-[280px] px-5 py-4">
                        <p className="truncate font-kufi text-[13px] font-semibold text-ivory/90">{d.title}</p>
                        <p className="mt-0.5 truncate text-[10px] text-mute">{d.parties}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-ivory/70">{TYPE_LABELS[d.type]}</td>
                      <td className={`px-5 py-4 text-xs font-bold ${PRIORITY_CLASSES[d.priority]}`}>
                        {d.priority === "strategic" && <AlertTriangle className="me-1 inline size-3.5" />}
                        {PRIORITY_LABELS[d.priority]}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`border px-2 py-0.5 text-[10px] ${STATUS_CLASSES[d.status]}`}>
                          {STATUS_LABELS[d.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-24 overflow-hidden bg-line">
                            <div
                              className="h-full bg-gradient-to-l from-gold-deep via-gold to-gold-bright transition-all duration-700 group-hover:brightness-125"
                              style={{ width: `${d.progress}%` }}
                            />
                          </div>
                          <span className="stat-num text-[11px] text-gold-bright">{d.progress.toLocaleString("ar-EG")}٪</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ======= PROCESS ======= */}
      <section id="process" className="relative scroll-mt-24 border-t border-line/60 bg-panel/40 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHead
            kicker="اللائحة التنفيذية"
            title="آلية فض النزاع في ست مراحل"
            sub="مسار إلزامي محكم من القيد حتى التنفيذ الميداني — لا يخرج أي ملف عن رقابة الوزارة."
          />
          <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="absolute inset-x-16 top-10 hidden h-px bg-gradient-to-l from-transparent via-gold/40 to-transparent lg:block" />
            {PROCESS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.07}>
                <div className="group relative h-full border border-line bg-obsidian/70 p-6 transition hover:border-gold/40">
                  <div className="mb-4 flex items-center gap-4">
                    <span className="relative grid size-14 shrink-0 place-items-center border border-gold/40 bg-panel text-gold-bright">
                      <p.icon className="size-6" />
                      <span className="stat-num absolute -top-2 -end-2 grid size-6 place-items-center bg-gold font-kufi text-[11px] font-black text-obsidian">
                        {(i + 1).toLocaleString("ar-EG")}
                      </span>
                    </span>
                    <h3 className="font-kufi text-base font-bold text-ivory group-hover:text-gold-bright">{p.title}</h3>
                  </div>
                  <p className="text-[13px] leading-6 text-mute">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======= SERVICES (form + tracking) ======= */}
      <section id="services" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24">
        <SectionHead
          kicker="الخدمات الإلكترونية"
          title="القنوات الرسمية المؤمّنة"
          sub="قدّم طلبك أو تتبّع ملفك عبر القنوات السيادية المشفّرة — الخدمة متاحة للأفراد والكيانات والبعثات الدبلوماسية."
        />
        <div id="tracking" className="grid scroll-mt-28 gap-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-2" delay={0.05}>
            <TrackingWidget />
          </Reveal>
          <Reveal className="lg:col-span-3" delay={0.12}>
            <RequestForm />
          </Reveal>
        </div>
      </section>

      {/* ======= TREATIES ======= */}
      <section id="treaties" className="relative scroll-mt-24 border-t border-line/60 bg-panel/40 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHead
            kicker="الأرشيف السيادي"
            title="سجل المعاهدات والاتفاقيات"
            sub="منظومة توثيق رقمية مؤمّنة — كل معاهدة مختومة بالختم السيادي وقابلة للتتبع برقم مرجعي فريد."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {allTreaties.map((t, i) => (
              <Reveal key={t.id} delay={(i % 4) * 0.06}>
                <div className="group flex h-full flex-col border border-line bg-obsidian/70 p-5 transition hover:border-gold/40">
                  <div className="mb-3 flex items-center justify-between">
                    <span dir="ltr" className="stat-num border border-gold/30 bg-gold/5 px-2 py-0.5 text-[10px] font-bold tracking-wider text-gold">
                      {t.reference}
                    </span>
                    <span className={`text-[10px] ${t.status === "سارية" ? "text-emerald-400" : "text-gold-bright"}`}>
                      ● {t.status}
                    </span>
                  </div>
                  <h3 className="flex-1 font-kufi text-sm font-bold leading-6 text-ivory/90">{t.title}</h3>
                  <div className="mt-4 space-y-1 border-t border-line/70 pt-3 text-[11px] text-mute">
                    <p>
                      الأطراف: <span className="text-ivory/80">{t.parties}</span>
                    </p>
                    <p>
                      التصنيف: <span className="text-ivory/80">{t.category}</span>
                    </p>
                    <p>
                      التوقيع:{" "}
                      <span className="text-ivory/80">
                        {new Date(t.signedAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long" })}
                      </span>
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ======= NEWS ======= */}
      <section id="news" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24">
        <SectionHead
          kicker="المركز الإعلامي"
          title="البيانات الرسمية والأخبار"
          sub="الصوت الرسمي الوحيد للوزارة — كل ما يُنشر هنا يمثل الموقف السيادي للدولة."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {featured && (
            <Reveal className="lg:col-span-2 lg:row-span-2">
              <article className="group relative h-full min-h-[420px] overflow-hidden border border-gold/25">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.image ?? "/images/summit.jpg"}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/55 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-7">
                  <div className="mb-3 flex items-center gap-2">
                    {featured.urgent && (
                      <span className="flex items-center gap-1 bg-blood px-2 py-1 text-[10px] font-bold text-white">
                        <AlertTriangle className="size-3" /> عاجل
                      </span>
                    )}
                    <span className="border border-gold/40 bg-obsidian/70 px-2 py-1 text-[10px] text-gold-bright">
                      {featured.category}
                    </span>
                    <span className="text-[10px] text-mute">
                      {new Date(featured.publishedAt).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <h3 className="max-w-2xl font-kufi text-xl font-extrabold leading-9 text-ivory md:text-2xl">
                    {featured.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-ivory/70">{featured.excerpt}</p>
                </div>
              </article>
            </Reveal>
          )}
          {restNews.slice(0, 4).map((n, i) => (
            <Reveal key={n.id} delay={i * 0.07}>
              <article className="group flex h-full gap-4 border border-line bg-panel/70 p-4 transition hover:border-gold/40">
                <div className="relative h-24 w-28 shrink-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={n.image ?? "/images/treaty.jpg"} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                  {n.urgent && <span className="absolute top-1 start-1 bg-blood px-1.5 py-0.5 text-[9px] font-bold text-white">عاجل</span>}
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] text-gold/80">
                    {n.category} · {new Date(n.publishedAt).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })}
                  </p>
                  <h3 className="line-clamp-2 font-kufi text-[13px] font-bold leading-6 text-ivory/90">{n.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-mute">{n.excerpt}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ======= CTA OPS ======= */}
      <section className="relative overflow-hidden border-t border-gold/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/theater-map.jpg" alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-l from-obsidian via-obsidian/80 to-obsidian/60" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-24 text-center">
          <ShieldCheck className="size-10 text-gold-bright" />
          <h2 className="max-w-3xl font-kufi text-3xl font-black leading-snug text-ivory md:text-4xl">
            الغرفة لا تنام... <span className="gold-text">والسيادة خط أحمر</span>
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-mute">
            غرفة العمليات المركزية للكشف الدولي تعمل على مدار الساعة بالتنسيق المباشر مع وزارة الدفاع
            المصرية — القيادة الاستراتيجية الموحدة، المنطقتين الغربية والشمالية، وقوات حرس الحدود.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/ops"
              className="group flex items-center gap-2 border border-blood/70 bg-blood/15 px-6 py-4 font-kufi text-sm font-extrabold text-red-200 transition hover:bg-blood/30"
            >
              <Radio className="size-4 anim-pulse-soft" />
              غرفة العمليات المركزية
              <ChevronLeft className="size-4 transition group-hover:-translate-x-1" />
            </Link>
            <Link
              href="/world"
              className="group flex items-center gap-2 bg-gradient-to-l from-gold-deep via-gold to-gold-bright px-6 py-4 font-kufi text-sm font-extrabold text-obsidian transition hover:brightness-110"
            >
              <Globe2 className="size-4" />
              خريطة حروب العالم التفاعلية
              <ChevronLeft className="size-4 transition group-hover:-translate-x-1" />
            </Link>
            <Link
              href="/conflicts"
              className="group flex items-center gap-2 border border-gold/50 bg-gold/10 px-6 py-4 font-kufi text-sm font-extrabold text-gold-bright transition hover:bg-gold/20"
            >
              <AlertTriangle className="size-4" />
              مرصد المسرح العربي 2D
              <ChevronLeft className="size-4 transition group-hover:-translate-x-1" />
            </Link>
            <Link
              href="/league"
              className="group flex items-center gap-2 border border-gold/50 bg-gold/10 px-6 py-4 font-kufi text-sm font-extrabold text-gold-bright transition hover:bg-gold/20"
            >
              <Globe2 className="size-4" />
              الجامعة العربية
              <ChevronLeft className="size-4 transition group-hover:-translate-x-1" />
            </Link>
            <Link
              href="/directorate"
              className="group flex items-center gap-2 border border-ivory/25 bg-ivory/5 px-6 py-4 font-kufi text-sm font-extrabold text-ivory transition hover:border-gold/60 hover:text-gold-bright"
            >
              <Landmark className="size-4" />
              الإدارة المركزية لشؤون فض النزاعات
              <ChevronLeft className="size-4 transition group-hover:-translate-x-1" />
            </Link>
          </div>
          <p className="text-[10px] text-mute">يقتصر الدخول على المصرّح لهم أمنيًا — جميع الجلسات مسجلة ومراقبة</p>
        </div>
      </section>

      {/* ======= FOOTER ======= */}
      <footer className="border-t border-gold/15 bg-panel/70">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/emblem.png" alt="" className="size-14 rounded-full ring-2 ring-gold/50" />
              <div>
                <p className="font-kufi text-sm font-extrabold text-ivory">وزارة الكشف الدولي لمصر ودول العالم</p>
                <p dir="ltr" className="text-[9px] tracking-[0.2em] text-gold/70">M.I.D — SOVEREIGN GATE</p>
              </div>
            </div>
            <p className="text-xs leading-6 text-mute">
              الجهة السيادية المختصة بإدارة ملفات التحكيم والوساطة والتفاوض وترسيم الحدود وتوثيق
              المعاهدات الدولية، وتعمل تحت إشراف رئاسة الجمهورية مباشرة.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-kufi text-sm font-bold text-gold-bright">روابط سيادية</h4>
            <ul className="space-y-2.5 text-xs text-mute">
              {["رئاسة الجمهورية", "مجلس الوزراء", "وزارة الدفاع والإنتاج الحربي", "وزارة الخارجية والهجرة", "الهيئة العامة للاستعلامات", "مجلس الأمن القومي"].map((l) => (
                <li key={l}>
                  <a href="#" className="flex items-center gap-1.5 transition hover:text-gold-bright">
                    <ChevronLeft className="size-3 text-gold/60" /> {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-kufi text-sm font-bold text-gold-bright">الخدمات الإلكترونية</h4>
            <ul className="space-y-2.5 text-xs text-mute">
              {[
                { label: "الإدارة المركزية لشؤون فض النزاعات", href: "/directorate" },
                { label: "الجامعة العربية — الدول الأعضاء", href: "/league" },
                { label: "شبكة البيانات العالمية AI", href: "/network" },
                { label: "خريطة حروب العالم الحقيقية", href: "/world" },
                { label: "مرصد الحروب المباشر", href: "/conflicts" },
                { label: "تقديم طلب فض نزاع", href: "#services" },
                { label: "غرفة العمليات المركزية", href: "/ops" },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="flex items-center gap-1.5 transition hover:text-gold-bright">
                    <ChevronLeft className="size-3 text-gold/60" /> {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-kufi text-sm font-bold text-gold-bright">تواصل سيادي</h4>
            <ul className="space-y-3 text-xs text-mute">
              <li className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-gold/70" />
                القاهرة — كورنيش النيل، ماسبيرو، البرج السيادي الرابع
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-gold/70" />
                الخط الساخن: <span dir="ltr" className="stat-num text-ivory">19455</span> — طوارئ: <span dir="ltr" className="stat-num text-ivory">122</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-gold/70" />
                <span dir="ltr" className="stat-num">sovereign@mids.gov.eg</span>
              </li>
              <li className="flex items-center gap-2">
                <Mic className="size-4 shrink-0 text-gold/70" />
                المكتب الإعلامي: موجز يومي ٩:٠٠ صباحًا
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line/70 bg-obsidian/70">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-[10px] text-mute">
            <p>جميع الحقوق محفوظة © ٢٠٢٦ — وزارة الكشف الدولي لمصر ودول العالم، جمهورية مصر العربية</p>
            <p className="flex items-center gap-1.5">
              <Building2 className="size-3 text-gold/60" />
              هذا الموقع محميٌّ ومراقب وفق قانون مكافحة جرائم تقنية المعلومات رقم ١٧٥ لسنة ٢٠١٨
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
