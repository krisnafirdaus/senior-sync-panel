"use client";

import { IntegrationStatus, SyncEventStatus } from "@/app/types";

type Status = IntegrationStatus | SyncEventStatus;

const styles: Record<Status, string> = {
  synced: "bg-emerald-100 text-emerald-700 border-emerald-200",
  syncing: "bg-amber-100 text-amber-700 border-amber-200 animate-pulse",
  conflict: "bg-rose-100 text-rose-700 border-rose-200",
  error: "bg-red-100 text-red-700 border-red-200",
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  approved: "bg-blue-100 text-blue-700 border-blue-200",
  rejected: "bg-gray-100 text-gray-700 border-gray-200",
  applied: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const labels: Record<Status, string> = {
  synced: "Synced",
  syncing: "Syncing",
  conflict: "Conflict",
  error: "Error",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  applied: "Applied",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
