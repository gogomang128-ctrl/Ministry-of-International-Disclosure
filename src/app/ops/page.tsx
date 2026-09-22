import type { Metadata } from "next";
import { getOpsPayload } from "@/lib/ops-data";
import Dashboard from "./Dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "غرفة العمليات المركزية | سرّي للغاية",
  description:
    "مركز القيادة والسيطرة لملفات الكشف الدولي — بالتنسيق الكامل مع وزارة الدفاع المصرية ووزارة الداخلية.",
};

export default async function OpsPage() {
  const initial = await getOpsPayload();
  return <Dashboard initial={initial} />;
}
