import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    // drizzle-kit يقرأ ملف .env تلقائيًا — اضبط DATABASE_URL فيه
    // (تسقط القيمة المحلية افتراضيًا للتطوير المحلي فقط)
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});