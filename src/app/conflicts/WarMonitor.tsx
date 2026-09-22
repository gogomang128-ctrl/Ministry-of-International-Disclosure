"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Flame,
  MapPin,
  Radio,
  Satellite,
  ShieldCheck,
  Swords,
  Users,
  Zap,
} from "lucide-react";
import { INTENSITY_CHIP, INTENSITY_COLORS, INTENSITY_LABELS, INTENSITY_RANK } from "@/lib/maps";
import Counter from "@/components/fx/Counter";

export interface ConflictRow {
  id: number;
  code: string;
  name: string;
  theater: string;
  parties: string;
  intensity: string;
  statusLabel: string;
  since: string;
  summary: string;
  ministryRole: string;
  latest: string;
  affected: string;
  mx: number;
  my: number;
  updatedAt: string;
}

const HUB = { x: 59, y: 23 }; // القاهرة — غرفة الوزارة

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
  if (d === 2) return "منذ يومين";
  return `منذ ${d.toLocaleString("ar-EG")} أيام`;
}

const RING_SIZE: Record<string, number> = {
  war: 18,
  escalation: 15,
  clashes: 12,
  tension: 10,
  ceasefire: 10,
};

export default function WarMonitor({ initial }: { initial: ConflictRow[] }) {
  const [rows, setRows] = useState<ConflictRow[]>(initial);
  const [selectedId, setSelectedId] = useState<number>(initial[0]?.id ?? 0);
  const [now, setNow] = useState(() => Date.now());
  const lastUserPick = useRef(0);

  // live relative-time ticking
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // polling the live feed
  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch("/api/conflicts", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.ok) setRows(data.conflicts);
        }
      } catch {
        /* keep stale */
      }
    }, 22_000);
    return () => clearInterval(poll);
  }, []);

  // auto-cycle the focus unless the user just picked
  useEffect(() => {
    const t = setInterval(() => {
      if (Date.now() - lastUserPick.current < 20_000 || rows.length === 0) return;
      setSelectedId((prev) => {
        const idx = rows.findIndex((r) => r.id === prev);
        return rows[(idx + 1) % rows.length].id;
      });
    }, 7_000);
    return () => clearInterval(t);
  }, [rows]);

  const selected = rows.find((r) => r.id === selectedId) ?? rows[0];
  const warCount = rows.filter((r) => r.intensity === "war").length;
  const escCount = rows.filter((r) => r.intensity === "escalation").length;
  const clashCount = rows.filter((r) => r.intensity === "clashes").length;

  const pick = (id: number) => {
    lastUserPick.current = Date.now();
    setSelectedId(id);
  };

  return (
    <div className="space-y-4">
      {/* ====== stats strip ====== */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: Satellite, label: "بؤرة تحت الرصد المباشر", value: rows.length, cls: "text-gold-bright" },
          { icon: Flame, label: "حرب مفتوحة الآن", value: warCount, cls: "text-red-400" },
          { icon: Zap, label: "تصعيد مسلح نشط", value: escCount, cls: "text-orange-400" },
          { icon: Swords, label: "اشتباكات متقطعة", value: clashCount, cls: "text-yellow-300" },
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

      <div className="grid gap-4 xl:grid-cols-12">
        {/* ====== 2D LIVE MAP ====== */}
        <div className="deep-panel hud-corners scanlines relative overflow-hidden xl:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
            <span className="flex items-center gap-2 font-kufi text-[13px] font-bold text-ivory">
              <Radio className="size-4 text-blood anim-pulse-soft" />
              خريطة المسرح العربي — بث حربي مباشر 2D
            </span>
            <span className="flex items-center gap-3 text-[10px] text-mute">
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#ef4444]" /> حرب</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#fb923c]" /> تصعيد</span>
              <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-[#facc15]" /> اشتباكات</span>
              <span className="hidden items-center gap-1 sm:flex"><span className="size-2 rounded-full bg-[#38bdf8]" /> توتر</span>
              <span className="hidden items-center gap-1 sm:flex"><span className="size-2 rounded-full bg-[#34d399]" /> هدنة هشة</span>
            </span>
          </div>

          <div className="relative aspect-[16/10] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/mena-war-map.jpg" alt="خريطة الحروب المباشرة" className="absolute inset-0 h-full w-full object-cover opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-obsidian/30" />
            <div className="grid-bg absolute inset-0 opacity-40" />
            {/* radar scan bar */}
            <div className="absolute left-0 h-12 w-full bg-gradient-to-b from-transparent via-blood/10 to-transparent" style={{ animation: "scan-y 9s linear infinite" }} />

            {/* connection lines to Cairo hub */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {rows.map((r) => (
                <line
                  key={r.id}
                  x1={HUB.x}
                  y1={HUB.y}
                  x2={r.mx}
                  y2={r.my}
                  stroke={INTENSITY_COLORS[r.intensity]}
                  strokeOpacity={r.id === selectedId ? 0.85 : 0.3}
                  strokeWidth={r.id === selectedId ? 0.35 : 0.18}
                  strokeDasharray="1.6 1.2"
                  className="dash-flow"
                />
              ))}
            </svg>

            {/* Cairo hub */}
            <div className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${HUB.x}%`, top: `${HUB.y}%` }}>
              <span className="relative block">
                <span className="block size-3 rounded-full bg-gold-bright shadow-[0_0_20px_rgba(238,208,122,1)]" />
                <span className="absolute inset-0 rounded-full border border-gold-bright ping-ring" />
              </span>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 whitespace-nowrap border border-gold/40 bg-obsidian/90 px-2 py-0.5 font-kufi text-[9px] font-bold text-gold-bright">
                غرفة القاهرة السيادية
              </span>
            </div>

            {/* conflict markers */}
            {rows.map((r) => {
              const color = INTENSITY_COLORS[r.intensity] ?? "#38bdf8";
              const size = RING_SIZE[r.intensity] ?? 10;
              const active = r.id === selectedId;
              return (
                <button
                  key={r.id}
                  onClick={() => pick(r.id)}
                  className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${r.mx}%`, top: `${r.my}%` }}
                  aria-label={r.name}
                >
                  <span className="relative block" style={{ width: size, height: size }}>
                    <span
                      className="block size-full rounded-full"
                      style={{
                        background: color,
                        boxShadow: `0 0 ${active ? 26 : 14}px ${color}`,
                      }}
                    />
                    <span
                      className="absolute inset-0 rounded-full border anim-pulse-soft"
                      style={{ borderColor: color, transform: "scale(1.9)" }}
                    />
                    {(r.intensity === "war" || r.intensity === "escalation") && (
                      <span className="absolute inset-0 rounded-full border ping-ring" style={{ borderColor: color }} />
                    )}
                    {active && <span className="absolute -inset-1.5 rounded-full border-2 border-ivory" />}
                  </span>
                  <span
                    className={`pointer-events-none absolute right-1/2 top-full mt-2 translate-x-1/2 whitespace-nowrap border px-2 py-1 text-[10px] transition ${
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    } border-line bg-obsidian/95 text-ivory`}
                  >
                    <span className="font-bold" style={{ color }}>{INTENSITY_LABELS[r.intensity]}</span> — {r.name}
                  </span>
                </button>
              );
            })}

            {/* map corner hud */}
            <div className="absolute bottom-2 left-2 border border-line bg-obsidian/85 px-2.5 py-1 text-[9px] text-mute" dir="ltr">
              LIVE SAT-FEED · REGION: MENA · PROJ: 2D-FLAT · GRID: NATO
            </div>
            <div className="absolute right-2 top-2 flex items-center gap-1.5 border border-blood/50 bg-blood/20 px-2 py-1 text-[9px] font-bold text-red-200">
              <span className="size-1.5 rounded-full bg-red-400 anim-blink" />
              رصد حي — يتحدث كل ٢٢ ثانية
            </div>
          </div>

          {/* quick-select strip */}
          <div className="flex gap-2 overflow-x-auto border-t border-line px-3 py-2.5">
            {rows.map((r) => (
              <button
                key={r.id}
                onClick={() => pick(r.id)}
                className={`flex shrink-0 items-center gap-2 border px-3 py-1.5 text-[11px] transition ${
                  r.id === selectedId
                    ? "border-gold/70 bg-gold/10 text-gold-bright"
                    : "border-line bg-obsidian/60 text-ivory/70 hover:border-gold/30"
                }`}
              >
                <span className="size-1.5 rounded-full" style={{ background: INTENSITY_COLORS[r.intensity] }} />
                {r.name.split("—")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* ====== selected details ====== */}
        <div className="deep-panel hud-corners scanlines relative flex flex-col xl:col-span-4">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="flex items-center gap-2 font-kufi text-[13px] font-bold text-ivory">
              <AlertTriangle className="size-4 text-blood" />
              ملف البؤرة الرئيسية
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
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 space-y-4 p-5"
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`border px-2 py-0.5 text-[10px] font-bold ${INTENSITY_CHIP[selected.intensity]}`}>
                      {INTENSITY_LABELS[selected.intensity]}
                    </span>
                    <span className="border border-line px-2 py-0.5 text-[10px] text-mute">{selected.statusLabel}</span>
                    <span dir="ltr" className="stat-num text-[10px] text-gold/70">{selected.code}</span>
                  </div>
                  <h3 className="font-kufi text-xl font-black leading-8 text-ivory">{selected.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-mute">
                    <MapPin className="size-3.5 text-gold/70" />
                    {selected.theater} · مندلعة منذ {selected.since}
                  </p>
                </div>

                <div className="border-r-2 pr-4" style={{ borderColor: INTENSITY_COLORS[selected.intensity] }}>
                  <p className="text-[10px] font-bold text-mute">أطراف المواجهة</p>
                  <p className="mt-1 font-kufi text-[13px] font-bold text-ivory/90">{selected.parties}</p>
                </div>

                <p className="text-[13px] leading-7 text-ivory/75">{selected.summary}</p>

                <div className="flex items-center gap-2 border border-line bg-obsidian/60 px-3 py-2.5">
                  <Users className="size-4 shrink-0 text-orange-400" />
                  <p className="text-[12px] text-ivory/85">
                    الأثر الإنساني: <span className="font-bold text-gold-bright">{selected.affected}</span>
                  </p>
                </div>

                <div className="border border-gold/25 bg-gold/5 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-gold">
                    <ShieldCheck className="size-3.5" />
                    دور وزارة الكشف الدولي لمصر ودول العالم
                  </p>
                  <p className="text-[12px] leading-6 text-ivory/80">{selected.ministryRole}</p>
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
                      آخر تطور ميداني رُصد الآن
                    </p>
                    <p className="font-kufi text-[12.5px] font-bold leading-6 text-red-100">{selected.latest}</p>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ====== war index list ====== */}
      <div className="deep-panel hud-corners overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="flex items-center gap-2 font-kufi text-[13px] font-bold text-ivory">
            <Flame className="size-4 text-blood" />
            مؤشر البؤر — مرتب بحداثة النبضة الراصدة
          </span>
          <span className="stat-num text-[10px] text-mute">{rows.length.toLocaleString("ar-EG")} بؤرة</span>
        </div>
        <div className="grid max-h-80 gap-px overflow-y-auto bg-line/40 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => pick(r.id)}
              className={`flex items-start gap-3 bg-panel p-4 text-right transition hover:bg-panel-2 ${
                r.id === selectedId ? "bg-gold/5" : ""
              }`}
            >
              <span
                className="mt-1.5 size-2 shrink-0 rounded-full anim-pulse-soft"
                style={{ background: INTENSITY_COLORS[r.intensity], boxShadow: `0 0 10px ${INTENSITY_COLORS[r.intensity]}` }}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-kufi text-[12.5px] font-bold text-ivory/90">{r.name}</span>
                  <span className={`shrink-0 border px-1.5 py-0.5 text-[9px] ${INTENSITY_CHIP[r.intensity]}`}>
                    {INTENSITY_LABELS[r.intensity]}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-mute">{r.parties}</span>
                <span className="mt-1 block text-[10px] text-emerald-300/90">
                  {arAgo(r.updatedAt, now)} — {r.latest}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ticker of latest developments */}
      <div className="flex items-stretch border border-blood/40 bg-blood-deep/80">
        <div className="relative z-10 flex shrink-0 items-center gap-2 bg-blood px-4 py-2 font-kufi text-[11px] font-bold text-white">
          <Zap className="size-4 anim-blink" />
          آخر التطورات
        </div>
        <div dir="ltr" className="relative flex-1 overflow-hidden">
          <div className="anim-marquee flex w-max items-center">
            {[...rows, ...rows].map((r, i) => (
              <span key={i} dir="rtl" className="mx-8 flex items-center gap-2 whitespace-nowrap py-2 text-[11px] text-red-100/90">
                <span className="size-1 rounded-full" style={{ background: INTENSITY_COLORS[r.intensity] }} />
                <strong className="text-gold-bright">{r.name.split("—")[0]}:</strong> {r.latest}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
