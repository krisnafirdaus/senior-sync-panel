"use client";

import Link from "next/link";
import { Integration } from "@/app/types";
import { StatusBadge } from "./StatusBadge";
import { timeAgo } from "@/app/lib/utils";
import { Cloud, Target, CreditCard, MessageSquare, Circle } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cloud,
  Target,
  CreditCard,
  MessageSquare,
};

function IntegrationIcon({ name }: { name: string }) {
  const Icon = iconMap[name] || Circle;
  return <Icon className="h-6 w-6" />;
}

export function IntegrationCard({ integration }: { integration: Integration }) {
  return (
    <Link
      href={`/integrations/${integration.id}/`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <IntegrationIcon name={integration.icon} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{integration.name}</h3>
            <p className="text-sm text-slate-500">{integration.description}</p>
          </div>
        </div>
        <StatusBadge status={integration.status} />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>Version {integration.version}</span>
        <span>Last sync: {timeAgo(integration.lastSyncAt)}</span>
      </div>
    </Link>
  );
}
