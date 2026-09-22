import Link from "next/link";
import { Lock, Phone, ShieldHalf } from "lucide-react";
import LiveClock from "@/components/fx/LiveClock";
import MobileNav from "@/components/fx/MobileNav";

export const GOV_LINKS = [
  { href: "/", label: "البوابة الرئيسية" },
  { href: "/interior", label: "أخبار وزارة الداخلية" },
  { href: "/network", label: "شبكة البيانات العالمية" },
  { href: "/stats", label: "بيانات النزوح العربي" },
  { href: "/world", label: "خريطة الحروب العالمية" },
  { href: "/peace", label: "السلام والتحالفات" },
  { href: "/law", label: "القانون والدستور" },
  { href: "/conflicts", label: "مرصد الحروب المباشر" },
  { href: "/league", label: "الجامعة العربية" },
  { href: "/directorate", label: "الإدارة المركزية" },
];

export default function GovHeader({
  title,
  subtitle,
  classified = false,
}: {
  title: string;
  subtitle: string;
  classified?: boolean;
}) {
  return (
    <>
      {/* top strip */}
      <div className="border-b border-line/70 bg-panel/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/emblem.png" alt="شعار الجمهورية" className="size-6 rounded-full ring-1 ring-gold/40" />
            <span className="font-kufi text-[11px] font-bold text-ivory/90">جمهورية مصر العربية</span>
            <Link
              href="/directorate"
              className="hidden border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] text-gold-bright transition hover:bg-gold/20 sm:inline"
            >
              الإدارة المركزية لشؤون فض النزاعات
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <LiveClock variant="bar" />
            <span className="hidden items-center gap-1.5 text-[11px] text-gold-bright md:flex">
              <Phone className="size-3" /> الخط الساخن <span className="stat-num font-bold" dir="ltr">19455</span>
            </span>
          </div>
        </div>
      </div>

      {/* header */}
      <header className="sticky top-0 z-50 border-b border-gold/15 bg-obsidian/85 backdrop-blur-xl">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/emblem.png" alt="شعار الوزارة" className="size-11 rounded-full object-cover ring-2 ring-gold/50" />
            </span>
            <span>
              <span className="block font-kufi text-sm font-extrabold leading-5 text-ivory md:text-base">{title}</span>
              <span className="block text-[10px] text-gold/70">{subtitle}</span>
            </span>
          </div>
          <nav className="hidden items-center gap-3 xl:flex">
            {GOV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="whitespace-nowrap text-[11.5px] text-ivory/75 transition hover:text-gold-bright">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/interior"
              className="flex items-center gap-2 border border-sky-700/70 bg-sky-700/15 px-3.5 py-2 text-xs font-bold text-sky-300 transition hover:bg-sky-700/30"
            >
              <ShieldHalf className="size-3.5" />
              <span className="hidden md:inline">أخبار الداخلية</span>
              <span className="md:hidden">الداخلية</span>
            </Link>
            <Link
              href="/ops"
              className="flex items-center gap-2 border border-blood/60 bg-blood/10 px-3.5 py-2 text-xs font-bold text-red-300 transition hover:bg-blood/25"
            >
              <span className="size-1.5 rounded-full bg-blood anim-blink" />
              <span className="hidden sm:inline">غرفة العمليات</span>
              <Lock className="size-3.5" />
            </Link>
            <MobileNav links={GOV_LINKS} />
          </div>
        </div>
      </header>

      {classified && (
        <div className="flex items-center justify-center gap-3 border-b border-blood/50 bg-blood-deep/90 py-1.5 text-[10px] font-bold tracking-[0.25em] text-red-100">
          <Lock className="size-3" />
          <span dir="ltr">LIVE FEED</span>
          <span>بث مباشر — بيانات المرصد محدّثة لحظيًا من قنوات الوزارة المفتوحة</span>
          <span className="anim-blink" dir="ltr">//</span>
          <span dir="ltr">SITUATION ROOM</span>
        </div>
      )}
    </>
  );
}
