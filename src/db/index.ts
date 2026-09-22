import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __midoPostgresqlPool?: Pool;
  __midoPostgresqlDb?: ReturnType<typeof drizzle>;
};

type Db = ReturnType<typeof drizzle>;

/**
 * getDb: يُنشئ اتصال القاعدة عند أول استخدام فعلي فقط، ويُخزَّن مرة واحدة
 * على globalThis (معزول لكل مثيل تشغيل/isolate) لضمان إعادة الاستخدام
 * وعدم تسريب الاتصالات.
 *
 * لماذا التأجيل الكامل؟ Next.js ينفّذ كود المسارات (routes) أثناء مرحلة
 * "Collecting page data" في `next build`، لذلك أي إنشاء اتصال أو تحقق من
 * DATABASE_URL على مستوى الموديول كان يكسر البناء على Vercel. بهذا التصميم
 * لا يُلمَس أي شيء أثناء البناء — والخطأ الواضح يظهر فقط عند أول استدعاء
 * فعلي للقاعدة وقت التشغيل.
 */
function getDb(): Db {
  if (globalForDb.__midoPostgresqlDb) {
    return globalForDb.__midoPostgresqlDb;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL غير مضبوط (required). أضِفه في: Vercel → Project Settings → Environment Variables، أو محليًا في ملف .env.local — مثال: postgresql://user:password@host:5432/dbname"
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool);

  globalForDb.__midoPostgresqlDb = db;
  globalForDb.__midoPostgresqlPool = pool;

  return db;
}

/**
 * lazyDb: واجهة `db` نفسها دون أي عمل حتى اللحظة التي يُستدعى فيها
 * `db.select()` / `db.execute()` / `db.query()` لأول مرة.
 */
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const instance = getDb();
    const value = (instance as unknown as Record<PropertyKey, unknown>)[prop];
    return typeof value === "function" ? (value as CallableFunction).bind(instance) : value;
  },
});