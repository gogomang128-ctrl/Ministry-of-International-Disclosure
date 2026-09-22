"use client";

import { useEffect, useState } from "react";

export default function LiveClock({ variant = "bar" }: { variant?: "bar" | "panel" }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!now) {
    return <span className="stat-num text-mute">--:--:--</span>;
  }

  const gregorian = new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const hijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const time = new Intl.DateTimeFormat("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);

  if (variant === "panel") {
    return (
      <div className="text-left">
        <div className="stat-num text-2xl font-bold text-gold-bright md:text-3xl" dir="ltr">
          {new Intl.DateTimeFormat("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now)}
        </div>
        <div className="mt-1 text-[11px] text-mute">{gregorian}</div>
        <div className="text-[11px] text-gold/70">{hijri} هـ</div>
      </div>
    );
  }

  return (
    <span className="stat-num text-xs text-mute">
      {time} <span className="mx-1 text-line">|</span> {gregorian} <span className="mx-1 text-line">|</span>{" "}
      <span className="text-gold/80">{hijri} هـ</span>
    </span>
  );
}
