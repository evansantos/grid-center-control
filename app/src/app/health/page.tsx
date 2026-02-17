import { HealthStatus } from '@/components/health-status';

export default function HealthPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            System Health
          </h1>
          <p className="text-zinc-400">
            Real-time monitoring of OpenClaw gateway, agent responsiveness, and system resources.
          </p>
        </header>
        
        <HealthStatus />
      </div>
    </div>
  );
}