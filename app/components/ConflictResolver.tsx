"use client";

import { useState } from "react";
import { Change, ResolvedChange } from "@/app/types";

interface ConflictResolverProps {
  conflicts: Change[];
  onResolve: (resolved: ResolvedChange[]) => void;
  onCancel?: () => void;
}

export function ConflictResolver({ conflicts, onResolve, onCancel }: ConflictResolverProps) {
  const [choices, setChoices] = useState<Record<string, ResolvedChange>>(() => {
    const map: Record<string, ResolvedChange> = {};
    for (const c of conflicts) {
      map[c.id] = {
        changeId: c.id,
        fieldName: c.field_name,
        choice: "local",
        value: c.current_value,
      };
    }
    return map;
  });

  const setChoice = (changeId: string, choice: ResolvedChange["choice"], value: string | null) => {
    setChoices((prev) => ({
      ...prev,
      [changeId]: { ...prev[changeId], choice, value },
    }));
  };

  const acceptAll = (choice: ResolvedChange["choice"]) => {
    const map: Record<string, ResolvedChange> = {};
    for (const c of conflicts) {
      map[c.id] = {
        changeId: c.id,
        fieldName: c.field_name,
        choice,
        value: choice === "local" ? c.current_value : choice === "external" ? c.new_value : choices[c.id]?.value ?? c.current_value,
      };
    }
    setChoices(map);
  };

  const handleSubmit = () => {
    onResolve(Object.values(choices));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-rose-700">Conflicts Detected</h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => acceptAll("local")}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Accept All Local
          </button>
          <button
            type="button"
            onClick={() => acceptAll("external")}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Accept All External
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {conflicts.map((c) => {
          const current = choices[c.id];
          return (
            <div
              key={c.id}
              className="rounded-lg border border-rose-200 bg-rose-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">{c.field_name}</span>
                <span className="text-xs font-medium text-rose-700">CONFLICT</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setChoice(c.id, "local", c.current_value)}
                  className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                    current?.choice === "local"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xs font-medium text-slate-500">Local</span>
                  <div className="mt-1">{c.current_value ?? "(empty)"}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setChoice(c.id, "external", c.new_value)}
                  className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                    current?.choice === "external"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span className="text-xs font-medium text-slate-500">External</span>
                  <div className="mt-1">{c.new_value ?? "(empty)"}</div>
                </button>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-500">
                  Custom merge value
                </label>
                <input
                  type="text"
                  value={current?.choice === "merged" ? (current.value ?? "") : ""}
                  onChange={(e) => setChoice(c.id, "merged", e.target.value || null)}
                  placeholder="Type a custom value..."
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
        >
          Resolve & Continue
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
