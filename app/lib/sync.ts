import { useState, useCallback } from "react";
import { Integration, SyncEvent, Change, ResolvedChange } from "@/app/types";
import {
  updateIntegrationStatus,
  appendSyncEvent,
  updateSyncEvent,
  simulateConflictChanges,
} from "@/app/lib/data";
import { fetchSyncData, getErrorMessage } from "@/app/lib/api";

export type SyncPhase = "idle" | "syncing" | "preview" | "conflict" | "error";

export function classifyChanges(changes: Change[]): {
  clean: Change[];
  conflicts: Change[];
} {
  const conflictFields = new Set(["user.email", "user.phone"]);
  const conflicts: Change[] = [];
  const clean: Change[] = [];

  for (const c of changes) {
    if (c.change_type === "UPDATE" && conflictFields.has(c.field_name)) {
      conflicts.push(c);
    } else {
      clean.push(c);
    }
  }

  return { clean, conflicts };
}

interface UseSyncFlowResult {
  phase: SyncPhase;
  loading: boolean;
  error: string | null;
  previewClean: Change[] | null;
  previewConflicts: Change[] | null;
  syncEventId: string | null;
  startSync: () => Promise<void>;
  applyClean: () => void;
  resolveConflicts: (resolved: ResolvedChange[]) => void;
  dismissPreview: () => void;
}

export function useSyncFlow(
  integration: Integration,
  onIntegrationUpdate: (i: Integration) => void,
  onHistoryUpdate: (updater: (prev: SyncEvent[]) => SyncEvent[]) => void
): UseSyncFlowResult {
  const [phase, setPhase] = useState<SyncPhase>("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewClean, setPreviewClean] = useState<Change[] | null>(null);
  const [previewConflicts, setPreviewConflicts] = useState<Change[] | null>(null);
  const [syncEventId, setSyncEventId] = useState<string | null>(null);

  const applySync = useCallback(
    (
      evtId: string,
      cleanChanges: Change[],
      resolved: ResolvedChange[]
    ) => {
      const nextVersion = integration.version + 1;
      const now = new Date().toISOString();

      const evt: SyncEvent = {
        id: evtId,
        integrationId: integration.id,
        triggeredAt: now,
        status: "applied",
        changes: cleanChanges,
        resolvedChanges: resolved,
        version: nextVersion,
      };

      updateSyncEvent(evt);
      updateIntegrationStatus(integration.id, "synced", nextVersion, now);

      onHistoryUpdate((prev) => [evt, ...prev]);
      onIntegrationUpdate({
        ...integration,
        status: "synced",
        version: nextVersion,
        lastSyncAt: now,
      });

      setPreviewClean(null);
      setPreviewConflicts(null);
      setPhase("idle");
    },
    [integration, onIntegrationUpdate, onHistoryUpdate]
  );

  const startSync = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPreviewClean(null);
    setPreviewConflicts(null);
    setPhase("syncing");

    const evtId = `evt_${integration.id}_${Date.now()}`;
    setSyncEventId(evtId);

    const nextVersion = integration.version + 1;
    const now = new Date().toISOString();

    const pendingEvent: SyncEvent = {
      id: evtId,
      integrationId: integration.id,
      triggeredAt: now,
      status: "pending",
      changes: [],
      version: nextVersion,
    };
    appendSyncEvent(pendingEvent);
    updateIntegrationStatus(integration.id, "syncing");

    onHistoryUpdate((prev) => [pendingEvent, ...prev]);
    onIntegrationUpdate({ ...integration, status: "syncing" });

    try {
      const data = await fetchSyncData(integration.id);
      const changes = data.data.sync_approval.changes;

      let allChanges = [...changes];
      if (allChanges.length === 0) {
        allChanges = simulateConflictChanges();
      }

      const { clean, conflicts } = classifyChanges(allChanges);

      pendingEvent.changes = allChanges;
      updateSyncEvent(pendingEvent);
      setPreviewClean(clean);
      setPreviewConflicts(conflicts.length > 0 ? conflicts : null);

      onHistoryUpdate((prev) =>
        prev.map((e) => (e.id === evtId ? pendingEvent : e))
      );

      if (conflicts.length > 0) {
        updateIntegrationStatus(integration.id, "conflict");
        onIntegrationUpdate({ ...integration, status: "conflict" });
        setPhase("conflict");
      } else {
        setPhase("preview");
      }
    } catch (err: unknown) {
      const status =
        err instanceof Error && "status" in err ? Number((err as Error & { status: number }).status) : undefined;
      const msg = status
        ? getErrorMessage(status)
        : err instanceof Error
        ? err.message
        : "Unknown error";
      setError(msg);
      pendingEvent.status = "error";
      pendingEvent.errorMessage = msg;
      updateSyncEvent(pendingEvent);
      updateIntegrationStatus(integration.id, "error");

      onHistoryUpdate((prev) =>
        prev.map((e) => (e.id === evtId ? pendingEvent : e))
      );
      onIntegrationUpdate({ ...integration, status: "error" });
      setPhase("error");
    } finally {
      setLoading(false);
    }
  }, [integration, onIntegrationUpdate, onHistoryUpdate]);

  const applyClean = useCallback(() => {
    if (syncEventId && previewClean !== null) {
      applySync(syncEventId, previewClean, []);
    }
  }, [syncEventId, previewClean, applySync]);

  const resolveConflicts = useCallback(
    (resolved: ResolvedChange[]) => {
      if (syncEventId) {
        applySync(syncEventId, previewClean || [], resolved);
      }
    },
    [syncEventId, previewClean, applySync]
  );

  const dismissPreview = useCallback(() => {
    setPreviewClean(null);
    setPreviewConflicts(null);
    setPhase("idle");
    if (syncEventId) {
      // Revert integration status to synced if preview dismissed without applying
      updateIntegrationStatus(integration.id, "synced");
      onIntegrationUpdate({ ...integration, status: "synced" });
    }
  }, [syncEventId, integration, onIntegrationUpdate]);

  return {
    phase,
    loading,
    error,
    previewClean,
    previewConflicts,
    syncEventId,
    startSync,
    applyClean,
    resolveConflicts,
    dismissPreview,
  };
}
