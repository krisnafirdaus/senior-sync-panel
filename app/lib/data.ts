import { Integration, SyncEvent, SyncEventStatus, Change } from "@/app/types";

// Use fixed past dates so timeAgo() never returns negative values.
const NOW = new Date("2026-04-17T08:00:00.000Z");
const ONE_HOUR = 3600_000;

export const integrations: Integration[] = [
  {
    id: "salesforce",
    name: "Salesforce",
    description: "CRM and customer data synchronization",
    status: "synced",
    lastSyncAt: new Date(NOW.getTime() - 2 * ONE_HOUR).toISOString(),
    version: 12,
    icon: "Cloud",
    connectedAt: "2025-01-15T08:00:00.000Z",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Marketing and lead management",
    status: "conflict",
    lastSyncAt: new Date(NOW.getTime() - 5 * ONE_HOUR).toISOString(),
    version: 8,
    icon: "Target",
    connectedAt: "2025-02-10T09:00:00.000Z",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Billing and payment data",
    status: "error",
    lastSyncAt: new Date(NOW.getTime() - 12 * ONE_HOUR).toISOString(),
    version: 5,
    icon: "CreditCard",
    connectedAt: "2025-03-01T10:00:00.000Z",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Team communication and notifications",
    status: "synced",
    lastSyncAt: new Date(NOW.getTime() - ONE_HOUR).toISOString(),
    version: 3,
    icon: "MessageSquare",
    connectedAt: "2025-03-20T11:00:00.000Z",
  },
];

export function generateHistory(integrationId: string, count: number): SyncEvent[] {
  const events: SyncEvent[] = [];
  const baseDate = new Date(NOW.getTime() - ONE_HOUR);
  const statusPool: SyncEventStatus[] = ["applied", "applied", "applied", "approved", "error"];
  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate.getTime() - i * 3600_000 * 4);
    // deterministic pseudo-random based on index to avoid flakiness
    const status = statusPool[i % statusPool.length];
    events.push({
      id: `evt_${integrationId}_${i}`,
      integrationId,
      triggeredAt: date.toISOString(),
      status,
      changes: [],
      version: count - i,
      errorMessage: status === "error" ? "Connection timeout during sync" : undefined,
    });
  }
  return events;
}

const HISTORY_KEY = "portier_sync_history_v3";
const INTEGRATIONS_KEY = "portier_integrations_v3";

export function getStoredIntegrations(): Integration[] {
  if (typeof window === "undefined") return integrations;
  const raw = localStorage.getItem(INTEGRATIONS_KEY);
  if (!raw) return integrations;
  try {
    return JSON.parse(raw);
  } catch {
    return integrations;
  }
}

export function setStoredIntegrations(data: Integration[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(data));
}

export function getStoredHistory(): SyncEvent[] {
  if (typeof window === "undefined") {
    return integrations.flatMap((i) => generateHistory(i.id, 5));
  }
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) {
    const initial = integrations.flatMap((i) => generateHistory(i.id, 5));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setStoredHistory(data: SyncEvent[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(data));
}

export function getIntegrationById(id: string): Integration | undefined {
  return getStoredIntegrations().find((i) => i.id === id);
}

export function getHistoryByIntegrationId(integrationId: string): SyncEvent[] {
  return getStoredHistory()
    .filter((e) => e.integrationId === integrationId)
    .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
}

export function appendSyncEvent(event: SyncEvent) {
  const all = getStoredHistory();
  all.push(event);
  setStoredHistory(all);
}

export function updateIntegrationStatus(
  id: string,
  status: Integration["status"],
  version?: number,
  lastSyncAt?: string
) {
  const all = getStoredIntegrations();
  const idx = all.findIndex((i) => i.id === id);
  if (idx === -1) return;
  all[idx].status = status;
  if (version !== undefined) all[idx].version = version;
  if (lastSyncAt !== undefined) all[idx].lastSyncAt = lastSyncAt;
  setStoredIntegrations(all);
}

export function updateSyncEvent(event: SyncEvent) {
  const all = getStoredHistory();
  const idx = all.findIndex((e) => e.id === event.id);
  if (idx === -1) {
    all.push(event);
  } else {
    all[idx] = event;
  }
  setStoredHistory(all);
}

export function simulateConflictChanges(): Change[] {
  return [
    {
      id: "change_001",
      field_name: "user.email",
      change_type: "UPDATE",
      current_value: "john@company.com",
      new_value: "j.smith@newdomain.com",
    },
    {
      id: "change_002",
      field_name: "user.phone",
      change_type: "UPDATE",
      current_value: "+1-555-0101",
      new_value: "+1-555-0199",
    },
  ];
}
