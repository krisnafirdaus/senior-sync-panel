"use client";

import { useState } from "react";
import { SyncEvent, Change } from "@/app/types";
import { StatusBadge } from "./StatusBadge";
import { formatDate } from "@/app/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

function ChangeDetail({ changes, resolved }: { changes: Change[]; resolved?: { fieldName: string; choice: string; value: string | null }[] }) {
  if (changes.length === 0) {
    return <p className="text-sm text-slate-500">No changes in this sync.</p>;
  }
  return (
    <div className="space-y-2">
      {changes.map((c) => {
        const resolution = resolved?.find((r) => r.fieldName === c.field_name);
        return (
          <div key={c.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  c.change_type === "CREATE"
                    ? "bg-emerald-100 text-emerald-700"
                    : c.change_type === "DELETE"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {c.change_type}
              </span>
              <span className="font-medium text-slate-700">{c.field_name}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-slate-600">
              <span className="line-through">{c.current_value ?? "(empty)"}</span>
              <span>→</span>
              <span className="font-medium text-slate-900">{c.new_value ?? "(empty)"}</span>
            </div>
            {resolution && (
              <div className="mt-1 text-xs text-indigo-700">
                Resolved: {resolution.choice} → {resolution.value ?? "(empty)"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SyncHistory({ events }: { events: SyncEvent[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
        No sync history yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"></th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Time
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Version
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {events.map((evt) => {
            const isOpen = expanded === evt.id;
            return (
              <>
                <tr
                  key={evt.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setExpanded(isOpen ? null : evt.id)}
                >
                  <td className="px-4 py-3">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-500" />
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {formatDate(evt.triggeredAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    v{evt.version}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <StatusBadge status={evt.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {evt.errorMessage
                      ? evt.errorMessage
                      : evt.changes.length > 0
                      ? `${evt.changes.length} change${evt.changes.length > 1 ? "s" : ""}`
                      : "No changes"}
                  </td>
                </tr>
                {isOpen && (
                  <tr>
                    <td colSpan={5} className="bg-slate-50 px-4 py-4">
                      <ChangeDetail changes={evt.changes} resolved={evt.resolvedChanges} />
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
