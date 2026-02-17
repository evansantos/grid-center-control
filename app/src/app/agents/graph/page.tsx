import { Metadata } from 'next';
import AgentsGraphClient from './client';

export const metadata: Metadata = {
  title: 'Agent Dependency Graph',
  description: 'Interactive visualization of agent relationships and spawn hierarchy',
};

export default function AgentsGraphPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[--grid-text] mb-2">
          Agent Dependency Graph
        </h1>
        <p className="text-[--grid-text-dim]">
          Interactive visualization showing relationships between agents in the system
        </p>
      </div>
      
      <AgentsGraphClient />
    </div>
  );
}