"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote,
  BookMarked,
  ChevronDown,
  Gavel,
  Globe2,
  Landmark,
  Scale,
  Search,
  Users,
} from "lucide-react";
import { ARAB_CONSTITUTIONS, EGYPT_LAW, type LawArticle } from "@/lib/egypt-law";

const BRANCH_ICONS: Record<string, typeof Scale> = {
  constitution: Landmark,
  civil: Scale,
  penal: Gavel,
  financial: Banknote,
  social: Users,
};

function ArticleCard({ art, idx, highlight }: { art: LawArticle; idx: number; highlight: string }) {
  const [open, setOpen] = useState(false);
  const hl = (t: string) => {
    if (!highlight) return t;
    const parts = t.split(highlight);
    if (parts.length === 1) return t;
    return parts.map((p, i) => (
      <span key={i}>
        {p}
        {i < parts.length - 1 && <mark className="bg-gold/30 text-gold-bright">{highlight}</mark>}
      </span>
    ));
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="deep-panel hud-corners overflow-hidden"
    >
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3 px-4 py-3.5 text-right transition hover:bg-gold/5">
        <span className="shrink-0 border border-gold/40 bg-gold/10 px-2.5 py-1 font-kufi text-[10px] font-black text-gold-bright" dir="rtl">
          {art.no}
        </span>
        <span className="min-w-0 flex-1 truncate font-kufi text-[13.5px] font-bold text-ivory">{art.title}</span>
        <ChevronDown className={`size-4 shrink-0 text-mute transition-transform ${open ? "rotate-180 text-gold-bright" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.3 }}>
            <div className="border-t border-line px-5 py-4">
              <p className="border-r-2 border-gold/60 pr-4 text-[13px] leading-7.5 text-ivory/85" style={{ whiteSpace: "pre-line" }}>
                {hl(art.text)}
              </p>
              {art.note && (
                <p className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-gold">
                  <BookMarked className="size-3.5" />
                  {art.note}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LawExplorer() {
  const [branch, setBranch] = useState("constitution");
  const [query, setQuery] = useState("");

  const active = EGYPT_LAW.find((b) => b.key === branch)!;
  const articles = useMemo(() => {
    const q = query.trim();
    if (!q) return active.articles;
    return active.articles.filter((a) => a.title.includes(q) || a.text.includes(q) || a.no.includes(q));
  }, [active, query]);

  return (
    <div className="space-y-5">
      {/* branches */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {EGYPT_LAW.map((b) => {
          const Icon = BRANCH_ICONS[b.key] ?? Scale;
          const is = branch === b.key;
          return (
            <button
              key={b.key}
              onClick={() => {
                setBranch(b.key);
                setQuery("");
              }}
              className={`group flex flex-col items-start gap-2.5 border p-4 text-right transition ${
                is ? "border-gold/70 bg-gold/10" : "border-line bg-panel hover:border-gold/30"
              }`}
            >
              <Icon className={`size-6 ${is ? "text-gold-bright" : "text-mute group-hover:text-gold"}`} />
              <span className={`font-kufi text-[12px] font-bold leading-5.5 ${is ? "text-gold-bright" : "text-ivory/85"}`}>{b.name}</span>
              <span className="stat-num text-[9.5px] text-mute">{b.articles.length.toLocaleString("ar-EG")} مادة مختارة</span>
            </button>
          );
        })}
      </div>

      {/* branch header + search */}
      <div className="gold-panel hud-corners relative flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="min-w-0 flex-1">
          <h2 className="font-kufi text-lg font-black text-ivory">{active.name}</h2>
          <p className="mt-1 text-[11.5px] leading-5.5 text-mute">{active.desc}</p>
          <p className="mt-1.5 text-[9.5px] text-gold/80">المرجع الرسمي: {active.source}</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-mute" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في المواد (نصًا أو رقمًا)..."
            className="field-input w-full py-2 ps-8 text-xs"
          />
        </div>
      </div>

      {/* articles */}
      <div className="grid gap-2.5">
        {articles.length === 0 && (
          <div className="border border-line bg-panel/50 py-12 text-center text-sm text-mute">لا توجد مواد مطابقة للبحث «{query}»</div>
        )}
        {articles.map((art, i) => (
          <ArticleCard key={art.no + i} art={art} idx={i} highlight={query.trim()} />
        ))}
      </div>

      {/* Arab constitutions */}
      <div className="deep-panel hud-corners overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Globe2 className="size-4 text-gold-bright" />
          <span className="font-kufi text-[14px] font-bold text-ivory">دساتير والوثائق التأسيسية لدول الجامعة العربية</span>
        </div>
        <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {ARAB_CONSTITUTIONS.map((c) => (
            <div key={c.country} className="border border-line/70 bg-obsidian/60 p-3">
              <p className="font-kufi text-[12.5px] font-bold text-ivory">{c.country}</p>
              <p className="mt-1 text-[10.5px] leading-4.5 text-mute">{c.doc}</p>
              <p className="stat-num mt-1 text-[9px] text-gold/70">منذ {c.year.toLocaleString("ar-EG").replace("٬", "")}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-line bg-obsidian/50 px-4 py-3 text-[9.5px] leading-5 text-mute">
          للنصوص الدستورية الكاملة محكومة التاريخ والتعديلات، راجع مشروع الدساتير العالمية المعتمد أكاديميًا:{" "}
          <a dir="ltr" href="https://www.constituteproject.org/" target="_blank" rel="noreferrer" className="font-bold text-gold-bright hover:underline">
            constituteproject.org
          </a>
          {" — الأرشيف التشريعي العربي التوسعي قيد الإعداد بالإدارة المركزية."}
        </div>
      </div>
    </div>
  );
}
