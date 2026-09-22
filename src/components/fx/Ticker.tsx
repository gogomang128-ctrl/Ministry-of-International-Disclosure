import { Zap } from "lucide-react";

export default function Ticker({ items }: { items: string[] }) {
  const list = [...items, ...items];
  return (
    <div className="relative z-40 flex items-stretch border-b border-blood/40 bg-blood-deep/95">
      <div className="relative z-10 flex shrink-0 items-center gap-2 bg-blood px-4 py-2 font-kufi text-xs font-bold text-white shadow-[10px_0_25px_rgba(0,0,0,0.5)]">
        <Zap className="size-4 anim-blink" />
        عاجل
      </div>
      <div dir="ltr" className="relative flex-1 overflow-hidden">
        <div className="anim-marquee flex w-max items-center">
          {list.map((t, i) => (
            <span key={i} dir="rtl" className="mx-8 flex items-center gap-2 whitespace-nowrap py-2 text-xs text-red-100/90">
              <span className="size-1 rounded-full bg-gold-bright" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
