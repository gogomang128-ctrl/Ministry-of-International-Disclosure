"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Copy, Loader2, LockKeyhole, Send, ShieldAlert } from "lucide-react";
import { REQUEST_TYPES } from "@/lib/maps";

export default function RequestForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "حدث خطأ غير متوقع.");
      } else {
        setTrackingCode(data.trackingCode);
      }
    } catch {
      setError("انقطع الاتصال بالقناة المؤمّنة. حاول مجددًا.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gold-panel hud-corners relative overflow-hidden p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center border border-gold/40 bg-gold/10 text-gold-bright">
            <LockKeyhole className="size-5" />
          </span>
          <div>
            <h3 className="font-kufi text-lg font-bold text-ivory">تقديم طلب فض نزاع / خدمة سيادية</h3>
            <p className="text-xs text-mute">نموذج مُشفّر — يُحال مباشرة إلى الإدارة المركزية المختصة</p>
          </div>
        </div>
        <span className="hidden items-center gap-1.5 border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] text-emerald-300 md:flex">
          <span className="size-1.5 rounded-full bg-emerald-400 anim-pulse-soft" />
          اتصال مؤمّن
        </span>
      </div>

      <AnimatePresence mode="wait">
        {trackingCode ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 border border-emerald-500/30 bg-emerald-500/5 p-8 text-center"
          >
            <CheckCircle2 className="size-12 text-emerald-400" />
            <h4 className="font-kufi text-xl font-bold text-emerald-300">تم تسجيل الطلب بنجاح</h4>
            <p className="max-w-md text-sm text-mute">
              خضع طلبك للفحص الأمني الأولي وسيُحال خلال ٤٨ ساعة عمل إلى الإدارة المختصة. احتفظ برمز
              التتبع السيادي:
            </p>
            <div className="flex items-center gap-2 border border-gold/40 bg-obsidian px-4 py-2">
              <span className="stat-num font-kufi text-lg font-bold tracking-wider text-gold-bright" dir="ltr">
                {trackingCode}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(trackingCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                }}
                className="text-mute transition hover:text-gold-bright"
                aria-label="نسخ الرمز"
              >
                <Copy className="size-4" />
              </button>
            </div>
            {copied && <span className="text-xs text-gold">تم النسخ</span>}
            <button
              type="button"
              onClick={() => setTrackingCode("")}
              className="mt-2 text-xs text-mute underline underline-offset-4 hover:text-gold-bright"
            >
              تقديم طلب آخر
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-2"
          >
            <div>
              <label className="mb-1.5 block text-xs text-mute">الاسم / الجهة الطالبة *</label>
              <input name="name" required className="field-input" placeholder="الاسم الكامل أو اسم الكيان الاعتباري" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-mute">الجهة التابعة (اختياري)</label>
              <input name="organization" className="field-input" placeholder="وزارة / شركة / منظمة دولية" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-mute">رقم الهاتف</label>
              <input name="phone" className="field-input" dir="ltr" placeholder="+20 ..." />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-mute">البريد الإلكتروني الرسمي</label>
              <input name="email" type="email" className="field-input" dir="ltr" placeholder="name@entity.gov" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs text-mute">نوع الطلب *</label>
              <select name="requestType" required className="field-input" defaultValue="">
                <option value="" disabled>
                  — اختر نوع الخدمة السيادية —
                </option>
                {REQUEST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs text-mute">موضوع الطلب *</label>
              <input name="subject" required className="field-input" placeholder="ملخص موجز للنزاع أو الخدمة المطلوبة" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs text-mute">تفاصيل النزاع / الوقائع *</label>
              <textarea
                name="details"
                required
                rows={4}
                className="field-input resize-none"
                placeholder="اسرد الوقائع والأطراف والمستندات المؤيدة... جميع البيانات تُعامل بسرية تامة وفق قانون حماية البيانات السيادية."
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 border border-blood/50 bg-blood/10 px-3 py-2 text-xs text-red-300 md:col-span-2">
                <ShieldAlert className="size-4" />
                {error}
              </div>
            )}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden bg-gradient-to-l from-gold-deep via-gold to-gold-bright px-6 py-3.5 font-kufi text-sm font-bold text-obsidian transition hover:brightness-110 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جارٍ الإرسال عبر القناة المؤمّنة...
                  </>
                ) : (
                  <>
                    <Send className="size-4 -scale-x-100" />
                    إرسال الطلب إلى الإدارة المركزية
                  </>
                )}
              </button>
              <p className="mt-2 text-center text-[10px] text-mute">
                بالضغط على إرسال أنت تقرّ بصحة البيانات وتخضع لأحكام قانون التوقيع الإلكتروني رقم ١٥ لسنة ٢٠٠٤
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
