import {
  pgTable,
  pgEnum,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const disputeTypeEnum = pgEnum("dispute_type", [
  "territorial", // نزاعات حدودية برية
  "maritime", // منازعات بحرية
  "water", // مياه عابرة
  "trade", // تجارية واستثمارية
  "border", // توترات حدودية
  "diplomatic", // أزمات دبلوماسية
  "investment", // استثمارية
  "airspace", // مجال جوي
]);

export const disputeStatusEnum = pgEnum("dispute_status", [
  "active", // نشط
  "mediation", // وساطة
  "arbitration", // تحكيم
  "negotiation", // تفاوض
  "resolved", // محسوم
  "frozen", // مجمّد
]);

export const priorityEnum = pgEnum("priority_level", [
  "strategic",
  "high",
  "medium",
  "low",
]);

export const disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 24 }).notNull().unique(),
  title: text("title").notNull(),
  parties: text("parties").notNull(),
  type: disputeTypeEnum("type").notNull(),
  status: disputeStatusEnum("status").notNull().default("active"),
  priority: priorityEnum("priority").notNull().default("medium"),
  region: varchar("region", { length: 90 }).notNull(),
  progress: integer("progress").notNull().default(0),
  summary: text("summary"),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
});

export const treaties = pgTable("treaties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  parties: text("parties").notNull(),
  category: varchar("category", { length: 90 }).notNull(),
  reference: varchar("reference", { length: 40 }).notNull(),
  status: varchar("status", { length: 40 }).notNull().default("سارية"),
  signedAt: timestamp("signed_at").notNull().defaultNow(),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  category: varchar("category", { length: 60 }).notNull(),
  image: varchar("image", { length: 120 }),
  urgent: boolean("urgent").notNull().default(false),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
});

export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  trackingCode: varchar("tracking_code", { length: 24 }).notNull().unique(),
  name: varchar("name", { length: 140 }).notNull(),
  organization: varchar("organization", { length: 160 }),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 140 }),
  requestType: varchar("request_type", { length: 60 }).notNull(),
  subject: text("subject").notNull(),
  details: text("details").notNull(),
  status: varchar("status", { length: 40 }).notNull().default("قيد الفحص الأمني"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const conflictIntensityEnum = pgEnum("conflict_intensity", [
  "war", // حرب مفتوحة
  "escalation", // تصعيد مسلح
  "clashes", // اشتباكات متقطعة
  "tension", // توتر عسكري
  "ceasefire", // وقف إطلاق نار هش
]);

export const conflicts = pgTable("conflicts", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 24 }).notNull().unique(),
  name: text("name").notNull(),
  theater: varchar("theater", { length: 120 }).notNull(),
  parties: text("parties").notNull(),
  intensity: conflictIntensityEnum("intensity").notNull().default("tension"),
  statusLabel: varchar("status_label", { length: 90 }).notNull().default("مستمر"),
  since: varchar("since", { length: 60 }).notNull(),
  summary: text("summary").notNull(),
  ministryRole: text("ministry_role").notNull(),
  latest: text("latest").notNull(),
  affected: varchar("affected", { length: 60 }).notNull(),
  mx: integer("mx").notNull().default(50),
  my: integer("my").notNull().default(50),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const wars = pgTable("wars", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 24 }).notNull().unique(),
  name: text("name").notNull(),
  region: varchar("region", { length: 90 }).notNull(),
  intensity: conflictIntensityEnum("intensity").notNull().default("tension"),
  statusLabel: varchar("status_label", { length: 90 }).notNull().default("مستمر"),
  since: varchar("since", { length: 60 }).notNull(),
  sideA: text("side_a").notNull(),
  sideB: text("side_b").notNull(),
  belligerents: text("belligerents").notNull(), // أسماء الدول المتحاربة مفصولة بفواصل
  iso: varchar("iso", { length: 120 }).notNull(), // أكواد ISO الرقمية للدول
  summary: text("summary").notNull(),
  monitorNote: text("monitor_note").notNull(),
  latest: text("latest").notNull(),
  affected: varchar("affected", { length: 90 }).notNull(),
  sourceLabel: varchar("source_label", { length: 90 }).notNull(),
  sourceUrl: varchar("source_url", { length: 200 }).notNull(),
  lat: integer("lat").notNull().default(0),
  lon: integer("lon").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const aiIntel = pgTable("ai_intel", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  region: varchar("region", { length: 90 }).notNull().default("العالم"),
  country: varchar("country", { length: 90 }).notNull().default(""),
  severity: varchar("severity", { length: 20 }).notNull().default("tension"),
  summary: text("summary").notNull(),
  source: varchar("source", { length: 140 }).notNull().default(""),
  url: varchar("url", { length: 320 }).notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const interiorIntel = pgTable("interior_intel", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: varchar("category", { length: 60 }).notNull().default("بيان رسمي"),
  severity: varchar("severity", { length: 20 }).notNull().default("tension"),
  summary: text("summary").notNull(),
  governorate: varchar("governorate", { length: 60 }).notNull().default(""),
  source: varchar("source", { length: 140 }).notNull().default(""),
  url: varchar("url", { length: 320 }).notNull().default(""),
  image: varchar("image", { length: 120 }).notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const arabStats = pgTable("arab_country_stats", {
  id: serial("id").primaryKey(),
  country: varchar("country", { length: 120 }).notNull().unique(),
  colors: varchar("colors", { length: 80 }).notNull().default("#c9a227,#1c2534,#c9a227"),
  status: varchar("status", { length: 60 }).notNull().default("مستقر نسبيًا"),
  displaced: varchar("displaced", { length: 120 }).notNull().default("لا نزوح داخلي"),
  refugeesOut: varchar("refugees_out", { length: 120 }).notNull().default("—"),
  deaths: varchar("deaths", { length: 140 }).notNull().default("—"),
  occupied: varchar("occupied", { length: 160 }).notNull().default("لا يوجد"),
  besieged: varchar("besieged", { length: 160 }).notNull().default("لا يوجد"),
  fragLevel: varchar("frag_level", { length: 20 }).notNull().default("مستقر"),
  fragNote: varchar("frag_note", { length: 240 }).notNull().default("لحمة اجتماعية متماسكة بعُرف المؤسسات."),
  hosting: varchar("hosting", { length: 140 }).notNull().default("—"),
  sourceLabel: varchar("source_label", { length: 90 }).notNull().default("UNHCR — المفوضية السامية للاجئين"),
  sourceUrl: varchar("source_url", { length: 200 }).notNull().default("https://reliefweb.int/"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const countryBriefs = pgTable("country_briefs", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  nameAr: varchar("name_ar", { length: 140 }).notNull(),
  payload: text("payload").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Dispute = typeof disputes.$inferSelect;
export type Treaty = typeof treaties.$inferSelect;
export type NewsItem = typeof news.$inferSelect;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type Conflict = typeof conflicts.$inferSelect;
export type War = typeof wars.$inferSelect;
export type AiIntel = typeof aiIntel.$inferSelect;
export type InteriorIntel = typeof interiorIntel.$inferSelect;
export type CountryBrief = typeof countryBriefs.$inferSelect;
export type ArabStat = typeof arabStats.$inferSelect;
