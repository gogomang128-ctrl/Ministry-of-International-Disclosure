"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ExternalLink,
  Handshake,
  Scale,
  ShieldCheck,
  Swords,
  TrendingUp,
} from "lucide-react";
import { ECONOMIC_ALLIANCES, MILITARY_ALLIANCES, PEACE_AGREEMENTS, type PeaceEntry } from "@/lib/peace";

const TABS = [
  { key: "peace", label: "بنود اتفاقيات السلام", icon: Handshake, color: "#34d399" },
  { key: "military", label: "التحالفات العسكرية والأمنية", icon: Swords, color: "#ef4444" },
  { key: "economic", label: "التحالفات الاقتصادية", icon: TrendingUp, color: "#eed07a" },
];

function EntryCard({ entry, idx, color }: { entry: PeaceEntry; idx: number; color: string }) {
  const [open, setOpen] = useState(idx === 0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="deep-panel overflow-hidden"
    >
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3.5 px-4 py-4 text-right transition hover:bg-gold/5">
        <span
          className="grid size-10 shrink-0 place-items-center border font-kufi text-sm font-black"
          style={{ borderColor: `${color}66`, color, background: `${color}10` }}
        >
          {(idx + 1).toLocaleString("ar-EG").padStart(2, "٠")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-kufi text-sm font-bold text-ivory md:text-[15px]">{entry.title}</span>
          <span className="mt-0.5 block truncate text-[10.5px] text-mute">{entry.parties}</span>
        </span>
        <span className="hidden shrink-0 border border-line px-2 py-0.5 text-[9.5px] text-mute md:block">{entry.year}</span>
        <ChevronDown className={`size-4 shrink-0 text-mute transition-transform duration-300 ${open ? "rotate-180 text-gold-bright" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="border-t border-line px-4 py-4">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px]">
                <span className="border border-gold/40 bg-gold/10 px-2 py-0.5 font-bold text-gold-bright">الحالة: {entry.status}</span>
              </div>
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold text-ivory/70">
                <Scale className="size-3.5 text-gold" />
                البنود الأساسية للاتفاق:
              </p>
              <ul className="space-y-2">
                {entry.clauses.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] leading-6 text-ivory/80">
                    <span className="mt-2 size-1.5 shrink-0 rotate-45 border" style={{ borderColor: color, background: `${color}40` }} />
                    {c}
                  </li>
                ))}
              </ul>
              <a
                href={entry.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex w-fit items-center gap-1.5 border border-sky-500/40 bg-sky-500/10 px-2.5 py-1.5 text-[10px] font-bold text-sky-300 transition hover:text-gold-bright"
              >
                <ShieldCheck className="size-3.5 text-emerald-400" />
                المصدر الموثق: {entry.sourceLabel}
                <ExternalLink className="size-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PeaceExplorer() {
  const [tab, setTab] = useState("peace");
  const meta = TABS.find((t) => t.key === tab)!;
  const data = tab === "peace" ? PEACE_AGREEMENTS : tab === "military" ? MILITARY_ALLIANCES : ECONOMIC_ALLIANCES;

  return (
    <div className="space-y-5">
      {/* tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 border px-4 py-2.5 font-kufi text-[12px] font-bold transition ${
              tab === t.key ? "border-gold bg-gold/15 text-gold-bright" : "border-line bg-panel text-ivory/70 hover:border-gold/40"
            }`}
          >
            <t.icon className="size-4" style={{ color: t.color }} />
            {t.label}
            <span className="stat-num border border-line px-1.5 py-0.5 text-[9px] text-mute">
              {(t.key === "peace" ? PEACE_AGREEMENTS : t.key === "military" ? MILITARY_ALLIANCES : ECONOMIC_ALLIANCES).length.toLocaleString("ar-EG")}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-3"
        >
          {data.map((entry, i) => (
            <EntryCard key={entry.title} entry={entry} idx={i} color={meta.color} />
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="gold-panel p-5 text-[10.5px] leading-6 text-mute">
        <strong className="font-kufi text-gold-bright">منهجية التوثيق: </strong>
        نصوص البنود مختصرة من الوثائق الرسمية المحفوظة في سجل المعاهدات الأوني ({""}
        <span dir="ltr">UN Peacemaker / Treaty Series</span>) وبيانات الأجهزة الرسمية للتكتلات
        المعنية، مع إدراج رابط التحقق المباشر أسفل كل اتفاق.
      </div>
    </div>
  );
}
