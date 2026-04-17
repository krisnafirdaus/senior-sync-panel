"use client";

import { Change } from "@/app/types";

export function ChangeRow({ change }: { change: Change }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            change.change_type === "CREATE"
              ? "bg-emerald-100 text-emerald-700"
              : change.change_type === "DELETE"
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {change.change_type}
        </span>
        <span className="text-sm font-medium text-slate-700">{change.field_name}</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-500 line-through">
          {change.current_value ?? "(empty)"}
        </span>
        <span className="text-slate-400">→</span>
        <span className="font-medium text-slate-900">{change.new_value ?? "(empty)"}</span>
      </div>
    </div>
  );
}
