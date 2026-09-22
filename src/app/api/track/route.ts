import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { disputes, serviceRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from "@/lib/maps";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get("code") ?? "").trim().toUpperCase();
  if (!code) {
    return NextResponse.json({ ok: false, error: "أدخل رمز التتبع أولًا." }, { status: 400 });
  }

  const [reqRow] = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.trackingCode, code))
    .limit(1);

  if (reqRow) {
    return NextResponse.json({
      ok: true,
      kind: "request",
      item: {
        code: reqRow.trackingCode,
        title: reqRow.subject,
        parties: reqRow.name,
        typeLabel: reqRow.requestType,
        statusLabel: reqRow.status,
        priorityLabel: "طلب خدمة",
        progress: reqRow.status.includes("أُحيل") ? 55 : 18,
        openedAt: reqRow.createdAt,
      },
    });
  }

  const [disp] = await db.select().from(disputes).where(eq(disputes.code, code)).limit(1);
  if (disp) {
    return NextResponse.json({
      ok: true,
      kind: "dispute",
      item: {
        code: disp.code,
        title: disp.title,
        parties: disp.parties,
        typeLabel: TYPE_LABELS[disp.type] ?? disp.type,
        statusLabel: STATUS_LABELS[disp.status] ?? disp.status,
        priorityLabel: PRIORITY_LABELS[disp.priority] ?? disp.priority,
        progress: disp.progress,
        openedAt: disp.openedAt,
      },
    });
  }

  return NextResponse.json(
    { ok: false, error: "لا يوجد سجل بهذا الرمز في قواعد الوزارة. تحقق من الرمز أو تواصل مع الخط الساخن ١٩٤٥٥." },
    { status: 404 }
  );
}
