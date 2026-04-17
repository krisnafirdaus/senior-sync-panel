"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Integration, SyncEvent } from "@/app/types";
import { getIntegrationById, getHistoryByIntegrationId } from "@/app/lib/data";
import { useSyncFlow } from "@/app/lib/sync";
import { formatDate, timeAgo } from "@/app/lib/utils";
import { StatusBadge } from "@/app/components/StatusBadge";
import { ChangeRow } from "@/app/components/ChangeRow";
import { ConflictResolver } from "@/app/components/ConflictResolver";
import { SyncHistory } from "@/app/components/SyncHistory";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function IntegrationDetail({
  initialIntegration,
  initialHistory,
}: {
  initialIntegration: Integration;
  initialHistory: SyncEvent[];
}) {
  const [mounted, setMounted] = useState(false);
  const [integration, setIntegration] = useState<Integration>(initialIntegration);
  const [history, setHistory] = useState<SyncEvent[]>(initialHistory);

  useEffect(() => {
    const id = setTimeout(() => {
      setMounted(true);
      const fresh = getIntegrationById(initialIntegration.id);
      if (fresh) setIntegration(fresh);
      setHistory(getHistoryByIntegrationId(initialIntegration.id));
    }, 0);
    return () => clearTimeout(id);
  }, [initialIntegration.id]);

  const {
    phase,
    loading,
    error,
    previewClean,
    previewConflicts,
    startSync,
    applyClean,
    resolveConflicts,
    dismissPreview,
  } = useSyncFlow(integration, setIntegration, setHistory);

  const showPreview = phase === "preview" || phase === "conflict";

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-200" />
          <div>
            <div className="h-6 w-32 rounded bg-slate-200" />
            <div className="mt-2 h-4 w-48 rounded bg-slate-200" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="h-20 rounded-xl bg-slate-200" />
          <div className="h-20 rounded-xl bg-slate-200" />
          <div className="h-20 rounded-xl bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Integrations
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{integration.name}</h1>
            <p className="text-sm text-slate-500">
              Connected {formatDate(integration.connectedAt)} · Version {integration.version}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={integration.status} />
            <button
              type="button"
              onClick={startSync}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Syncing…" : "Sync Now"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong className="font-semibold">Sync failed.</strong> {error}
        </div>
      )}

      {/* Sync Preview */}
      {showPreview && (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Sync Preview</h2>
            <span className="text-xs text-slate-500">Review changes before applying</span>
          </div>

          {previewClean && previewClean.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-700">Incoming Changes</h3>
              {previewClean.map((c) => (
                <ChangeRow key={c.id} change={c} />
              ))}
            </div>
          )}

          {previewConflicts && previewConflicts.length > 0 && (
            <ConflictResolver
              conflicts={previewConflicts}
              onResolve={resolveConflicts}
              onCancel={dismissPreview}
            />
          )}

          {!previewConflicts && previewClean && previewClean.length === 0 && (
            <p className="text-sm text-slate-500">No changes detected.</p>
          )}

          {/* Apply button for clean previews */}
          {phase === "preview" && (
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={applyClean}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Apply Changes
              </button>
              <button
                type="button"
                onClick={dismissPreview}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          )}
        </section>
      )}

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Sync</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {timeAgo(integration.lastSyncAt)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Syncs</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{history.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Current Version</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">v{integration.version}</p>
        </div>
      </section>

      {/* History */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Sync History</h2>
        <SyncHistory events={history} />
      </section>
    </div>
  );
}
