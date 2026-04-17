export type IntegrationStatus = "synced" | "syncing" | "conflict" | "error";

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  lastSyncAt: string | null;
  version: number;
  icon: string;
  connectedAt: string;
}

export type ChangeType = "UPDATE" | "CREATE" | "DELETE";

export interface Change {
  id: string;
  field_name: string;
  change_type: ChangeType;
  current_value: string | null;
  new_value: string | null;
}

export interface SyncApproval {
  application_name: string;
  changes: Change[];
}

export interface SyncApiResponse {
  code: string;
  message: string;
  data: {
    sync_approval: SyncApproval;
    metadata: Record<string, unknown>;
  };
}

export type SyncEventStatus = "pending" | "approved" | "rejected" | "applied" | "error";

export interface SyncEvent {
  id: string;
  integrationId: string;
  triggeredAt: string;
  status: SyncEventStatus;
  changes: Change[];
  resolvedChanges?: ResolvedChange[];
  errorMessage?: string;
  version: number;
}

export interface ResolvedChange {
  changeId: string;
  fieldName: string;
  choice: "local" | "external" | "merged";
  value: string | null;
}

export interface ConflictItem {
  change: Change;
  localValue: string | null;
  externalValue: string | null;
}
