export interface LeagueMember {
  name: string;
  capital: string;
  joined: number;
  region: string;
  colors: [string, string, string];
  founder?: boolean;
  note?: string;
}

export const ARAB_LEAGUE_FOUNDED = "٢٢ مارس ١٩٤٥ — القاهرة";

export const ARAB_LEAGUE_MEMBERS: LeagueMember[] = [
  { name: "جمهورية مصر العربية", capital: "القاهرة", joined: 1945, region: "وادي النيل", colors: ["#ce1126", "#f5f0e6", "#161616"], founder: true, note: "المقر الدائم للأمانة العامة" },
  { name: "المملكة العربية السعودية", capital: "الرياض", joined: 1945, region: "الخليج العربي", colors: ["#006c35", "#0b7a3d", "#006c35"], founder: true },
  { name: "المملكة الأردنية الهاشمية", capital: "عمّان", joined: 1945, region: "المشرق العربي", colors: ["#161616", "#f5f0e6", "#007a3d"], founder: true },
  { name: "جمهورية العراق", capital: "بغداد", joined: 1945, region: "المشرق العربي", colors: ["#ce1126", "#f5f0e6", "#161616"], founder: true },
  { name: "الجمهورية العربية السورية", capital: "دمشق", joined: 1945, region: "المشرق العربي", colors: ["#ce1126", "#f5f0e6", "#161616"], founder: true, note: "عادت عضويتها الكاملة في مايو ٢٠٢٣" },
  { name: "الجمهورية اللبنانية", capital: "بيروت", joined: 1945, region: "المشرق العربي", colors: ["#ee161f", "#f5f0e6", "#ee161f"], founder: true },
  { name: "الجمهورية اليمنية", capital: "صنعاء", joined: 1945, region: "الجزيرة العربية", colors: ["#ce1126", "#f5f0e6", "#161616"], founder: true },
  { name: "دولة ليبيا", capital: "طرابلس", joined: 1953, region: "المغرب العربي", colors: ["#e70013", "#161616", "#239e46"] },
  { name: "جمهورية السودان", capital: "الخرطوم", joined: 1956, region: "وادي النيل", colors: ["#d21034", "#f5f0e6", "#161616"] },
  { name: "المملكة المغربية", capital: "الرباط", joined: 1958, region: "المغرب العربي", colors: ["#c1272d", "#a4202a", "#c1272d"] },
  { name: "الجمهورية التونسية", capital: "تونس", joined: 1958, region: "المغرب العربي", colors: ["#e70013", "#c8102e", "#e70013"] },
  { name: "دولة الكويت", capital: "الكويت", joined: 1961, region: "الخليج العربي", colors: ["#007a3d", "#f5f0e6", "#ce1126"] },
  { name: "الجزائر", capital: "الجزائر", joined: 1962, region: "المغرب العربي", colors: ["#006233", "#f5f0e6", "#d21034"] },
  { name: "الإمارات العربية المتحدة", capital: "أبوظبي", joined: 1971, region: "الخليج العربي", colors: ["#00732f", "#f5f0e6", "#161616"] },
  { name: "مملكة البحرين", capital: "المنامة", joined: 1971, region: "الخليج العربي", colors: ["#f5f0e6", "#ce1126", "#ce1126"] },
  { name: "دولة قطر", capital: "الدوحة", joined: 1971, region: "الخليج العربي", colors: ["#8a1538", "#6e102c", "#8a1538"] },
  { name: "سلطنة عُمان", capital: "مسقط", joined: 1971, region: "الخليج العربي", colors: ["#f5f0e6", "#db161b", "#008000"] },
  { name: "الجمهورية الإسلامية الموريتانية", capital: "نواكشوط", joined: 1973, region: "المغرب العربي", colors: ["#cd2a3e", "#006233", "#cd2a3e"] },
  { name: "الصومال الفيدرالية", capital: "مقديشو", joined: 1974, region: "القرن الأفريقي", colors: ["#4189de", "#2f6fc0", "#4189de"] },
  { name: "دولة فلسطين", capital: "القدس الشرقية", joined: 1976, region: "المشرق العربي", colors: ["#161616", "#f5f0e6", "#007a3d"], note: "عضوية كاملة — قضية العرب المركزية" },
  { name: "جمهورية جيبوتي", capital: "جيبوتي", joined: 1977, region: "القرن الأفريقي", colors: ["#6ab2e7", "#f5f0e6", "#12ad2b"] },
  { name: "الاتحاد القمري", capital: "موروني", joined: 1993, region: "جزر المحيط الهندي", colors: ["#ffc61e", "#f5f0e6", "#ce1126"] },
];

export const LEAGUE_BODIES = [
  {
    title: "مجلس الجامعة على المستوى الوزاري",
    desc: "الجهاز الأعلى — دورتان سنويًا وقنوات طارئة للملفات الساخنة بتكليف مشترك من الوزارة.",
  },
  {
    title: "لجنة فض النزاعات بين الدول الأعضاء",
    desc: "آلية الميثاق للمساعي الحميدة والتحكيم العربي — ترأس الوزارة أمانتها الفنية منذ ٢٠٢١.",
  },
  {
    title: "مجلس السلم والأمن العربي",
    desc: "مرصد التهديدات الجماعي والتنسيق المباشر مع غرفة العمليات المركزية بالقاهرة.",
  },
  {
    title: "الأمانة الفنية للوساطة العربية",
    desc: "وحدة الوسطاء المعتمدين التابعة للأمانة العامة — تديرها كوادر الوزارة بالتناوب.",
  },
];
