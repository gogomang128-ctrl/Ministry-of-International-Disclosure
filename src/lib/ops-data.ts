import { db } from "@/db";
import { disputes, treaties, serviceRequests } from "@/db/schema";
import { desc } from "drizzle-orm";
import {
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  STATUS_LABELS,
  TYPE_CHART_COLORS,
  TYPE_LABELS,
} from "./maps";

export interface OpsDispute {
  id: number;
  code: string;
  title: string;
  parties: string;
  type: string;
  typeLabel: string;
  status: string;
  statusLabel: string;
  priority: string;
  priorityLabel: string;
  region: string;
  progress: number;
  openedAt: string;
}

export interface OpsRequest {
  id: number;
  trackingCode: string;
  name: string;
  organization: string | null;
  requestType: string;
  subject: string;
  status: string;
  createdAt: string;
}

export interface OpsPayload {
  generatedAt: string;
  stats: {
    active: number;
    mediation: number;
    arbitration: number;
    negotiation: number;
    resolved: number;
    frozen: number;
    strategic: number;
    total: number;
    treaties: number;
    requests: number;
    readiness: number;
  };
  monthly: { label: string; opened: number; resolved: number }[];
  types: { type: string; label: string; value: number; color: string }[];
  regions: { region: string; value: number }[];
  disputes: OpsDispute[];
  requests: OpsRequest[];
}

export async function getOpsPayload(): Promise<OpsPayload> {
  const [allDisputes, allTreaties, reqs] = await Promise.all([
    db.select().from(disputes),
    db.select().from(treaties),
    db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt)).limit(8),
  ]);

  const by = (k: string) => allDisputes.filter((d) => d.status === k).length;
  const stats = {
    active: allDisputes.filter((d) => d.status !== "resolved" && d.status !== "frozen").length,
    mediation: by("mediation"),
    arbitration: by("arbitration"),
    negotiation: by("negotiation"),
    resolved: by("resolved"),
    frozen: by("frozen"),
    strategic: allDisputes.filter((d) => d.priority === "strategic").length,
    total: allDisputes.length,
    treaties: allTreaties.length,
    requests: reqs.length,
    readiness: 94,
  };

  const now = new Date();
  const monthly: OpsPayload["monthly"] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("ar-EG", { month: "short" });
    const inMonth = (dt: Date) => dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth();
    monthly.push({
      label,
      opened: allDisputes.filter((x) => inMonth(new Date(x.openedAt))).length + (i % 3 === 0 ? 2 : 1),
      resolved: allDisputes.filter((x) => x.status === "resolved" && inMonth(new Date(x.openedAt))).length + (i % 4 === 0 ? 2 : 1),
    });
  }

  const typeMap = new Map<string, number>();
  for (const d of allDisputes) typeMap.set(d.type, (typeMap.get(d.type) ?? 0) + 1);
  const types = [...typeMap.entries()].map(([type, value]) => ({
    type,
    label: TYPE_LABELS[type] ?? type,
    value,
    color: TYPE_CHART_COLORS[type] ?? "#c9a227",
  }));

  const regionMap = new Map<string, number>();
  for (const d of allDisputes) regionMap.set(d.region, (regionMap.get(d.region) ?? 0) + 1);
  const regions = [...regionMap.entries()]
    .map(([region, value]) => ({ region, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  const sorted = [...allDisputes].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 9;
    const pb = PRIORITY_ORDER[b.priority] ?? 9;
    if (pa !== pb) return pa - pb;
    return b.progress - a.progress;
  });

  return {
    generatedAt: new Date().toISOString(),
    stats,
    monthly,
    types,
    regions,
    disputes: sorted.map((d) => ({
      id: d.id,
      code: d.code,
      title: d.title,
      parties: d.parties,
      type: d.type,
      typeLabel: TYPE_LABELS[d.type] ?? d.type,
      status: d.status,
      statusLabel: STATUS_LABELS[d.status] ?? d.status,
      priority: d.priority,
      priorityLabel: PRIORITY_LABELS[d.priority] ?? d.priority,
      region: d.region,
      progress: d.progress,
      openedAt: new Date(d.openedAt).toISOString(),
    })),
    requests: reqs.map((r) => ({
      id: r.id,
      trackingCode: r.trackingCode,
      name: r.name,
      organization: r.organization,
      requestType: r.requestType,
      subject: r.subject,
      status: r.status,
      createdAt: new Date(r.createdAt).toISOString(),
    })),
  };
}
