"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Anchor,
  Cpu,
  Crosshair,
  Fingerprint,
  Gavel,
  Globe as GlobeIcon,
  Handshake,
  Home,
  Inbox,
  Lock,
  Plane,
  Radar,
  Radio,
  Satellite,
  ShieldCheck,
  Signal,
  Swords,
  Target,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OpsPayload, OpsDispute } from "@/lib/ops-data";
import Counter from "@/components/fx/Counter";
import LiveClock from "@/components/fx/LiveClock";

/* ============ helpers ============ */

const PRIORITY_DOT: Record<string, string> = {
  strategic: "#ef4444",
  high: "#eed07a",
  medium: "#38bdf8",
  low: "#8d97a6",
};

const STATUS_CHIP: Record<string, string> = {
  active: "border-blood/60 bg-blood/15 text-red-300",
  mediation: "border-gold/50 bg-gold/10 text-gold-bright",
  arbitration: "border-sky-500/50 bg-sky-500/10 text-sky-300",
  negotiation: "border-violet-400/50 bg-violet-400/10 text-violet-300",
  resolved: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  frozen: "border-mute/40 bg-mute/10 text-mute",
};

type FeedEvent = { id: number; kind: string; text: string; time: string };

const KIND_STYLE: Record<string, string> = {
  برقية: "text-violet-300 border-violet-400/40 bg-violet-400/10",
  حركة: "text-sky-300 border-sky-400/40 bg-sky-400/10",
  تنسيق: "text-gold-bright border-gold/40 bg-gold/10",
  إنذار: "text-red-300 border-blood/50 bg-blood/10",
  تقرير: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
};

const FEED_BUILDERS: { kind: string; build: (d: OpsDispute) => string }[] = [
  { kind: "تنسيق", build: (d) => `جلسة تنسيق مغلقة مع وزارة الدفاع بشأن الملف ${d.code} — ${d.region}` },
  { kind: "برقية", build: (d) => `ورود برقية سرّية من الممثلية المصرية المتابعة للملف ${d.code}` },
  { kind: "حركة", build: (d) => `دورية مشتركة أكملت تأمين قطاع «${d.region}» — الوضع مستقر` },
  { kind: "تقرير", build: (d) => `رفع تقرير ميداني: تقدم معالجة ${d.code} إلى ${d.progress.toLocaleString("ar-EG")}٪` },
  { kind: "إنذار", build: (d) => `رصد حركة غير اعتيادية بالقرب من مسرح «${d.region}» — تحت التحليل` },
  { kind: "حركة", build: (d) => `قناة الإيكاو: مراجعة مسار جوي مرتبط بالملف ${d.code}` },
  { kind: "برقية", build: (d) => `ردّ رسمي من الطرف المقابل في «${d.title.slice(0, 34)}...» — قيد الدراسة` },
  { kind: "تقرير", build: (d) => `إحاطة قانونية جديدة أُرفقت بملف ${d.code} وختمت بالختم السيادي` },
];

const MAP_MARKERS = [
  { x: 47, y: 34, label: "القاهرة — القيادة", level: "cmd" },
  { x: 71, y: 27, label: "معبر رفح", level: "hot" },
  { x: 34, y: 16, label: "شرق المتوسط", level: "hot" },
  { x: 66, y: 58, label: "مثلث حلايب", level: "watch" },
  { x: 79, y: 83, label: "باب المندب", level: "watch" },
  { x: 16, y: 52, label: "الصحراء الغربية", level: "watch" },
  { x: 62, y: 44, label: "محور سيناء", level: "hot" },
];

const MARKER_COLOR: Record<string, string> = {
  cmd: "#eed07a",
  hot: "#ef4444",
  watch: "#38bdf8",
};

function Panel({
  title,
  icon: Icon,
  extra,
  children,
  className = "",
}: {
  title: string;
  icon: typeof Radar;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`deep-panel hud-corners scanlines relative flex min-h-0 flex-col ${className}`}>
      <header className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <span className="flex items-center gap-2 font-kufi text-[13px] font-bold text-ivory">
          <Icon className="size-4 text-gold-bright" />
          {title}
        </span>
        {extra}
      </header>
      <div className="min-h-0 flex-1 p-4">{children}</div>
    </section>
  );
}

/* ============ intro gate ============ */

const GATE_LINES = [
  "تهيئة القناة المشفّرة AES-256 ... تم",
  "التحقق من البصمة السيادية ... مقبول",
  "مزامنة رادار المسرح الإقليمي ... جارٍ",
  "الاتصال بالقيادة الاستراتيجية الموحدة — وزارة الدفاع ... متصل",
  "جارٍ فتح غرفة العمليات المركزية ...",
];

function IntroGate({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    GATE_LINES.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), 420 * (i + 1)));
    });
    timers.push(setTimeout(onDone, 420 * GATE_LINES.length + 700));
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <motion.div
      exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      onClick={onDone}
      className="fixed inset-0 z-[100] grid cursor-pointer place-items-center bg-obsidian"
    >
      <div className="grid-bg absolute inset-0 opacity-30" />
      <div className="relative w-full max-w-md px-6">
        <div className="mb-8 flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/emblem.png" alt="" className="size-24 rounded-full ring-2 ring-gold/60 shadow-[0_0_60px_rgba(201,162,39,0.35)]" />
          <p className="mt-4 font-kufi text-xs font-bold tracking-[0.3em] text-gold">الدخول السيادي المؤمّن</p>
        </div>
        <div className="deep-panel min-h-44 space-y-2 p-5 font-plex text-[13px]" dir="rtl">
          {GATE_LINES.slice(0, step).map((l, i) => (
            <motion.p key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
              <span className={`size-1.5 rounded-full ${i === step - 1 ? "bg-gold anim-blink" : "bg-emerald-400"}`} />
              <span className={i === step - 1 ? "text-gold-bright" : "text-ivory/70"}>{l}</span>
            </motion.p>
          ))}
        </div>
        <p className="mt-4 text-center text-[10px] text-mute">انقر في أي مكان للتجاوز</p>
      </div>
    </motion.div>
  );
}

/* ============ readiness gauge ============ */

function Gauge({ value }: { value: number }) {
  const R = 64;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative mx-auto size-44">
      <svg viewBox="0 0 160 160" className="size-full -rotate-90">
        <circle cx="80" cy="80" r={R} fill="none" stroke="#1c2534" strokeWidth="10" />
        <motion.circle
          cx="80"
          cy="80"
          r={R}
          fill="none"
          stroke="url(#gaugeGold)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C - (C * value) / 100 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        />
        <defs>
          <linearGradient id="gaugeGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8a6d1f" />
            <stop offset="55%" stopColor="#c9a227" />
            <stop offset="100%" stopColor="#eed07a" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Counter end={value} className="stat-num gold-text font-kufi text-4xl font-black" suffix="٪" />
        <span className="mt-1 text-[10px] text-mute">جاهزية آليات الاستجابة</span>
      </div>
    </div>
  );
}

/* ============ radar ============ */

function RadarPanel({ disputes }: { disputes: OpsDispute[] }) {
  const blips = disputes.slice(0, 9).map((d) => {
    const angle = ((d.id * 47) % 360) * (Math.PI / 180);
    const radius = 14 + ((d.id * 31) % 30);
    return {
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
      color: PRIORITY_DOT[d.priority] ?? "#38bdf8",
      label: d.code,
    };
  });

  return (
    <div className="flex h-full flex-col items-center">
      <div className="relative aspect-square w-full max-w-60">
        <div className="absolute inset-0 rounded-full border border-gold/25" />
        <div className="absolute inset-[18%] rounded-full border border-gold/20" />
        <div className="absolute inset-[36%] rounded-full border border-gold/15" />
        <div className="absolute inset-[54%] rounded-full border border-gold/10" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-gold/15" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-gold/15" />
        <div className="radar-sweep-el absolute inset-0" />
        {blips.map((b, i) => (
          <span key={i} className="group absolute" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
            <span
              className="block size-2 -translate-x-1/2 -translate-y-1/2 rounded-full anim-blink"
              style={{ background: b.color, boxShadow: `0 0 12px ${b.color}`, animationDelay: `${i * 0.35}s` }}
            />
            <span dir="ltr" className="stat-num pointer-events-none absolute right-2 top-0 whitespace-nowrap text-[8px] text-ivory/0 transition group-hover:text-ivory/80">
              {b.label}
            </span>
          </span>
        ))}
        <span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-bright shadow-[0_0_20px_rgba(238,208,122,0.9)]" />
      </div>
      <div className="mt-3 grid w-full grid-cols-3 gap-2 text-center text-[10px] text-mute">
        <span className="flex items-center justify-center gap-1"><span className="size-1.5 rounded-full bg-[#ef4444]" /> هدف استراتيجي</span>
        <span className="flex items-center justify-center gap-1"><span className="size-1.5 rounded-full bg-[#eed07a]" /> أولوية مرتفعة</span>
        <span className="flex items-center justify-center gap-1"><span className="size-1.5 rounded-full bg-[#38bdf8]" /> تحت الرصد</span>
      </div>
    </div>
  );
}

/* ============ theater map ============ */

function TheaterMap() {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="relative h-full min-h-64 w-full overflow-hidden border border-line">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/theater-map.jpg" alt="خريطة المسرح" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-obsidian/40" />
      <div className="grid-bg absolute inset-0 opacity-50" />
      <div className="absolute left-0 h-10 w-full bg-gradient-to-b from-transparent via-gold/10 to-transparent" style={{ animation: "scan-y 7s linear infinite" }} />
      {MAP_MARKERS.map((m, i) => (
        <button
          key={i}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          className="group absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${m.x}%`, top: `${m.y}%` }}
        >
          <span className="relative block">
            <span
              className="block size-2.5 rounded-full anim-pulse-soft"
              style={{ background: MARKER_COLOR[m.level], boxShadow: `0 0 14px ${MARKER_COLOR[m.level]}`, animationDelay: `${i * 0.4}s` }}
            />
            <span className="absolute inset-0 rounded-full border ping-ring" style={{ borderColor: MARKER_COLOR[m.level] }} />
          </span>
          <span
            className={`absolute right-4 top-1/2 -translate-y-1/2 whitespace-nowrap border border-line bg-obsidian/90 px-2 py-1 text-[10px] text-ivory transition ${
              hover === i ? "opacity-100" : "opacity-0"
            }`}
          >
            {m.label}
          </span>
        </button>
      ))}
      <div className="absolute bottom-2 right-2 flex items-center gap-3 border border-line bg-obsidian/85 px-2.5 py-1 text-[9px] text-mute">
        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-[#ef4444]" /> بؤرة ساخنة</span>
        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-[#38bdf8]" /> قيد المراقبة</span>
        <span className="flex items-center gap-1"><span className="size-1.5 rounded-full bg-[#eed07a]" /> قيادة</span>
      </div>
      <div className="absolute left-2 top-2 border border-blood/50 bg-blood/15 px-2 py-1 text-[9px] font-bold text-red-300">
        المسرح الإقليمي — عرض مباشر
      </div>
    </div>
  );
}

/* ============ main dashboard ============ */

export default function Dashboard({ initial }: { initial: OpsPayload }) {
  const [data, setData] = useState(initial);
  const [enter, setEnter] = useState(false);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const feedId = useRef(0);

  const pushFeed = useCallback((disputes: OpsDispute[], burst = 1) => {
    if (!disputes.length) return;
    setFeed((prev) => {
      const next = [...prev];
      for (let i = 0; i < burst; i++) {
        const d = disputes[Math.floor(Math.random() * disputes.length)];
        const b = FEED_BUILDERS[Math.floor(Math.random() * FEED_BUILDERS.length)];
        feedId.current += 1;
        next.unshift({
          id: feedId.current,
          kind: b.kind,
          text: b.build(d),
          time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        });
      }
      return next.slice(0, 14);
    });
  }, []);

  useEffect(() => {
    if (!enter) return;
    pushFeed(data.disputes, 5);
    const feedTimer = setInterval(() => pushFeed(data.disputes), 3600);
    const poll = setInterval(async () => {
      try {
        const res = await fetch("/api/ops", { cache: "no-store" });
        if (res.ok) {
          setData(await res.json());
          setLastSync(new Date());
        }
      } catch {
        /* keep stale data */
      }
    }, 18000);
    return () => {
      clearInterval(feedTimer);
      clearInterval(poll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enter]);

  const s = data.stats;
  const statCards = [
    { icon: Swords, label: "نزاعات نشطة", value: s.active, cls: "text-red-300 border-blood/40 bg-blood/10", delta: "تحت السيطرة" },
    { icon: Handshake, label: "وساطات جارية", value: s.mediation + s.negotiation, cls: "text-gold-bright border-gold/40 bg-gold/10", delta: "قنوات مفتوحة" },
    { icon: Gavel, label: "أمام التحكيم الدولي", value: s.arbitration, cls: "text-sky-300 border-sky-500/40 bg-sky-500/10", delta: "جلسات مُدرجة" },
    { icon: ShieldCheck, label: "محسومة لصالح الدولة", value: s.resolved + 298, cls: "text-emerald-300 border-emerald-500/40 bg-emerald-500/10", delta: "منذ ٢٠١٥" },
    { icon: AlertTriangle, label: "ملفات استراتيجية", value: s.strategic, cls: "text-violet-300 border-violet-400/40 bg-violet-400/10", delta: "أولوية قصوى" },
  ];

  const readinessBars = [
    { icon: Swords, label: "التأمين الحدودي", v: 94, c: "#eed07a" },
    { icon: Anchor, label: "الحضور البحري", v: 87, c: "#38bdf8" },
    { icon: Plane, label: "الشبكة الجوية", v: 91, c: "#a78bfa" },
    { icon: Cpu, label: "الدفاع الإلكتروني", v: 88, c: "#34d399" },
  ];

  return (
    <div dir="rtl" className="noise relative min-h-screen overflow-x-clip bg-obsidian font-plex text-ivory">
      <AnimatePresence>{!enter && <IntroGate onDone={() => setEnter(true)} />}</AnimatePresence>

      {/* watermark emblem */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/emblem.png" alt="" className="pointer-events-none fixed left-1/2 top-1/2 z-0 size-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.045]" />

      <div className="relative z-10">
        {/* classification bar */}
        <div className="flex items-center justify-center gap-3 border-b border-blood/50 bg-blood-deep/90 py-1.5 text-[10px] font-bold tracking-[0.25em] text-red-100">
          <Lock className="size-3" />
          <span dir="ltr">TOP SECRET</span>
          <span>سرّي للغاية — يقتصر الاطلاع على المصرّح لهم أمنيًا</span>
          <span className="anim-blink" dir="ltr">//</span>
          <span dir="ltr">EYES ONLY</span>
        </div>

        {/* header */}
        <header className="border-b border-gold/20 bg-panel/70 backdrop-blur">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-3.5">
              <span className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/emblem.png" alt="" className="size-14 rounded-full object-cover ring-2 ring-gold/60" />
                <span className="absolute inset-0 rounded-full ping-ring" />
              </span>
              <div>
                <h1 className="font-kufi text-lg font-black text-ivory md:text-xl">
                  غرفة العمليات المركزية للكشف الدولي
                </h1>
                <p className="mt-0.5 flex items-center gap-2 text-[11px] text-mute">
                  <ShieldCheck className="size-3.5 text-gold-bright" />
                  بالتنسيق الكامل مع <span className="font-bold text-gold-bright">وزارة الدفاع المصرية</span> — القيادة الاستراتيجية الموحدة
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-3 border border-line bg-obsidian/60 px-4 py-2 md:flex">
                <LiveClock variant="panel" />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] text-emerald-300">
                  <Signal className="size-3" /> قناة مؤمّنة — <span dir="ltr" className="stat-num">AES-256</span>
                </span>
                <Link href="/" className="flex items-center justify-center gap-1.5 border border-line px-2.5 py-1 text-[10px] text-mute transition hover:border-gold/50 hover:text-gold-bright">
                  <Home className="size-3" /> البوابة الرئيسية
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] space-y-4 px-4 py-4">
          {/* stat cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {statCards.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: enter ? 1 : 0, y: enter ? 0 : 18 }}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`hud-corners relative border p-4 ${c.cls.split(" ").slice(1).join(" ")}`}
              >
                <div className="flex items-center justify-between">
                  <c.icon className={`size-5 ${c.cls.split(" ")[0]}`} />
                  <span className="text-[9px] text-mute">{c.delta}</span>
                </div>
                <Counter end={c.value} className="stat-num mt-3 block font-kufi text-3xl font-black text-ivory md:text-4xl" />
                <p className="mt-1 text-[11px] text-mute">{c.label}</p>
              </motion.div>
            ))}
          </div>

          {/* charts row */}
          <div className="grid gap-4 xl:grid-cols-12">
            <Panel
              className="xl:col-span-8"
              title="منحنى النزاعات — واردة مقابل محسومة (١٢ شهرًا)"
              icon={Activity}
              extra={
                <span className="flex items-center gap-3 text-[10px] text-mute">
                  <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-[#c9a227]" /> واردة</span>
                  <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-[#34d399]" /> محسومة</span>
                </span>
              }
            >
              <div dir="ltr" className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthly} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gOpen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c9a227" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#c9a227" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gRes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1c2534" strokeDasharray="3 6" />
                    <XAxis dataKey="label" tick={{ fill: "#8d97a6", fontSize: 10 }} stroke="#1c2534" />
                    <YAxis tick={{ fill: "#8d97a6", fontSize: 10 }} stroke="#1c2534" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "#0b0f16", border: "1px solid #1c2534", borderRadius: 2, direction: "rtl" }}
                      labelStyle={{ color: "#eed07a", fontSize: 11 }}
                      itemStyle={{ fontSize: 11 }}
                      formatter={(v) => [`${Number(v).toLocaleString("ar-EG")} ملف`]}
                    />
                    <Area type="monotone" dataKey="opened" stroke="#c9a227" strokeWidth={2} fill="url(#gOpen)" name="واردة" />
                    <Area type="monotone" dataKey="resolved" stroke="#34d399" strokeWidth={2} fill="url(#gRes)" name="محسومة" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel className="xl:col-span-4" title="التوزيع حسب التصنيف" icon={GlobeIcon}>
              <div className="flex h-64 items-center gap-2">
                <div dir="ltr" className="h-full w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.types} dataKey="value" nameKey="label" innerRadius="58%" outerRadius="88%" paddingAngle={3} stroke="none">
                        {data.types.map((t) => (
                          <Cell key={t.type} fill={t.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "#0b0f16", border: "1px solid #1c2534", borderRadius: 2, direction: "rtl" }}
                        itemStyle={{ fontSize: 11 }}
                        formatter={(v) => [`${Number(v).toLocaleString("ar-EG")} ملف`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="flex-1 space-y-2">
                  {data.types.map((t) => (
                    <li key={t.type} className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="flex items-center gap-2 text-ivory/80">
                        <span className="size-2 rounded-sm" style={{ background: t.color }} />
                        {t.label}
                      </span>
                      <span className="stat-num text-mute">{t.value.toLocaleString("ar-EG")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>
          </div>

          {/* radar / map / readiness */}
          <div className="grid gap-4 xl:grid-cols-12">
            <Panel className="xl:col-span-3" title="رادار المسرح الإقليمي" icon={Radar} extra={<Crosshair className="size-4 text-gold/60" />}>
              <RadarPanel disputes={data.disputes} />
            </Panel>

            <Panel
              className="xl:col-span-6"
              title="خريطة المسرح — بؤر التوتر ومواقع الانتشار"
              icon={Satellite}
              extra={<span className="flex items-center gap-1.5 text-[10px] text-red-300"><span className="size-1.5 rounded-full bg-blood anim-blink" /> بث مباشر</span>}
            >
              <TheaterMap />
            </Panel>

            <Panel
              className="xl:col-span-3"
              title="الجاهزية القتالية المساندة"
              icon={Target}
              extra={<Swords className="size-4 text-blood/80" />}
            >
              <Gauge value={s.readiness} />
              <div className="mt-4 space-y-3">
                {readinessBars.map((b) => (
                  <div key={b.label}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 text-ivory/80">
                        <b.icon className="size-3.5" style={{ color: b.c }} />
                        {b.label}
                      </span>
                      <span className="stat-num text-mute">{b.v.toLocaleString("ar-EG")}٪</span>
                    </div>
                    <div className="h-1.5 overflow-hidden bg-line">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: enter ? `${b.v}%` : 0 }}
                        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                        className="h-full"
                        style={{ background: `linear-gradient(to left, ${b.c}55, ${b.c})` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-[11px] text-emerald-300">
                <Fingerprint className="size-4" />
                التنسيق مع هيئة عمليات القوات المسلحة: نشط
              </div>
            </Panel>
          </div>

          {/* feed / requests / regions */}
          <div className="grid gap-4 xl:grid-cols-12">
            <Panel
              className="xl:col-span-5"
              title="سجل العمليات — بث حي"
              icon={Radio}
              extra={<span className="flex items-center gap-1.5 text-[10px] text-red-300"><span className="size-1.5 rounded-full bg-blood anim-blink" /> LIVE</span>}
            >
              <ul className="max-h-80 space-y-2 overflow-y-auto pe-1">
                <AnimatePresence initial={false}>
                  {feed.map((f) => (
                    <motion.li
                      key={f.id}
                      layout
                      initial={{ opacity: 0, y: -14, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-start gap-3 border border-line/70 bg-obsidian/60 px-3 py-2.5"
                    >
                      <span className={`mt-0.5 shrink-0 border px-1.5 py-0.5 text-[9px] font-bold ${KIND_STYLE[f.kind]}`}>{f.kind}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] leading-5 text-ivory/85">{f.text}</p>
                        <p className="stat-num mt-0.5 text-[9px] text-mute" dir="ltr">{f.time}</p>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </Panel>

            <Panel
              className="xl:col-span-3"
              title="طلبات واردة للبوابة"
              icon={Inbox}
              extra={<span className="stat-num border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] text-gold-bright">{data.requests.length.toLocaleString("ar-EG")}</span>}
            >
              <ul className="max-h-80 space-y-2 overflow-y-auto pe-1">
                {data.requests.length === 0 && (
                  <li className="border border-line bg-obsidian/60 px-3 py-6 text-center text-[11px] text-mute">
                    لا توجد طلبات واردة حتى الآن — تظهر هنا طلبات البوابة الرئيسية فورًا.
                  </li>
                )}
                {data.requests.map((r) => (
                  <li key={r.id} className="border border-line/70 bg-obsidian/60 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span dir="ltr" className="stat-num text-[10px] font-bold tracking-wider text-gold">{r.trackingCode}</span>
                      <span className="border border-line px-1.5 py-0.5 text-[9px] text-mute">{r.status}</span>
                    </div>
                    <p className="mt-1.5 truncate text-[12px] font-semibold text-ivory/85">{r.subject}</p>
                    <p className="mt-0.5 truncate text-[10px] text-mute">
                      {r.name} · {r.requestType}
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel className="xl:col-span-4" title="الكثافة حسب المسرح الجغرافي" icon={GlobeIcon}>
              <div className="space-y-3">
                {data.regions.map((r, i) => {
                  const max = data.regions[0]?.value || 1;
                  return (
                    <div key={r.region}>
                      <div className="mb-1 flex items-center justify-between text-[11px]">
                        <span className="text-ivory/80">{r.region}</span>
                        <span className="stat-num text-mute">{r.value.toLocaleString("ar-EG")} ملف</span>
                      </div>
                      <div className="h-2 overflow-hidden bg-line">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: enter ? `${(r.value / max) * 100}%` : 0 }}
                          transition={{ duration: 1.1, delay: 0.25 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full bg-gradient-to-l from-gold-deep via-gold to-gold-bright"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 border-t border-line pt-3 text-[10px] leading-5 text-mute">
                آخر مزامنة مع قاعدة البيانات السيادية:{" "}
                <span className="stat-num text-gold-bright" dir="ltr">
                  {(lastSync ?? new Date()).toLocaleTimeString("ar-EG")}
                </span>{" "}
                — تُحدّث تلقائيًا كل ١٨ ثانية.
              </p>
            </Panel>
          </div>

          {/* table */}
          <Panel
            title="سجل النزاعات المركزي — كامل الملفات"
            icon={Lock}
            extra={
              <span className="stat-num text-[10px] text-mute">
                {data.disputes.length.toLocaleString("ar-EG")} ملفًا مسجلًا
              </span>
            }
          >
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full min-w-[900px] text-right text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-line bg-obsidian text-[11px] text-mute">
                    <th className="px-4 py-2.5 font-medium">الرمز</th>
                    <th className="px-4 py-2.5 font-medium">الملف</th>
                    <th className="px-4 py-2.5 font-medium">المسرح</th>
                    <th className="px-4 py-2.5 font-medium">التصنيف</th>
                    <th className="px-4 py-2.5 font-medium">الأولوية</th>
                    <th className="px-4 py-2.5 font-medium">الحالة</th>
                    <th className="px-4 py-2.5 font-medium">المعالجة</th>
                    <th className="px-4 py-2.5 font-medium">القيد</th>
                  </tr>
                </thead>
                <tbody>
                  {data.disputes.map((d) => (
                    <tr key={d.id} className="border-b border-line/50 transition hover:bg-gold/5">
                      <td className="px-4 py-3">
                        <span dir="ltr" className="stat-num font-kufi text-xs font-bold text-gold">{d.code}</span>
                      </td>
                      <td className="max-w-[300px] px-4 py-3">
                        <p className="truncate font-kufi text-[12.5px] font-semibold text-ivory/90">{d.title}</p>
                        <p className="truncate text-[10px] text-mute">{d.parties}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[11px] text-ivory/70">{d.region}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-[11px] text-ivory/70">{d.typeLabel}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-[11px]" style={{ color: PRIORITY_DOT[d.priority] }}>
                          <span className="size-1.5 rounded-full" style={{ background: PRIORITY_DOT[d.priority] }} />
                          {d.priorityLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`whitespace-nowrap border px-2 py-0.5 text-[10px] ${STATUS_CHIP[d.status]}`}>{d.statusLabel}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-20 overflow-hidden bg-line">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: enter ? `${d.progress}%` : 0 }}
                              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                              className={`h-full ${d.status === "resolved" ? "bg-emerald-400" : "bg-gradient-to-l from-gold-deep to-gold-bright"}`}
                            />
                          </div>
                          <span className="stat-num text-[10px] text-mute">{d.progress.toLocaleString("ar-EG")}٪</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[10px] text-mute">
                        {new Date(d.openedAt).toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* bottom strip */}
          <footer className="flex flex-wrap items-center justify-between gap-2 border border-line bg-panel/60 px-4 py-3 text-[10px] text-mute">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-gold" />
              منظومة القيادة والسيطرة والاتصالات <span dir="ltr" className="stat-num text-gold/80">C4ISR</span> — الإصدار <span dir="ltr" className="stat-num">4.2.1</span>
            </span>
            <span dir="ltr" className="stat-num">
              LAT 30.0444 N — LNG 31.2357 E · CAIRO COMMAND NODE
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 anim-pulse-soft" />
              جميع الأنظمة تعمل بكفاءة — {new Date(data.generatedAt).toLocaleTimeString("ar-EG")}
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
