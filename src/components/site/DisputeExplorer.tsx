"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Ship,
  Droplets,
  BarChart3,
  ShieldAlert,
  Globe2,
  Landmark,
  Plane,
  ChevronLeft,
} from "lucide-react";
import { TYPE_DESCRIPTIONS, TYPE_LABELS } from "@/lib/maps";

const ICONS: Record<string, typeof Scale> = {
  territorial: Scale,
  maritime: Ship,
  water: Droplets,
  trade: BarChart3,
  border: ShieldAlert,
  diplomatic: Globe2,
  investment: Landmark,
  airspace: Plane,
};

type Row = {
  id: number;
  code: string;
  title: string;
  type: string;
  statusLabel: string;
  status: string;
  priorityLabel: string;
  progress: number;
  region: string;
};

const STATUS_DOT: Record<string, string> = {
  active: "bg-blood",
  mediation: "bg-gold",
  arbitration: "bg-sky-400",
  negotiation: "bg-violet-400",
  resolved: "bg-emerald-400",
  frozen: "bg-mute",
};

export default function DisputeExplorer({ disputes }: { disputes: Row[] }) {
  const types = Object.keys(TYPE_LABELS);
  const [active, setActive] = useState("water");
  const rows = disputes.filter((d) => d.type === active).slice(0, 4);
  const count = disputes.filter((d) => d.type === active).length;
  const Icon = ICONS[active] ?? Scale;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* type selector */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-5 lg:grid-cols-2 lg:content-start">
        {types.map((t) => {
          const Ic = ICONS[t] ?? Scale;
          const is = t === active;
          return (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`group relative flex flex-col items-start gap-3 border p-4 text-right transition-all duration-300 ${
                is
                  ? "border-gold/70 bg-gold/10 shadow-[0_0_35px_rgba(201,162,39,0.12)]"
                  : "border-line bg-panel hover:border-gold/30 hover:bg-panel-2"
              }`}
            >
              <Ic className={`size-6 transition ${is ? "text-gold-bright" : "text-mute group-hover:text-gold"}`} />
              <span className={`font-kufi text-xs font-bold leading-5 md:text-sm ${is ? "text-gold-bright" : "text-ivory/85"}`}>
                {TYPE_LABELS[t]}
              </span>
              <span className="stat-num text-[10px] text-mute">
                {disputes.filter((d) => d.type === t).length.toLocaleString("ar-EG")} ملف
              </span>
              {is && (
                <motion.span
                  layoutId="type-marker"
                  className="absolute inset-y-0 right-0 w-0.5 bg-gold-bright"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* detail panel */}
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="deep-panel hud-corners relative h-full p-6 md:p-8"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center border border-gold/40 bg-gold/10">
                  <Icon className="size-6 text-gold-bright" />
                </span>
                <div>
                  <h3 className="font-kufi text-xl font-bold text-ivory">{TYPE_LABELS[active]}</h3>
                  <p className="text-[11px] text-mute">
                    قاعدة بيانات الوزارة — <span className="stat-num text-gold">{count.toLocaleString("ar-EG")}</span> ملفًا مسجلًا
                  </p>
                </div>
              </div>
              <span className="hidden border border-line px-2.5 py-1 text-[10px] text-mute md:block">
                تصنيف: سري / محدود
              </span>
            </div>

            <p className="mb-6 border-r-2 border-gold/60 pr-4 text-sm leading-7 text-ivory/80">
              {TYPE_DESCRIPTIONS[active]}
            </p>

            <div className="space-y-3">
              <p className="text-[11px] font-bold text-gold/80">أبرز الملفات المسجلة:</p>
              {rows.length === 0 && (
                <p className="border border-line bg-panel px-4 py-3 text-xs text-mute">
                  لا توجد ملفات مدرجة حاليًا تحت هذا التصنيف.
                </p>
              )}
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="group flex items-center gap-4 border border-line bg-panel px-4 py-3 transition hover:border-gold/40"
                >
                  <span className={`size-2 shrink-0 rounded-full ${STATUS_DOT[r.status] ?? "bg-mute"} anim-pulse-soft`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-kufi text-sm font-semibold text-ivory/90">{r.title}</p>
                    <p className="mt-0.5 text-[10px] text-mute">
                      <span dir="ltr" className="stat-num text-gold/70">{r.code}</span> · {r.region} · {r.priorityLabel}
                    </p>
                  </div>
                  <ChevronLeft className="size-4 text-mute transition group-hover:text-gold-bright" />
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
