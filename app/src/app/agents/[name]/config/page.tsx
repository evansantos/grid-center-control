import { AgentConfigClient } from './client';

export default function Page({ params }: { params: Promise<{ name: string }> }) {
  // Next 16 async params
  return <AgentConfigClient namePromise={params} />;
}