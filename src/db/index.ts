import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __midoPostgresqlPool?: Pool;
};

/**
 * lazyPool: لا يتم إنشاء اتصال قاعدة البيانات ولا التحقق من DATABASE_URL
 * إلا عند أول استخدام فعلي (أول query/execute).
 *
 * لماذا؟ حتى لا يفشل `next build` على Vercel إذا لم تكن المتغيرات مضبوطة
 * أثناء مرحلة البناء (تُضبط عادة في إعدادات المشروع وتتوفر وقت التشغيل)،
 * مع إبقاء رسالة خطأ واضحة عند الاستخدام.
 */
function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL غير مضبوط (required). أضِفه في: Vercel → Project Settings → Environment Variables، أو محليًا في ملف .env.local — مثال: postgresql://user:password@host:5432/dbname"
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__midoPostgresqlPool = pool;
  }

  return pool;
}

function getPool(): Pool {
  return globalForDb.__midoPostgresqlPool ?? createPool();
}

const lazyPool = new Proxy({} as Pool, {
  get(_target, prop) {
    const pool = getPool();
    const value = (pool as unknown as Record<PropertyKey, unknown>)[prop];
    return typeof value === "function" ? (value as CallableFunction).bind(pool) : value;
  },
});

export const db = drizzle(lazyPool);