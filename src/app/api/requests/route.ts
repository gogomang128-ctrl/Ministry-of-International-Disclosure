import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { serviceRequests } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const organization = String(body.organization ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const requestType = String(body.requestType ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const details = String(body.details ?? "").trim();

    if (!name || !requestType || !subject || !details) {
      return NextResponse.json(
        { ok: false, error: "الحقول الإلزامية غير مكتملة (الاسم، نوع الطلب، الموضوع، التفاصيل)." },
        { status: 400 }
      );
    }

    const trackingCode = `REQ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 89999)}`;

    await db.insert(serviceRequests).values({
      trackingCode,
      name,
      organization: organization || null,
      phone: phone || null,
      email: email || null,
      requestType,
      subject,
      details,
      status: "قيد الفحص الأمني",
    });

    return NextResponse.json({ ok: true, trackingCode }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "تعذّر تسجيل الطلب. حاول مرة أخرى عبر القناة المؤمّنة." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const rows = await db
    .select()
    .from(serviceRequests)
    .orderBy(desc(serviceRequests.createdAt))
    .limit(10);
  return NextResponse.json({ ok: true, requests: rows });
}
