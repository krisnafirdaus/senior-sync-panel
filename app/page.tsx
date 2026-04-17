"use client";

import { useEffect, useState, useMemo } from "react";
import { Integration, IntegrationStatus } from "@/app/types";
import { getStoredIntegrations } from "@/app/lib/data";
import { IntegrationCard } from "@/app/components/IntegrationCard";

const statusOptions: { label: string; value: IntegrationStatus | "all" }[] = [
  { label: "All Status", value: "all" },
  { label: "Synced", value: "synced" },
  { label: "Syncing", value: "syncing" },
  { label: "Conflict", value: "conflict" },
  { label: "Error", value: "error" },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IntegrationStatus | "all">("all");

  useEffect(() => {
    const id = setTimeout(() => {
      setMounted(true);
      setIntegrations(getStoredIntegrations());
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return integrations.filter((i) => {
      const matchesQuery =
        i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || i.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [integrations, query, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
        <p className="text-slate-600">
          Manage your connected services and review sync status.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search integrations..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none sm:w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as IntegrationStatus | "all")}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none sm:w-40"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {mounted ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      )}

      {mounted && filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No integrations match your search.
        </div>
      )}
    </div>
  );
}
