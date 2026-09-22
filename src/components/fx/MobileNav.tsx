"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Menu, X } from "lucide-react";

export default function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
        className="grid size-10 place-items-center border border-gold/30 bg-gold/5 text-gold-bright transition hover:bg-gold/15"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-3 top-[calc(100%+6px)] z-[90] border border-gold/30 bg-obsidian/97 shadow-[0_30px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl"
          >
            <div className="grid gap-px bg-line/50 p-1">
              {links.map((l, i) => (
                <motion.a
                  key={l.href + l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i }}
                  className="flex items-center justify-between bg-panel px-4 py-3 text-sm text-ivory/85 transition hover:bg-panel-2 hover:text-gold-bright"
                >
                  {l.label}
                  <ChevronLeft className="size-4 text-gold/60" />
                </motion.a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
