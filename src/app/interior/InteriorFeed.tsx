"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Brain,
  Car,
  CheckCircle2,
  Crosshair,
  ExternalLink,
  Eye,
  EyeOff,
  Fingerprint,
  Flame,
  Image as ImageIcon,
  Landmark,
  Loader2,
  LockKeyhole,
  Radio,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Stamp,
  Swords,
  TextQuote,
  Timer,
} from "lucide-react";
import { INTENSITY_CHIP, INTENSITY_COLORS, INTENSITY_LABELS } from "@/lib/maps";
import Counter from "@/components/fx/Counter";

interface InteriorItem {
  title: string;
  category: string;
  severity: string;
  summary: string;
  governorate: string;
  source: string;
  url: string;
  image: string;
  at: string;
}

interface InteriorPayload {
  ok: boolean;
  aiActive: boolean;
  refreshedAt: string;
  items: InteriorItem[];
}

type Level = "public" | "restricted" | "sovereign";

interface Perms {
  images: boolean;
  fullText: boolean;
  redact: boolean;
  level: Level;
  live: boolean;
}

const DEFAULT_PERMS: Perms = { images: true, fullText: true, redact: false, level: "public", live: true };

const CAT_META: Record<string, { icon: typeof Swords; color: string }> = {
  "مكافحة المخدرات": { icon: ShieldAlert, color: "#ef4444" },
  "مكافحة الإرهاب": { icon: Swords, color: "#b3202c" },
  "ضبطيات ومداهمات": { icon: Crosshair, color: "#fb923c" },
  "المرور والحماية": { icon: Car, color: "#38bdf8" },
  "الحماية المدنية": { icon: Flame, color: "#34d399" },
  "السياحة والآثار": { icon: Landmark, color: "#a78bfa" },
  "مضبوطات سيادية": { icon: Stamp, color: "#eed07a" },
  "بيان رسمي": { icon: ScrollText, color: "#eed07a" },
};

const LEVELS: { key: Level; label: string; desc: string }[] = [
  { key: "public", label: "عام", desc: "كامل المحتوى والصور" },
  { key: "restricted", label: "مقيد", desc: "موجز رسمي دون صور" },
  { key: "sovereign", label: "سيادي", desc: "كامل المحتوى بطابع سري" },
];

function ago(iso: string, now: number) {
  if (!iso) return "—";
  const s = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (s < 2) return "الآن مباشرة";
  if (s < 60) return `قبل ${s.toLocaleString("ar-EG")} ثانية`;
  const m = Math.floor(s / 60);
  if (m < 60) return m === 1 ? "قبل دقيقة" : m === 2 ? "قبل دقيقتين" : `قبل ${m.toLocaleString("ar-EG")} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return h === 1 ? "قبل ساعة" : h === 2 ? "قبل ساعتين" : `قبل ${h.toLocaleString("ar-EG")} ساعة`;
  return `قبل ${Math.floor(h / 24).toLocaleString("ar-EG")} يوم`;
}

export default function InteriorFeed() {
  const [items, setItems] = useState<InteriorItem[]>([]);
  const [aiActive, setAiActive] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState("");
  const [latency, setLatency] = useState(0);
  const [perms, setPerms] = useState<Perms>(DEFAULT_PERMS);
  const [now, setNow] = useState(() => Date.now());

  /* hydrate permissions from localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("moi-perms");
      if (raw) setPerms({ ...DEFAULT_PERMS, ...JSON.parse(raw) });
    } catch {
      /* افتراضي */
    }
  }, []);

  const updatePerms = (patch: Partial<Perms>) => {
    setPerms((p) => {
      const next = { ...p, ...patch };
      try {
        localStorage.setItem("moi-perms", JSON.stringify(next));
      } catch {
        /* صامت */
      }
      return next;
    });
  };

  const setLevel = (level: Level) => {
    if (level === "public") updatePerms({ level, images: true, fullText: true });
    else if (level === "restricted") updatePerms({ level, images: false, fullText: false, redact: false });
    else updatePerms({ level, images: true, fullText: true });
  };

  /* per-second ticking + local polling */
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1_000);
    const fetchOnce = async () => {
      try {
        const t0 = performance.now();
        const res = await fetch("/api/interior", { cache: "no-store" });
        const data = (await res.json()) as InteriorPayload;
        setLatency(Math.max(1, Math.round(performance.now() - t0)));
        if (data.ok) {
          setItems(data.items);
          setAiActive(data.aiActive);
          setRefreshedAt(data.refreshedAt);
        }
      } catch {
        /* إطار سابق */
      }
    };
    void fetchOnce();
    const poll = setInterval(() => {
      setPerms((p) => {
        if (p.live) void fetchOnce();
        return p;
      });
    }, 1_000);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, []);

  const categories = useMemo(() => new Set(items.map((i) => i.category)).size, [items]);
  const governorates = useMemo(() => new Set(items.map((i) => i.governorate).filter(Boolean)).size, [items]);
  const timeline = items.slice(0, 6);

  const showImages = perms.images && perms.level !== "restricted";
  const showFull = perms.fullText && perms.level !== "restricted";

  return (
    <div className="space-y-5">
      {/* ===== stats ===== */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: Radio, label: "منشور تحت المتابعة المباشرة", value: items.length, cls: "text-gold-bright" },
          { icon: ShieldCheck, label: "محورًا أمنيًا مغطى", value: categories, cls: "text-red-300" },
          { icon: Fingerprint, label: "محافظة مرصودة", value: governorates, cls: "text-sky-300" },
          { icon: Timer, label: "زمن قراءة السيرفر (م.ث)", value: latency, cls: "text-emerald-300" },
        ].map((s) => (
          <div key={s.label} className="deep-panel hud-corners flex items-center gap-3 p-4">
            <span className="grid size-10 shrink-0 place-items-center border border-gold/30 bg-gold/5">
              <s.icon className={`size-5 ${s.cls}`} />
            </span>
            <div>
              <Counter end={s.value || 0} className="stat-num block font-kufi text-2xl font-black text-ivory" />
              <span className="text-[10px] text-mute">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== permissions console ===== */}
      <section className="gold-panel hud-corners scanlines relative overflow-hidden p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center border border-blood/50 bg-blood/10 text-red-300">
              <LockKeyhole className="size-5" />
            </span>
            <div>
              <h2 className="font-kufi text-base font-black text-ivory">لوحة صلاحيات العرض الإعلامي</h2>
              <p className="text-[10.5px] text-mute">ضوابط سيادية فورية على الصور والنص الإخباري لمنشورات وزارة الداخلية — تُحفظ محليًا بجهازك</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {LEVELS.map((lv) => (
              <button
                key={lv.key}
                onClick={() => setLevel(lv.key)}
                title={lv.desc}
                className={`border px-3 py-1.5 font-kufi text-[11px] font-bold transition ${
                  perms.level === lv.key
                    ? lv.key === "restricted"
                      ? "border-blood bg-blood/20 text-red-200"
                      : "border-gold bg-gold/15 text-gold-bright"
                    : "border-line bg-obsidian/60 text-ivory/70 hover:border-gold/40"
                }`}
              >
                {lv.key === "sovereign" && <Fingerprint className="me-1 inline size-3.5" />}
                {lv.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              key: "images" as const,
              icon: ImageIcon,
              label: "إظهار صور الأخبار",
              on: perms.images && perms.level !== "restricted",
              disabled: perms.level === "restricted",
              onToggle: () => updatePerms({ images: !perms.images }),
            },
            {
              key: "fullText" as const,
              icon: TextQuote,
              label: "النص الإخباري الكامل",
              on: perms.fullText && perms.level !== "restricted",
              disabled: perms.level === "restricted",
              onToggle: () => updatePerms({ fullText: !perms.fullText }),
            },
            {
              key: "redact" as const,
              icon: EyeOff,
              label: "حجب بيانات الهويات",
              on: perms.redact,
              disabled: false,
              onToggle: () => updatePerms({ redact: !perms.redact }),
              invert: true,
            },
            {
              key: "live" as const,
              icon: Radio,
              label: "البث المباشر المتصل",
              on: perms.live,
              disabled: false,
              onToggle: () => updatePerms({ live: !perms.live }),
            },
          ].map((sw) => (
            <button
              key={sw.key}
              onClick={sw.onToggle}
              disabled={sw.disabled}
              className={`flex items-center justify-between border px-3.5 py-2.5 text-right transition ${
                sw.disabled
                  ? "cursor-not-allowed border-line/50 bg-obsidian/40 opacity-45"
                  : sw.on
                    ? "border-gold/40 bg-gold/10"
                    : "border-line bg-obsidian/60 hover:border-gold/30"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <sw.icon className={`size-4 ${sw.on ? "text-gold-bright" : "text-mute"}`} />
                <span className={`font-kufi text-[12px] font-bold ${sw.on ? "text-ivory" : "text-mute"}`}>{sw.label}</span>
              </span>
              <span className={`relative h-5 w-9 rounded-full transition ${sw.on ? "bg-gold/80" : "bg-line"}`}>
                <span
                  className={`absolute top-0.5 size-4 rounded-full bg-obsidian shadow transition-all ${sw.on ? "start-0.5" : "start-[18px]"}`}
                />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-line/60 pt-3 text-[10px] text-mute">
          <span className={`flex items-center gap-1.5 ${aiActive ? "text-emerald-300" : ""}`}>
            <span className={`size-1.5 rounded-full ${aiActive ? "bg-emerald-400" : "bg-gold"} anim-pulse-soft`} />
            {aiActive ? "محرك AI متصل — يرصد منصات الداخلية والصحافة الوطنية" : "وضع الاحتياط — من قاعدة الرصد الدائمة"}
          </span>
          <span>
            آخر تحديث: <span className="stat-num text-gold-bright">{ago(refreshedAt, now)}</span> — التحديث الخارجي كل دقيقتين، والقراءة كل ثانية
          </span>
        </div>
      </section>

      {/* ===== step-by-step live tracking ===== */}
      <section className="deep-panel hud-corners overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="flex items-center gap-2 font-kufi text-[13px] font-bold text-ivory">
            <Activity className="size-4 text-blood anim-pulse-soft" />
            متابعة خطوة بخطوة — سلسلة المنشورات الحية
          </span>
          <span className="text-[10px] text-mute">أحدث ٦ نبضات</span>
        </div>
        <div className="flex gap-0 overflow-x-auto p-4">
          {timeline.map((it, i) => {
            const meta = CAT_META[it.category] ?? CAT_META["بيان رسمي"];
            const Icon = meta.icon;
            return (
              <div key={it.title.slice(0, 30) + i} className="relative min-w-56 flex-1 px-3">
                <div className="flex items-center gap-2">
                  <span
                    className="relative grid size-8 shrink-0 place-items-center rounded-full border-2"
                    style={{ borderColor: meta.color, background: `${meta.color}18` }}
                  >
                    <Icon className="size-4" style={{ color: meta.color }} />
                    {i === 0 && <span className="absolute inset-0 rounded-full border ping-ring" style={{ borderColor: meta.color }} />}
                  </span>
                  {i < timeline.length - 1 && <span className="h-0.5 flex-1 bg-line" />}
                </div>
                <p className="stat-num mt-2 text-[10px] text-emerald-300">{ago(it.at, now)}</p>
                <p className="mt-1 line-clamp-2 font-kufi text-[11px] font-bold leading-5 text-ivory/85">{it.title}</p>
                <p className="mt-0.5 text-[9px] text-mute">{it.category} · {it.governorate}</p>
              </div>
            );
          })}
          {timeline.length === 0 && (
            <div className="flex w-full items-center justify-center gap-2 py-8 text-sm text-mute">
              <Loader2 className="size-5 animate-spin text-gold" />
              جارٍ الاتصال بمنصات الرصد...
            </div>
          )}
        </div>
      </section>

      {/* ===== publications feed ===== */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence initial={false}>
          {items.map((it) => {
            const meta = CAT_META[it.category] ?? CAT_META["بيان رسمي"];
            const Icon = meta.icon;
            const body = showFull ? it.summary : `${it.summary.slice(0, 88)}...`;
            return (
              <motion.article
                layout
                key={it.title.slice(0, 44)}
                initial={{ opacity: 0, y: -14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative overflow-hidden border transition hover:border-gold/40 ${
                  perms.level === "sovereign" ? "hud-corners border-gold/25 bg-panel" : "border-line/70 bg-obsidian/70"
                }`}
              >
                <AnimatePresence initial={false}>
                  {showImages && it.image && (
                    <motion.div
                      key={`img-${it.title.slice(0, 20)}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 150, opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="relative overflow-hidden"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.image} alt="" loading="lazy" decoding="async" className="h-36 w-full object-cover opacity-80 transition duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
                      <span className="absolute bottom-2 start-2 flex items-center gap-1.5 border border-line/60 bg-obsidian/85 px-2 py-0.5 text-[9px] text-mute">
                        <ImageIcon className="size-3 text-gold-bright" />
                        صورة أرشيفية — إدارة العلاقات العامة والإعلام الأمني
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 border px-2 py-0.5 text-[9px] font-bold" style={{ borderColor: `${meta.color}77`, color: meta.color, background: `${meta.color}12` }}>
                      <Icon className="size-3" />
                      {it.category}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className={`border px-1.5 py-0.5 text-[9px] ${INTENSITY_CHIP[it.severity]}`}>{INTENSITY_LABELS[it.severity]}</span>
                      <span className="stat-num text-[10px] text-emerald-300/90">{ago(it.at, now)}</span>
                    </span>
                  </div>

                  <h3 className="font-kufi text-[13.5px] font-bold leading-6.5 text-ivory/95">{it.title}</h3>

                  <div className="relative mt-2">
                    <p className={`text-[11.5px] leading-6 text-mute transition ${perms.redact ? "select-none blur-[3px]" : ""}`}>{body}</p>
                    {perms.redact && (
                      <span className="absolute inset-0 grid place-items-center">
                        <span className="flex items-center gap-1 border border-blood/50 bg-obsidian/90 px-2.5 py-1 font-kufi text-[9.5px] font-bold text-red-300">
                          <EyeOff className="size-3" />
                          محتوى الهويات محجوب بموجب صلاحية مستوى العرض
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/60 pt-2.5">
                    <span className="flex items-center gap-1.5 text-[10px] text-mute">
                      <Landmark className="size-3.5 text-gold/70" />
                      {it.governorate || "على مستوى الجمهورية"}
                    </span>
                    <a href={it.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-sky-300 transition hover:text-gold-bright">
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                      {it.source}
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>

                {perms.level === "sovereign" && (
                  <span dir="ltr" className="pointer-events-none absolute left-2 top-2 rotate-3 border border-blood/60 px-1.5 py-0.5 text-[8px] font-black tracking-widest text-blood/80">
                    SOVEREIGN EYES
                  </span>
                )}
              </motion.article>
            );
          })}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="col-span-full flex items-center justify-center gap-2 border border-line bg-panel/50 py-16 text-sm text-mute">
            <Loader2 className="size-5 animate-spin text-gold" />
            جارٍ الاتصال بمنصات وزارة الداخلية ووكالات الأنباء الوطنية...
          </div>
        )}
      </div>

      {/* ===== official note ===== */}
      <div className="flex flex-wrap items-start gap-3 border border-line bg-panel/50 px-4 py-3.5 text-[10px] leading-5.5 text-mute">
        <Brain className="mt-0.5 size-4 shrink-0 text-violet-300" />
        <p className="flex-1">
          منهجية النشر: ترصد هذه الإدارة ما تصدره منصات وزارة الداخلية المصرية وما تنقله الصحافة
          الوطنية الكبرى عنها لحظة بلحظة، ويتحقق محرك الذكاء الاصطناعي من مطابقة كل منشور لمصدره
          الأصلي قبل العرض. صور الأخبار أرشيفية تعبيرية من أرشيف الإدارة الإعلامية وتُخضع لصلاحيات
          العرض أعلاه. للاطلاع الرسمي المباشر:{" "}
          <a dir="ltr" href="https://moi.gov.eg" target="_blank" rel="noreferrer" className="font-bold text-gold-bright hover:underline">
            moi.gov.eg
          </a>
        </p>
      </div>
    </div>
  );
}
