"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSearch, Loader2, Radar, ShieldAlert } from "lucide-react";

type TrackItem = {
  code: string;
  title: string;
  parties: string;
  typeLabel: string;
  statusLabel: string;
  priorityLabel: string;
  progress: number;
  openedAt: string;
};

export default function TrackingWidget() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [item, setItem] = useState<TrackItem | null>(null);

  async function handleTrack(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setItem(null);
    try {
      const res = await fetch(`/api/track?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.ok) setError(data.error ?? "تعذّر التتبع.");
      else setItem(data.item);
    } catch {
      setError("انقطع الاتصال بالقناة المؤمّنة.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="deep-panel hud-corners relative p-6 md:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-10 place-items-center border border-gold/40 bg-gold/10 text-gold-bright">
          <Radar className="size-5" />
        </span>
        <div>
          <h3 className="font-kufi text-lg font-bold text-ivory">بوابة تتبع القضايا والطلبات</h3>
          <p className="text-xs text-mute">أدخل رمز التتبع (مثال: <span dir="ltr" className="text-gold/80">REQ-2025-78412</span> أو <span dir="ltr" className="text-gold/80">NRD-2025-001</span>)</p>
        </div>
      </div>

      <form onSubmit={handleTrack} className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          dir="ltr"
          placeholder="XXX-0000-00000"
          className="field-input stat-num flex-1 text-center tracking-widest"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-gold px-5 font-kufi text-sm font-bold text-obsidian transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <FileSearch className="size-4" />}
          <span className="hidden sm:inline">تتبّع</span>
        </button>
      </form>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-2 border border-blood/50 bg-blood/10 px-3 py-2 text-xs text-red-300"
          >
            <ShieldAlert className="size-4 shrink-0" />
            {error}
          </motion.div>
        )}
        {item && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 border border-gold/25 bg-panel-2/70 p-5"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="stat-num font-kufi text-sm font-bold tracking-wider text-gold-bright" dir="ltr">
                {item.code}
              </span>
              <span className="border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] text-gold-bright">
                {item.statusLabel}
              </span>
            </div>
            <h4 className="font-kufi text-base font-bold text-ivory">{item.title}</h4>
            <p className="mt-1 text-xs text-mute">{item.parties}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-mute">
              <span>
                التصنيف: <span className="text-ivory/90">{item.typeLabel}</span>
              </span>
              <span>
                الأولوية: <span className="text-ivory/90">{item.priorityLabel}</span>
              </span>
              <span>
                تاريخ القيد:{" "}
                <span className="text-ivory/90">
                  {new Date(item.openedAt).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </span>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[10px] text-mute">
                <span>مرحلة المعالجة</span>
                <span className="stat-num text-gold-bright">{item.progress.toLocaleString("ar-EG")}٪</span>
              </div>
              <div className="h-1.5 overflow-hidden bg-line">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-gradient-to-l from-gold-deep via-gold to-gold-bright"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
