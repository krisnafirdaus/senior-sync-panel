import { integrations, generateHistory } from "@/app/lib/data";
import IntegrationDetail from "./IntegrationDetail";

export function generateStaticParams() {
  return integrations.map((i) => ({ id: i.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const integration = integrations.find((i) => i.id === id)!;
  const history = generateHistory(id, 5);
  return (
    <IntegrationDetail initialIntegration={integration} initialHistory={history} />
  );
}
