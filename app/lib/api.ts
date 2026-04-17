import { SyncApiResponse } from "@/app/types";

const SYNC_ENDPOINT = "https://portier-takehometest.onrender.com/api/v1/data/sync";

export async function fetchSyncData(applicationId: string): Promise<SyncApiResponse> {
  const url = new URL(SYNC_ENDPOINT);
  url.searchParams.set("application_id", applicationId);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}: ${res.statusText}`) as Error & { status: number };
    error.status = res.status;
    throw error;
  }

  return res.json();
}

export function getErrorMessage(status: number): string {
  if (status >= 400 && status < 500) {
    return "Missing or invalid configuration. Please check your integration settings.";
  }
  if (status === 500) {
    return "Internal server error. Please try again later.";
  }
  if (status === 502) {
    return "Integration server is unreachable. The external service may be down.";
  }
  return `An unexpected error occurred (HTTP ${status}).`;
}
