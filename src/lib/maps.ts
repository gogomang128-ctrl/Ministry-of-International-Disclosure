export const TYPE_LABELS: Record<string, string> = {
  territorial: "نزاعات حدودية برية",
  maritime: "منازعات بحرية",
  water: "مياه عابرة للحدود",
  trade: "منازعات تجارية",
  border: "توترات حدودية",
  diplomatic: "أزمات دبلوماسية",
  investment: "منازعات استثمارية",
  airspace: "منازعات المجال الجوي",
};

export const TYPE_DESCRIPTIONS: Record<string, string> = {
  territorial:
    "توثيق السندات التاريخية والخرائط السيادية وتمثيل الدولة أمام لجان الترسيم الدولية لحسم النزاعات على الأرض والسيادة الوطنية.",
  maritime:
    "حماية الحقوق الاقتصادية في المناطق الخالصة، ترسيم الحدود البحرية، وتأمين خطوط الملاحة والثروات في المياه الإقليمية.",
  water:
    "صون الحقوق المائية التاريخية في الأنهار الدولية عبر آليات الوساطة المُلزمة ومنع الضرر الجسيم وفق قواعد القانون الدولي.",
  trade:
    "تمثيل الدولة والمصدرين أمام منظمة التجارة العالمية ولجان تسوية المنازعات التجارية والجمركية العابرة للحدود.",
  border:
    "غرف عمليات مشتركة مع وزارة الدفاع المصرية لاحتواء التوترات على الأشرطة الحدودية وحماية المعابر والمنافذ السيادية.",
  diplomatic:
    "قنوات اتصال سرية ومعلنة لاحتواء الأزمات الدبلوماسية، وإعادة التمثيل الكامل، وإدارة ملفات الوساطة بين الأطراف المتنازعة.",
  investment:
    "الدفاع عن مصالح الدولة والمستثمرين أمام المركز الدولي لتسوية منازعات الاستثمار (ICSID) وهيئات التحكيم الكبرى.",
  airspace:
    "معالجة تعارضات المسارات الجوية والمناطق المحظورة بالتنسيق مع سلطة الطيران المدني والمنظمات الدولية المختصة.",
};

export const STATUS_LABELS: Record<string, string> = {
  active: "نشط",
  mediation: "وساطة جارية",
  arbitration: "تحكيم دولي",
  negotiation: "تفاوض",
  resolved: "محسوم",
  frozen: "مجمّد",
};

export const STATUS_CLASSES: Record<string, string> = {
  active: "border-blood/60 bg-blood/15 text-red-300",
  mediation: "border-gold/50 bg-gold/10 text-gold-bright",
  arbitration: "border-sky-500/50 bg-sky-500/10 text-sky-300",
  negotiation: "border-violet-400/50 bg-violet-400/10 text-violet-300",
  resolved: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  frozen: "border-mute/40 bg-mute/10 text-mute",
};

export const PRIORITY_LABELS: Record<string, string> = {
  strategic: "استراتيجي",
  high: "مرتفع",
  medium: "متوسط",
  low: "منخفض",
};

export const PRIORITY_ORDER: Record<string, number> = {
  strategic: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const PRIORITY_CLASSES: Record<string, string> = {
  strategic: "text-blood",
  high: "text-gold-bright",
  medium: "text-ivory/80",
  low: "text-mute",
};

export const TYPE_CHART_COLORS: Record<string, string> = {
  territorial: "#c9a227",
  maritime: "#38bdf8",
  water: "#22d3ee",
  trade: "#eed07a",
  border: "#ef4444",
  diplomatic: "#a78bfa",
  investment: "#34d399",
  airspace: "#fb923c",
};

export const INTENSITY_LABELS: Record<string, string> = {
  war: "حرب مفتوحة",
  escalation: "تصعيد مسلح",
  clashes: "اشتباكات متقطعة",
  tension: "توتر عسكري",
  ceasefire: "وقف إطلاق نار هش",
};

export const INTENSITY_COLORS: Record<string, string> = {
  war: "#ef4444",
  escalation: "#fb923c",
  clashes: "#facc15",
  tension: "#38bdf8",
  ceasefire: "#34d399",
};

export const INTENSITY_CHIP: Record<string, string> = {
  war: "border-red-500/60 bg-red-500/15 text-red-300",
  escalation: "border-orange-500/60 bg-orange-500/15 text-orange-300",
  clashes: "border-yellow-500/60 bg-yellow-500/15 text-yellow-300",
  tension: "border-sky-500/60 bg-sky-500/15 text-sky-300",
  ceasefire: "border-emerald-500/60 bg-emerald-500/15 text-emerald-300",
};

export const INTENSITY_RANK: Record<string, number> = {
  war: 0,
  escalation: 1,
  clashes: 2,
  tension: 3,
  ceasefire: 4,
};

export const REQUEST_TYPES = [
  "تحكيم تجاري دولي",
  "وساطة تجارية",
  "فض نزاع حدودي",
  "منازعة بحرية",
  "نزاع مياه عابرة",
  "منازعة استثمارية",
  "أزمة دبلوماسية",
  "توثيق معاهدة دولية",
  "استشارة قانونية سيادية",
  "بلاغ أمني عاجل",
] as const;
