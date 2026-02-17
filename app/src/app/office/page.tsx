'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with ResizeObserver
const IsometricOffice = dynamic(() => import('../../components/isometric-office'), { ssr: false });

export default function OfficePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--grid-text)' }}>
          🏢 The Office
        </h1>
        <p className="text-sm" style={{ color: 'var(--grid-text-dim)' }}>
          Live view of the MCP <span style={{ color: 'var(--grid-accent)' }}>●</span> team — 14 agents across 5 departments.
        </p>
      </div>
      <IsometricOffice />
    </div>
  );
}
