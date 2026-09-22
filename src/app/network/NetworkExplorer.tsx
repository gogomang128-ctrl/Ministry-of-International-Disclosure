"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Brain,
  CheckCircle2,
  ExternalLink,
  FileSearch,
  Gauge,
  Globe2,
  Loader2,
  Radio,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Swords,
  X,
} from "lucide-react";
import { INTENSITY_CHIP, INTENSITY_COLORS, INTENSITY_LABELS } from "@/lib/maps";
import { arName } from "@/lib/country-names";
import Counter from "@/components/fx/Counter";

/* ---------- types ---------- */

interface IntelItem {
  title: string;
  region: string;
  country: string;
  severity: string;
  summary: string;
  source: string;
  url: string;
  at: string;
}

interface IntelPayload {
  ok: boolean;
  aiActive: boolean;
  refreshedAt: string;
  items: IntelItem[];
}

interface Issue {
  title: string;
  severity: string;
  summary: string;
  source: string;
  url: string;
}

interface CountryNode {
  id: number;
  en: string;
  ar: string;
}

interface DossierState {
  key: string;
  ar: string;
  en: string;
  loading: boolean;
  error: string;
  data: { issues: Issue[]; note: string } | null;
  cached: boolean;
  updatedAt: string;
}

const SEV_STYLE: Record<string, string> = {
  high: "border-blood/60 bg-blood/15 text-red-300",
  medium: "border-gold/50 bg-gold/10 text-gold-bright",
  low: "border-sky-500/50 bg-sky-500/10 text-sky-300",
};
const SEV_LABEL: Record<string, string> = { high: "حساسية مرتفعة", medium: "حساسية متوسطة", low: "حساسية منخفضة" };

function agoLive(iso: string, now: number) {
  const s = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (s < 2) return "الآن مباشرة";
  if (s < 60) return `قبل ${s.toLocaleString("ar-EG")} ثانية`;
  const m = Math.floor(s / 60);
  if (m < 60) return m === 1 ? "قبل دقيقة" : m === 2 ? "قبل دقيقتين" : `قبل ${m.toLocaleString("ar-EG")} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return h === 1 ? "قبل ساعة" : h === 2 ? "قبل ساعتين" : `قبل ${h.toLocaleString("ar-EG")} ساعة`;
  const d = Math.floor(h / 24);
  return d === 1 ? "قبل يوم" : `قبل ${d.toLocaleString("ar-EG")} أيام`;
}

export default function NetworkExplorer({
  warInfo,
}: {
  warInfo: Record<number, { code: string; name: string; intensity: string }>;
}) {
  const [countries, setCountries] = useState<CountryNode[]>([]);
  const [intel, setIntel] = useState<IntelPayload>({ ok: true, aiActive: false, refreshedAt: "", items: [] });
  const [latency, setLatency] = useState<number>(0);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "war" | "watch">("all");
  const [dossier, setDossier] = useState<DossierState | null>(null);
  const [now, setNow] = useState(() => Date.now());

  /* ---- every-second ticking + local polling (strong-server reads) ---- */
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1_000);
    const poll = setInterval(async () => {
      try {
        const t0 = performance.now();
        const res = await fetch("/api/intel", { cache: "no-store" });
        const data = (await res.json()) as IntelPayload;
        setLatency(Math.max(1, Math.round(performance.now() - t0)));
        if (data.ok) setIntel(data);
      } catch {
        /* keep last frame */
      }
    }, 1_000);
    // إطلاق أولي فوري
    (async () => {
      try {
        const t0 = performance.now();
        const res = await fetch("/api/intel", { cache: "no-store" });
        const data = (await res.json()) as IntelPayload;
        setLatency(Math.max(1, Math.round(performance.now() - t0)));
        if (data.ok) setIntel(data);
      } catch {
        /* سيعيد الـ poll المحاولة */
      }
    })();
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, []);

  /* ---- load all countries ---- */
  useEffect(() => {
    fetch("/data/countries-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const geos = (topo.objects.countries.geometries as any[]) ?? [];
        const list: CountryNode[] = geos
          .map((g) => ({ id: Number(g.id), en: String(g.properties?.name ?? ""), ar: arName(String(g.properties?.name ?? "")) }))
          .filter((c) => c.en && c.en !== "Antarctica" && !c.en.includes("Antarctic"))
          .sort((a, b) => {
            const aw = warInfo[a.id] ? 0 : 1;
            const bw = warInfo[b.id] ? 0 : 1;
            return aw !== bw ? aw - bw : a.ar.localeCompare(b.ar, "ar");
          });
        setCountries(list);
      })
      .catch(() => setCountries([]));
  }, [warInfo]);

  const visibleCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return countries.filter((c) => {
      if (statusFilter === "war" && !warInfo[c.id]) return false;
      if (statusFilter === "watch" && warInfo[c.id]) return false;
      if (!q) return true;
      return c.ar.includes(q) || c.en.toLowerCase().includes(q);
    });
  }, [countries, query, statusFilter, warInfo]);

  const involvedCount = useMemo(() => countries.filter((c) => warInfo[c.id]).length, [countries, warInfo]);

  const openDossier = useCallback((c: CountryNode) => {
    const key = `${c.id}|${c.en}`;
    setDossier({ key, ar: c.ar, en: c.en, loading: true, error: "", data: null, cached: false, updatedAt: "" });
    fetch(`/api/ai/country?key=${encodeURIComponent(key)}&ar=${encodeURIComponent(c.ar)}&en=${encodeURIComponent(c.en)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setDossier((d) => (d ? { ...d, loading: false, error: data.error ?? "تعذر التوليد." } : d));
        } else {
          setDossier((d) =>
            d
              ? {
                  ...d,
                  loading: false,
                  data: data.payload,
                  cached: Boolean(data.cached),
                  updatedAt: String(data.updatedAt),
                }
              : d
          );
        }
      })
      .catch(() => setDossier((d) => (d ? { ...d, loading: false, error: "انقطع الاتصال بالمحرك." } : d)));
  }, []);

  return (
    <div className="space-y-5">
      {/* ===== stats ===== */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: Globe2, label: "دولة تحت شبكة الرصد", value: countries.length || 177, cls: "text-gold-bright" },
          { icon: Swords, label: "دولة منخرطة في نزاع مسلح", value: involvedCount, cls: "text-red-400" },
          { icon: Brain, label: "نبضة استخباراتية موثقة", value: intel.items.length, cls: "text-violet-300" },
          { icon: Gauge, label: "زمن استجابة السيرفر", value: latency, cls: "text-emerald-300", suffix: " م.ث" },
        ].map((s) => (
          <div key={s.label} className="deep-panel hud-corners flex items-center gap-3 p-4">
            <span className="grid size-10 shrink-0 place-items-center border border-gold/30 bg-gold/5">
              <s.icon className={`size-5 ${s.cls}`} />
            </span>
            <div>
              <Counter end={s.value || 0} suffix={s.suffix ?? ""} className="stat-num block font-kufi text-2xl font-black text-ivory" />
              <span className="text-[10px] text-mute">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== AI LIVE INTEL FEED ===== */}
      <section className="gold-panel hud-corners scanlines relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold/20 px-4 py-3">
          <span className="flex items-center gap-2 font-kufi text-sm font-bold text-ivory">
            <Brain className="size-5 text-violet-300 anim-pulse-soft" />
            محرك الاستخبارات الاصطناعية — بث الأخبار الموثقة لحظة بلحظة
          </span>
          <span className="flex items-center gap-3 text-[10px]">
            <span className={`flex items-center gap-1.5 border px-2 py-1 ${intel.aiActive ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-line text-mute"}`}>
              <span className={`size-1.5 rounded-full ${intel.aiActive ? "bg-emerald-400" : "bg-mute"} anim-pulse-soft`} />
              {intel.aiActive ? "Gemini متصل — التحقق الآلي يعمل" : "وضع الاحتياط — من قاعدة الرصد"}
            </span>
            <span className="hidden border border-line px-2 py-1 text-mute md:block">
              آخر تحديث: <span className="stat-num text-gold-bright">{intel.refreshedAt ? agoLive(intel.refreshedAt, now) : "—"}</span>
            </span>
            <span className="hidden items-center gap-1 text-mute md:flex">
              <Radio className="size-3.5 text-blood anim-blink" />
              تحديث كل ثانية
            </span>
          </span>
        </div>

        <div className="grid max-h-[430px] gap-3 overflow-y-auto p-4 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {intel.items.length === 0 && (
              <div className="col-span-full flex items-center justify-center gap-2 py-14 text-sm text-mute">
                <Loader2 className="size-5 animate-spin text-gold" />
                المحرك الاستخباراتي يجمع أحدث التطورات ويتحقق من مصادرها الآن...
              </div>
            )}
            {intel.items.map((it) => (
              <motion.article
                layout
                key={it.title.slice(0, 48)}
                initial={{ opacity: 0, y: -14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="group border border-line/70 bg-obsidian/70 p-4 transition hover:border-gold/40"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className={`border px-2 py-0.5 text-[9px] font-bold ${INTENSITY_CHIP[it.severity] ?? INTENSITY_CHIP.tension}`}>
                    {INTENSITY_LABELS[it.severity] ?? "تحديث"}
                  </span>
                  <span className="stat-num text-[10px] text-emerald-300/90">{agoLive(it.at, now)}</span>
                </div>
                <h3 className="font-kufi text-[13.5px] font-bold leading-6 text-ivory/95">{it.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-5.5 text-mute">{it.summary}</p>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/60 pt-2.5">
                  <span className="flex items-center gap-1.5 text-[10px] text-mute">
                    <span className="size-1.5 rounded-full" style={{ background: INTENSITY_COLORS[it.severity] ?? "#38bdf8" }} />
                    {it.region}
                    {it.country ? ` · ${it.country}` : ""}
                  </span>
                  <a
                    href={it.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold text-sky-300 transition hover:text-gold-bright"
                  >
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    {it.source}
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* ===== COUNTRIES NETWORK ===== */}
      <section className="deep-panel hud-corners overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <span className="flex items-center gap-2 font-kufi text-sm font-bold text-ivory">
            <Globe2 className="size-4 text-gold-bright" />
            شبكة دول العالم الكاملة — ملفات استخباراتية بالذكاء الاصطناعي
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-mute" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث باسم الدولة (عربي / English)..."
                className="field-input w-60 py-1.5 ps-8 text-xs"
              />
            </div>
            {(
              [
                { key: "all", label: "كل الدول" },
                { key: "war", label: "في نزاع مسلح" },
                { key: "watch", label: "تحت الرصد" },
              ] as const
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`border px-3 py-1.5 font-kufi text-[11px] font-bold transition ${
                  statusFilter === f.key ? "border-gold bg-gold/15 text-gold-bright" : "border-line bg-obsidian/60 text-ivory/70 hover:border-gold/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid max-h-[560px] gap-3 overflow-y-auto p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {countries.length === 0 && (
            <div className="col-span-full flex items-center justify-center gap-2 py-14 text-sm text-mute">
              <Loader2 className="size-5 animate-spin text-gold" />
              جارٍ فهرسة ١٧٧ دولة...
            </div>
          )}
          {countries.length > 0 && visibleCountries.length === 0 && (
            <div className="col-span-full flex items-center justify-center gap-2 py-14 text-sm text-mute">
              <FileSearch className="size-5 text-gold" />
              لا توجد نتائج مطابقة للبحث «{query}»
            </div>
          )}
          {visibleCountries.map((c) => {
            const war = warInfo[c.id];
            return (
              <motion.div
                key={`${c.id}-${c.en}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`group border p-3.5 transition ${
                  war ? "border-line bg-panel" : "border-line/70 bg-obsidian/60"
                } hover:border-gold/40`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className={`truncate font-kufi text-[14px] font-bold ${war ? "text-ivory" : "text-ivory/85"}`}>{c.ar}</h3>
                    <p dir="ltr" className="truncate text-right text-[10px] text-mute">
                      {c.en} {c.id > 0 ? `· ISO ${c.id}` : ""}
                    </p>
                  </div>
                  {war ? (
                    <span
                      className="shrink-0 border px-1.5 py-0.5 text-[9px] font-bold"
                      style={{ borderColor: `${INTENSITY_COLORS[war.intensity]}88`, color: INTENSITY_COLORS[war.intensity], background: `${INTENSITY_COLORS[war.intensity]}15` }}
                    >
                      {INTENSITY_LABELS[war.intensity]}
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-center gap-1 border border-emerald-500/30 bg-emerald-500/5 px-1.5 py-0.5 text-[9px] text-emerald-300">
                      <span className="size-1 rounded-full bg-emerald-400 anim-pulse-soft" />
                      رصد
                    </span>
                  )}
                </div>
                {war && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-red-300/90">
                    <Swords className="size-3 shrink-0" />
                    <span className="truncate">{war.name}</span>
                  </p>
                )}
                <button
                  onClick={() => openDossier(c)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 border border-gold/30 bg-gold/5 py-1.5 font-kufi text-[11px] font-bold text-gold-bright transition hover:bg-gold/15"
                >
                  <Sparkles className="size-3.5" />
                  الملف الاستخباراتي AI
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ===== dossier slide-over ===== */}
      <AnimatePresence>
        {dossier && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDossier(null)}
              className="fixed inset-0 z-[80] bg-obsidian/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="deep-panel scanlines fixed inset-y-0 right-0 z-[90] flex w-full flex-col border-s border-gold/30 sm:w-[520px]"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div>
                  <p className="flex items-center gap-1.5 text-[10px] text-gold">
                    <Brain className="size-3.5" />
                    ملف استخباراتي مولّد وموثّق بالمصادر
                  </p>
                  <h3 className="mt-1 font-kufi text-xl font-black text-ivory">{dossier.ar}</h3>
                  <p dir="ltr" className="text-[10px] text-mute">{dossier.en}</p>
                </div>
                <button onClick={() => setDossier(null)} className="grid size-9 place-items-center border border-line text-mute transition hover:border-gold/50 hover:text-gold-bright" aria-label="إغلاق">
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {dossier.loading && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[12px] text-violet-300">
                      <Loader2 className="size-4 animate-spin" />
                      المحرك يبحث في أخبار هذا الأسبوع ويتحقق من المصادر المباشرة...
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse space-y-2 border border-line/60 bg-obsidian/60 p-4">
                        <div className="h-3 w-2/3 bg-line/70" />
                        <div className="h-2 w-full bg-line/50" />
                        <div className="h-2 w-5/6 bg-line/40" />
                      </div>
                    ))}
                  </div>
                )}

                {dossier.error && !dossier.loading && (
                  <div className="flex items-center gap-2 border border-blood/50 bg-blood/10 p-4 text-[12px] text-red-300">
                    <ShieldAlert className="size-5 shrink-0" />
                    {dossier.error}
                  </div>
                )}

                {dossier.data && !dossier.loading && (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2 text-[10px] text-mute">
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="size-3" />
                        آخر تحقق: <span className="text-gold-bright">{agoLive(dossier.updatedAt, now)}</span>
                      </span>
                      {dossier.cached && (
                        <span className="flex items-center gap-1 border border-line px-2 py-0.5">
                          <Server className="size-3" />
                          من ذاكرة السيرفر القوية (تخزين ١٢ ساعة)
                        </span>
                      )}
                    </div>

                    {dossier.data.issues.map((iss, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="border border-line bg-obsidian/60 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className={`border px-2 py-0.5 text-[9px] font-bold ${SEV_STYLE[iss.severity]}`}>{SEV_LABEL[iss.severity]}</span>
                          <span className="stat-num text-[10px] font-black text-line">{(i + 1).toLocaleString("ar-EG")}</span>
                        </div>
                        <h4 className="font-kufi text-[13.5px] font-bold leading-6 text-ivory/95">{iss.title}</h4>
                        <p className="mt-1.5 text-[11.5px] leading-6 text-mute">{iss.summary}</p>
                        {iss.url && /^https?:/.test(iss.url) ? (
                          <a href={iss.url} target="_blank" rel="noreferrer" className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-sky-300 transition hover:text-gold-bright">
                            <CheckCircle2 className="size-3.5 text-emerald-400" />
                            تحقق مباشر: {iss.source}
                            <ExternalLink className="size-3" />
                          </a>
                        ) : (
                          <p className="mt-2.5 text-[10px] text-mute">المصدر: {iss.source}</p>
                        )}
                      </motion.div>
                    ))}

                    {dossier.data.note && (
                      <div className="border border-gold/30 bg-gold/5 p-4">
                        <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-gold">
                          <ShieldCheck className="size-3.5" />
                          تقييم المحرك العام
                        </p>
                        <p className="text-[12px] leading-6 text-ivory/85">{dossier.data.note}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="border-t border-line px-5 py-3 text-[9.5px] leading-5 text-mute">
                يولّد هذا الملف محرك Gemini ببحث Google الموثق، وتُراجع الحقائق آليًا قبل العرض. للاستخدام
                التحليلي ولا يُغني عن التقارير الرسمية.
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
