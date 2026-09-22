"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { feature } from "topojson-client";
import { geoEqualEarth, geoPath, geoGraticule } from "d3-geo";
import {
  Activity,
  AlertTriangle,
  ExternalLink,
  Flame,
  Globe2,
  Loader2,
  MapPin,
  Maximize2,
  Minus,
  Plus,
  Radio,
  Satellite,
  ShieldCheck,
  Swords,
  Users,
} from "lucide-react";
import { INTENSITY_CHIP, INTENSITY_COLORS, INTENSITY_LABELS, INTENSITY_RANK } from "@/lib/maps";
import Counter from "@/components/fx/Counter";

export interface WarRow {
  id: number;
  code: string;
  name: string;
  region: string;
  intensity: string;
  statusLabel: string;
  since: string;
  sideA: string;
  sideB: string;
  belligerents: string;
  iso: string;
  summary: string;
  monitorNote: string;
  latest: string;
  affected: string;
  sourceLabel: string;
  sourceUrl: string;
  lat: number;
  lon: number;
  updatedAt: string;
}

const VB_W = 980;
const VB_H = 520;
const CAIRO = { lat: 30, lon: 31.2 };

function arAgo(iso: string, now: number) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "نبضة مباشرة الآن";
  if (m === 1) return "منذ دقيقة";
  if (m === 2) return "منذ دقيقتين";
  if (m <= 10) return `منذ ${m.toLocaleString("ar-EG")} دقائق`;
  if (m < 60) return `منذ ${m.toLocaleString("ar-EG")} دقيقة`;
  const h = Math.floor(m / 60);
  if (h === 1) return "منذ ساعة";
  if (h === 2) return "منذ ساعتين";
  if (h <= 10) return `منذ ${h.toLocaleString("ar-EG")} ساعات`;
  if (h < 24) return `منذ ${h.toLocaleString("ar-EG")} ساعة`;
  const d = Math.floor(h / 24);
  if (d === 1) return "منذ يوم";
  return `منذ ${d.toLocaleString("ar-EG")} أيام`;
}

type GeoFeature = {
  id?: string | number;
  properties: { name: string };
  geometry: unknown;
};

const FILTERS = [
  { key: "all", label: "كل النزاعات" },
  { key: "war", label: "حروب مفتوحة" },
  { key: "escalation", label: "تصعيد مسلح" },
  { key: "clashes", label: "اشتباكات" },
  { key: "tension", label: "توترات" },
];

export default function WorldWarMap({ initial }: { initial: WarRow[] }) {
  const [rows, setRows] = useState<WarRow[]>(initial);
  const [geos, setGeos] = useState<GeoFeature[] | null>(null);
  const [selectedId, setSelectedId] = useState<number>(initial[0]?.id ?? 0);
  const [filter, setFilter] = useState("all");
  const [now, setNow] = useState(() => Date.now());
  const [hover, setHover] = useState<{ x: number; y: number; title: string; sub: string } | null>(null);
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ px: 0, py: 0, vx: 0, vy: 0 });
  const moved = useRef(false);
  const animView = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  /* ---- load real world borders ---- */
  useEffect(() => {
    fetch("/data/countries-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fc = feature(topo, topo.objects.countries) as any;
        setGeos(fc.features as GeoFeature[]);
      })
      .catch(() => setGeos([]));
  }, []);

  /* ---- live clocks & polling ---- */
  useEffect(() => {
    const t1 = setInterval(() => setNow(Date.now()), 10_000);
    const t2 = setInterval(async () => {
      try {
        const res = await fetch("/api/wars", { cache: "no-store" });
        const data = await res.json();
        if (data.ok && data.wars?.length) setRows(data.wars);
      } catch {
        /* keep stale */
      }
    }, 24_000);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, []);

  /* ---- zoom & pan wiring ---- */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const cx = ((e.clientX - rect.left) / rect.width) * VB_W;
      const cy = ((e.clientY - rect.top) / rect.height) * VB_H;
      const factor = e.deltaY < 0 ? 1.2 : 0.84;
      setView((v) => {
        const k = Math.min(12, Math.max(1, v.k * factor));
        const f = k / v.k;
        return { k, x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f };
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const startDrag = (e: React.PointerEvent) => {
    dragging.current = true;
    moved.current = false;
    animView.current = false;
    dragStart.current = { px: e.clientX, py: e.clientY, vx: view.x, vy: view.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const moveDrag = (e: React.PointerEvent) => {
    if (!dragging.current || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const s = VB_W / rect.width;
    const dx = (e.clientX - dragStart.current.px) * s;
    const dy = (e.clientY - dragStart.current.py) * s;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved.current = true;
    setView((v) => ({ ...v, x: dragStart.current.vx + dx, y: dragStart.current.vy + dy }));
  };
  const endDrag = () => {
    dragging.current = false;
  };
  const zoomStep = (f: number) => {
    animView.current = true;
    setView((v) => {
      const k = Math.min(12, Math.max(1, v.k * f));
      const r = k / v.k;
      return { k, x: VB_W / 2 - (VB_W / 2 - v.x) * r, y: VB_H / 2 - (VB_H / 2 - v.y) * r };
    });
  };
  const resetView = () => {
    animView.current = true;
    setView({ k: 1, x: 0, y: 0 });
  };

  /* ---- map math ---- */
  const projection = useMemo(() => geoEqualEarth().fitExtent([[6, 6], [VB_W - 6, VB_H - 6]], { type: "Sphere" }), []);
  const pathGen = useMemo(() => geoPath(projection), [projection]);
  const grat = useMemo(() => geoGraticule().step([20, 20])(), []);

  const visible = useMemo(
    () => rows.filter((r) => filter === "all" || r.intensity === filter),
    [rows, filter]
  );

  // country fill index: iso number -> strongest intensity color among visible wars
  const countryWar = useMemo(() => {
    const m = new Map<number, { color: string; intensity: string; war: WarRow }>();
    for (const w of visible) {
      const color = INTENSITY_COLORS[w.intensity] ?? "#38bdf8";
      for (const raw of w.iso.split(",")) {
        const n = Number(raw.trim());
        if (Number.isNaN(n)) continue;
        const cur = m.get(n);
        if (!cur || (INTENSITY_RANK[w.intensity] ?? 9) < (INTENSITY_RANK[cur.intensity] ?? 9)) {
          m.set(n, { color, intensity: w.intensity, war: w });
        }
      }
    }
    return m;
  }, [visible]);

  const selected = rows.find((r) => r.id === selectedId) ?? visible[0];
  const belligerents = (selected?.belligerents ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  const centerOn = useCallback(
    (w: WarRow) => {
      const p = projection([w.lon, w.lat]);
      if (!p) return;
      animView.current = true;
      const k = 2.4;
      setView({ k, x: VB_W / 2 - p[0] * k, y: VB_H / 2 - p[1] * k });
    },
    [projection]
  );

  const selectWar = useCallback(
    (w: WarRow, zoom: boolean) => {
      setSelectedId(w.id);
      if (zoom) centerOn(w);
    },
    [centerOn]
  );

  const totalWars = rows.filter((r) => r.intensity === "war").length;
  const involvedCountries = useMemo(() => {
    const s = new Set<number>();
    for (const r of rows) r.iso.split(",").forEach((x) => s.add(Number(x.trim())));
    return s.size;
  }, [rows]);
  const regions = useMemo(() => new Set(rows.map((r) => r.region.split("—")[0].trim())).size, [rows]);
  const cairoPt = projection([CAIRO.lon, CAIRO.lat]);

  return (
    <div className="space-y-4">
      {/* ===== stats ===== */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: Flame, label: "حرب مفتوحة حول العالم", value: totalWars, cls: "text-red-400" },
          { icon: Globe2, label: "دولة منخرطة في نزاع", value: involvedCountries, cls: "text-gold-bright" },
          { icon: Satellite, label: "إقليم جغرافي متأثر", value: regions, cls: "text-sky-300" },
          { icon: Users, label: "مليون نازح عالميًا (UNHCR)", value: 122, cls: "text-orange-300" },
        ].map((s) => (
          <div key={s.label} className="deep-panel hud-corners flex items-center gap-3 p-4">
            <span className="grid size-10 shrink-0 place-items-center border border-gold/30 bg-gold/5">
              <s.icon className={`size-5 ${s.cls}`} />
            </span>
            <div>
              <Counter end={s.value} className="stat-num block font-kufi text-2xl font-black text-ivory" />
              <span className="text-[10px] text-mute">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== filter chips ===== */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`border px-3.5 py-1.5 font-kufi text-[11px] font-bold transition ${
              filter === f.key
                ? "border-gold bg-gold/15 text-gold-bright"
                : "border-line bg-panel text-ivory/70 hover:border-gold/40"
            }`}
          >
            {f.key !== "all" && (
              <span className="me-1.5 inline-block size-1.5 rounded-full align-middle" style={{ background: INTENSITY_COLORS[f.key] }} />
            )}
            {f.label}
          </button>
        ))}
        <span className="ms-auto hidden items-center gap-1.5 text-[10px] text-mute md:flex">
          <Radio className="size-3.5 text-blood anim-pulse-soft" />
          يتحدث مباشرة كل ٢٤ ثانية من قاعدة البيانات السيادية
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        {/* ===== REAL INTERACTIVE WORLD MAP ===== */}
        <div className="deep-panel hud-corners scanlines relative overflow-hidden xl:col-span-8">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
            <span className="flex items-center gap-2 font-kufi text-[13px] font-bold text-ivory">
              <Globe2 className="size-4 text-gold-bright" />
              خريطة العالم التفاعلية — النزاعات المسلحة حسب الدولة
            </span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => zoomStep(1.3)} aria-label="تكبير" className="grid size-7 place-items-center border border-line text-mute transition hover:border-gold/50 hover:text-gold-bright">
                <Plus className="size-3.5" />
              </button>
              <button onClick={() => zoomStep(0.77)} aria-label="تصغير" className="grid size-7 place-items-center border border-line text-mute transition hover:border-gold/50 hover:text-gold-bright">
                <Minus className="size-3.5" />
              </button>
              <button onClick={resetView} aria-label="إعادة الضبط" className="grid size-7 place-items-center border border-line text-mute transition hover:border-gold/50 hover:text-gold-bright">
                <Maximize2 className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="relative">
            {!geos && (
              <div className="flex aspect-[980/520] w-full items-center justify-center gap-2 text-mute">
                <Loader2 className="size-5 animate-spin text-gold" />
                جارٍ تحميل حدود دول العالم...
              </div>
            )}
            {geos && (
              <svg
                ref={svgRef}
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                className="block w-full cursor-grab touch-none active:cursor-grabbing"
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerLeave={endDrag}
                onMouseLeave={() => setHover(null)}
              >
                <rect width={VB_W} height={VB_H} fill="#080d15" />
                <g
                  transform={`translate(${view.x} ${view.y}) scale(${view.k})`}
                  style={{ transition: animView.current && !dragging.current ? "transform .5s cubic-bezier(.16,1,.3,1)" : "none" }}
                >
                  {/* graticule */}
                  <path d={pathGen(grat) ?? ""} fill="none" stroke="#c9a227" strokeOpacity={0.08} strokeWidth={0.3 / view.k} />

                  {/* countries */}
                  {geos.map((g, i) => {
                    const id = Number(g.id);
                    const cw = countryWar.get(id);
                    const d = pathGen(g.geometry as never) ?? "";
                    const isSel = selected && cw?.war.id === selected.id;
                    return (
                      <path
                        key={g.id ?? i}
                        d={d}
                        fill={cw ? cw.color : "#111926"}
                        fillOpacity={cw ? (isSel ? 0.85 : 0.5) : 1}
                        stroke={cw ? cw.color : "#26344534"}
                        strokeWidth={(cw ? 0.5 : 0.3) / view.k}
                        className="transition-[fill-opacity] duration-200 hover:fill-opacity-70"
                        onClick={() => {
                          if (!moved.current && cw) selectWar(cw.war, true);
                        }}
                        onMouseMove={(e) => {
                          const rect = svgRef.current?.getBoundingClientRect();
                          if (!rect) return;
                          setHover({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                            title: cw ? cw.war.name : g.properties.name,
                            sub: cw ? `${INTENSITY_LABELS[cw.intensity]} — ${cw.war.belligerents.split(",").slice(0, 3).join("،")}` : "لا نزاع مسلح مُعلن — متابعة روتينية",
                          });
                        }}
                      />
                    );
                  })}

                  {/* Cairo command node */}
                  {cairoPt && (
                    <g transform={`translate(${cairoPt[0]} ${cairoPt[1]})`}>
                      <rect x={-3.2 / view.k} y={-3.2 / view.k} width={6.4 / view.k} height={6.4 / view.k} fill="#eed07a" transform="rotate(45)" />
                      <circle r={9 / view.k} fill="none" stroke="#eed07a" strokeOpacity={0.5} strokeWidth={0.5 / view.k} className="svg-ping" />
                      <text y={-8 / view.k} textAnchor="middle" fontSize={7 / view.k + 2} className="font-kufi" fill="#eed07a" stroke="#06080c" strokeWidth={2.5 / view.k} paintOrder="stroke" fontWeight={700}>
                        القاهرة — مركز المراقبة
                      </text>
                    </g>
                  )}

                  {/* war markers + labels */}
                  {visible.map((w) => {
                    const pt = projection([w.lon, w.lat]);
                    if (!pt) return null;
                    const color = INTENSITY_COLORS[w.intensity] ?? "#38bdf8";
                    const isSel = w.id === selectedId;
                    const major = w.intensity === "war" || w.intensity === "escalation";
                    const showLabel = major || isSel || view.k >= 2.2;
                    const r = (isSel ? 5 : 3.6) / view.k + 1.4;
                    return (
                      <g
                        key={w.id}
                        transform={`translate(${pt[0]} ${pt[1]})`}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!moved.current) selectWar(w, true);
                        }}
                        onMouseMove={(e) => {
                          const rect = svgRef.current?.getBoundingClientRect();
                          if (!rect) return;
                          setHover({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top,
                            title: w.name,
                            sub: `${INTENSITY_LABELS[w.intensity]} — ${w.belligerents.split(",").join(" × ")}`,
                          });
                        }}
                      >
                        <circle r={r} fill={color} style={{ filter: `drop-shadow(0 0 ${6 / view.k}px ${color})` }} />
                        <circle r={r * 2.4} fill="none" stroke={color} strokeWidth={0.6 / view.k} className="svg-ping" />
                        {(w.intensity === "war") && <circle r={r * 3.6} fill="none" stroke={color} strokeOpacity={0.4} strokeWidth={0.5 / view.k} className="svg-ping svg-ping-2" />}
                        {isSel && <circle r={r + 3 / view.k} fill="none" stroke="#ece5d2" strokeWidth={0.8 / view.k} />}
                        {showLabel && (
                          <text
                            y={-(r + 4 / view.k)}
                            textAnchor="middle"
                            fontSize={(major ? 8.5 : 7) / Math.sqrt(view.k)}
                            className="font-kufi"
                            fontWeight={700}
                            fill={color}
                            stroke="#06080c"
                            strokeWidth={2.8 / view.k}
                            paintOrder="stroke"
                          >
                            {w.belligerents.split(",")[0]}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}

            {/* hover tooltip */}
            {hover && (
              <div
                className="pointer-events-none absolute z-30 max-w-60 border border-gold/40 bg-obsidian/95 px-3 py-2 shadow-2xl"
                style={{ left: Math.min(hover.x + 14, 460), top: hover.y - 14 }}
              >
                <p className="font-kufi text-[11px] font-bold text-gold-bright">{hover.title}</p>
                <p className="mt-0.5 text-[10px] leading-4 text-ivory/75">{hover.sub}</p>
              </div>
            )}

            {/* map hud overlays */}
            <div className="pointer-events-none absolute bottom-2 left-2 border border-line bg-obsidian/85 px-2.5 py-1 text-[9px] text-mute" dir="ltr">
              REAL BORDERS · NATURAL EARTH 110m · PROJ: EQUAL-EARTH · ZOOM ×{view.k.toFixed(1)}
            </div>
            <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1.5 border border-blood/50 bg-blood/20 px-2 py-1 text-[9px] font-bold text-red-200">
              <span className="size-1.5 rounded-full bg-red-400 anim-blink" />
              حدود حقيقية — اسحب وكبّر بحرية
            </div>
          </div>

          {/* legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line px-4 py-2.5 text-[10px] text-mute">
            <span className="font-bold text-ivory/70">مفتاح الألوان حسب شدة النزاع:</span>
            {Object.entries(INTENSITY_LABELS).filter(([k]) => k !== "ceasefire").map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm" style={{ background: INTENSITY_COLORS[k] }} />
                {v}
              </span>
            ))}
            <span className="me-auto" />
            <span>انقر أي دولة ملوّنة لعرض ملف نزاعها</span>
          </div>
        </div>

        {/* ===== selected war file ===== */}
        <div className="deep-panel hud-corners scanlines relative flex flex-col xl:col-span-4">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="flex items-center gap-2 font-kufi text-[13px] font-bold text-ivory">
              <AlertTriangle className="size-4 text-blood" />
              ملف النزاع المحدد
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={selected?.updatedAt}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 text-[10px] text-emerald-300"
              >
                <span className="size-1.5 rounded-full bg-emerald-400 anim-pulse-soft" />
                {arAgo(selected?.updatedAt ?? "", now)}
              </motion.span>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 space-y-3.5 p-5"
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`border px-2 py-0.5 text-[10px] font-bold ${INTENSITY_CHIP[selected.intensity]}`}>
                      {INTENSITY_LABELS[selected.intensity]}
                    </span>
                    <span className="border border-line px-2 py-0.5 text-[10px] text-mute">{selected.region}</span>
                  </div>
                  <h3 className="font-kufi text-lg font-black leading-8 text-ivory">{selected.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-mute">
                    <MapPin className="size-3.5 text-gold/70" />
                    مندلع منذ {selected.since} · {selected.statusLabel}
                  </p>
                </div>

                {/* warring countries */}
                <div className="border border-blood/30 bg-blood/5 p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold text-red-300">
                    <Swords className="size-3.5" />
                    الدول والجهات المتحاربة (بالاسم)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {belligerents.map((b) => (
                      <span key={b} className="border border-ivory/20 bg-obsidian/70 px-2 py-1 font-kufi text-[11px] font-bold text-ivory/90">
                        {b}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2.5 space-y-1.5 border-t border-line/60 pt-2 text-[11.5px]">
                    <p className="text-ivory/80"><span className="text-red-400">الطرف الأول: </span>{selected.sideA}</p>
                    <p className="text-ivory/80"><span style={{ color: INTENSITY_COLORS[selected.intensity] }}>الطرف الثاني: </span>{selected.sideB}</p>
                  </div>
                </div>

                <p className="text-[12.5px] leading-6.5 text-ivory/75">{selected.summary}</p>

                <div className="flex items-center gap-2 border border-line bg-obsidian/60 px-3 py-2.5">
                  <Users className="size-4 shrink-0 text-orange-400" />
                  <p className="text-[12px] text-ivory/85">
                    الأثر الإنساني: <span className="font-bold text-gold-bright">{selected.affected}</span>
                  </p>
                </div>

                <div className="border border-gold/25 bg-gold/5 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-gold">
                    <ShieldCheck className="size-3.5" />
                    تغطية المرصد السيادي
                  </p>
                  <p className="text-[11.5px] leading-6 text-ivory/80">{selected.monitorNote}</p>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={selected.latest}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-blood/40 bg-blood/10 p-3"
                  >
                    <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-red-300">
                      <Activity className="size-3.5 anim-pulse-soft" />
                      آخر تطور رُصد
                    </p>
                    <p className="font-kufi text-[12px] font-bold leading-6 text-red-100">{selected.latest}</p>
                  </motion.div>
                </AnimatePresence>

                {/* verified source */}
                <a
                  href={selected.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between border border-sky-500/40 bg-sky-500/10 px-3 py-2.5 transition hover:bg-sky-500/20"
                >
                  <span className="flex items-center gap-2 text-[11px] text-sky-200">
                    <ExternalLink className="size-3.5" />
                    المصدر الموثّق: <span className="font-bold">{selected.sourceLabel}</span>
                  </span>
                  <span className="text-[9px] text-sky-400/70">تحقق مباشر ↗</span>
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
