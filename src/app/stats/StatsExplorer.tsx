"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  ExternalLink,
  FileSearch,
  MapPin,
  Search,
  ShieldCheck,
  Skull,
  Tent,
  Users2,
} from "lucide-react";
import Counter from "@/components/fx/Counter";

export interface ArabStatRow {
  id: number;
  country: string;
  colors: string;
  status: string;
  displaced: string;
  refugeesOut: string;
  deaths: string;
  occupied: string;
  besieged: string;
  fragLevel: string;
  fragNote: string;
  hosting: string;
  sourceLabel: string;
  sourceUrl: string;
}

const FRAG_META: Record<string, { color: string; label: string }> = {
  "حرج": { color: "#ef4444", label: "تفكك حرج" },
  "مرتفع": { color: "#fb923c", label: "تفكك مرتفع" },
  "منخفض": { color: "#facc15", label: "مخاطر منخفضة" },
  "مستقر": { color: "#34d399", label: "مستقر" },
};

const FRAG_ORDER: Record<string, number> = { "حرج": 0, "مرتفع": 1, "منخفض": 2, "مستقر": 3 };

export default function StatsExplorer({ initial }: { initial: ArabStatRow[] }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<string>("all");

  const rows = useMemo(() => {
    const q = query.trim();
    return initial
      .filter((r) => (level === "all" ? true : r.fragLevel === level))
      .filter((r) => (!q ? true : r.country.includes(q) || r.displaced.includes(q)))
      .sort((a, b) => (FRAG_ORDER[a.fragLevel] ?? 9) - (FRAG_ORDER[b.fragLevel] ?? 9));
  }, [initial, query, level]);

  const critical = initial.filter((r) => r.fragLevel === "حرج").length;
  const wars = initial.filter((r) => r.status.includes("حرب")).length;
  const hostingCount = initial.filter((r) => r.hosting !== "—").length;

  return (
    <div className="space-y-5">
      {/* ===== aggregated KPIs ===== */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: Tent, label: "مليون نازح داخلي يوثّق عربيًا", value: 38, cls: "text-red-400", suffix: "+" },
          { icon: Users2, label: "مليون لاجئ عربي بالخارج", value: 22, cls: "text-orange-300", suffix: "+" },
          { icon: AlertTriangle, label: "دولة بوضع تفكك حرج", value: critical, cls: "text-blood" },
          { icon: ShieldCheck, label: "دولة تستضيف لاجئي الجوار", value: hostingCount, cls: "text-emerald-300" },
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

      {/* ===== filters ===== */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-mute" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم الدولة..."
            className="field-input w-52 py-1.5 ps-8 text-xs"
          />
        </div>
        {[
          { key: "all", label: "كل الدول" },
          { key: "حرج", label: "تفكك حرج" },
          { key: "مرتفع", label: "تفكك مرتفع" },
          { key: "منخفض", label: "مخاطر منخفضة" },
          { key: "مستقر", label: "مستقر" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setLevel(f.key)}
            className={`border px-3 py-1.5 font-kufi text-[11px] font-bold transition ${
              level === f.key ? "border-gold bg-gold/15 text-gold-bright" : "border-line bg-panel text-ivory/70 hover:border-gold/40"
            }`}
          >
            {f.key !== "all" && (
              <span className="me-1.5 inline-block size-1.5 rounded-full align-middle" style={{ background: FRAG_META[f.key]?.color }} />
            )}
            {f.label}
          </button>
        ))}
        <span className="stat-num ms-auto text-[10px] text-mute">{rows.length.toLocaleString("ar-EG")} دولة معروضة</span>
      </div>

      {/* ===== cards ===== */}
      <AnimatePresence mode="popLayout">
        <motion.div layout className="grid gap-4 lg:grid-cols-2">
          {rows.length === 0 && (
            <div className="col-span-full flex items-center justify-center gap-2 border border-line bg-panel/50 py-16 text-sm text-mute">
              <FileSearch className="size-5 text-gold" />
              لا توجد نتائج مطابقة لبحثك.
            </div>
          )}
          {rows.map((r) => {
            const [c1, c2, c3] = r.colors.split(",");
            const meta = FRAG_META[r.fragLevel] ?? FRAG_META["مستقر"];
            return (
              <motion.article
                layout
                key={r.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="deep-panel hud-corners group relative overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="block h-6 w-10 overflow-hidden border border-ivory/20 shadow">
                      <span
                        className="block size-full"
                        style={{ background: `linear-gradient(to bottom, ${c1} 0 33.4%, ${c2} 33.4% 66.7%, ${c3} 66.7% 100%)` }}
                      />
                    </span>
                    <div>
                      <h3 className="font-kufi text-lg font-black text-ivory group-hover:text-gold-bright">{r.country}</h3>
                      <p className="text-[10px] text-mute">{r.status}</p>
                    </div>
                  </div>
                  <span
                    className="shrink-0 border px-2 py-1 text-[9.5px] font-bold"
                    style={{ borderColor: `${meta.color}88`, color: meta.color, background: `${meta.color}12` }}
                  >
                    {meta.label}
                  </span>
                </div>

                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  {[
                    { icon: Tent, label: "النازحون بسبب الحروب", value: r.displaced, cls: "text-red-300" },
                    { icon: Users2, label: "اللاجئون خارج الوطن", value: r.refugeesOut, cls: "text-orange-300" },
                    { icon: Skull, label: "القتلى (تراكمي/توثيق)", value: r.deaths, cls: "text-ivory/85" },
                    { icon: MapPin, label: "مناطق محتلة", value: r.occupied, cls: "text-violet-300" },
                    { icon: Crosshair, label: "مناطق محاصرة/تماس", value: r.besieged, cls: "text-sky-300" },
                    { icon: Users2, label: "استضافة اللاجئين", value: r.hosting, cls: "text-emerald-300" },
                  ].map((cell) => (
                    <div key={cell.label} className="border border-line/60 bg-obsidian/60 p-2.5">
                      <p className="mb-1 flex items-center gap-1.5 text-[9px] font-bold text-mute">
                        <cell.icon className="size-3 shrink-0" style={{ color: cell.cls.includes("#") ? undefined : undefined }} />
                        {cell.label}
                      </p>
                      <p className={`text-[11px] font-bold leading-5 ${cell.cls}`}>{cell.value}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-line/70 px-4 py-3">
                  <p className="mb-1.5 flex items-center gap-1.5 text-[9.5px] font-bold" style={{ color: meta.color }}>
                    <AlertTriangle className="size-3.5" />
                    مؤشر التفكك الشعبي والمؤسسي
                  </p>
                  <p className="text-[11.5px] leading-5.5 text-ivory/80">{r.fragNote}</p>
                </div>

                <a
                  href={r.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between border-t border-line bg-obsidian/50 px-4 py-2.5 text-[10px] text-sky-300 transition hover:text-gold-bright"
                >
                  <span className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    تحقق من المصدر: {r.sourceLabel}
                  </span>
                  <ExternalLink className="size-3.5" />
                </a>
              </motion.article>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* methodology */}
      <div className="gold-panel p-5 text-[10.5px] leading-6 text-mute">
        <strong className="font-kufi text-gold-bright">منهجية التحقق: </strong>
        أرقام النزوح وفق تقارير المفوضية السامية للاجئين (UNHCR) ومكتب تنسيق الشؤون الإنسانية (OCHA)
        المنشورة عبر ReliefWeb لكل دولة، وأرقام الضحايا وفق تقديرات ACLED وUNDP والمصادر الصحية الرسمية
        الموثقة بها لكل نزاع، مع الإشارة الواضحة لأي تقدير متباين. يوثق مؤشر التفكك الشعبي قراءة
        تحليلية راصدة للاستقرار الاجتماعي والمؤسسي ولا تعبر بالضرورة عن موقف رسمي.
      </div>
    </div>
  );
}
