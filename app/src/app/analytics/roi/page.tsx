'use client';

import { useState } from 'react';

const HOURLY_RATE = 75;

interface AgentROI {
  agent: string;
  cost: number;
  tasksCompleted: number;
  timeSavedHrs: number;
  valueGenerated: number;
}

interface ManualEntry {
  id: string;
  agent: string;
  description: string;
  timeSavedMin: number;
  date: string;
}

const initialAgents: AgentROI[] = [
  { agent: 'Po (Orchestrator)', cost: 42.30, tasksCompleted: 156, timeSavedHrs: 18.5, valueGenerated: 1387.50 },
  { agent: 'Coder', cost: 38.10, tasksCompleted: 89, timeSavedHrs: 32.0, valueGenerated: 2400.00 },
  { agent: 'Researcher', cost: 21.40, tasksCompleted: 45, timeSavedHrs: 12.0, valueGenerated: 900.00 },
  { agent: 'Reviewer', cost: 8.90, tasksCompleted: 67, timeSavedHrs: 8.5, valueGenerated: 637.50 },
  { agent: 'Deployer', cost: 6.22, tasksCompleted: 23, timeSavedHrs: 5.0, valueGenerated: 375.00 },
];

const initialEntries: ManualEntry[] = [
  { id: '1', agent: 'Coder', description: 'Refactored auth module', timeSavedMin: 120, date: '2026-02-17' },
  { id: '2', agent: 'Researcher', description: 'API comparison report', timeSavedMin: 90, date: '2026-02-16' },
];

export default function ROIPage() {
  const [agents] = useState<AgentROI[]>(initialAgents);
  const [entries, setEntries] = useState<ManualEntry[]>(initialEntries);
  const [formAgent, setFormAgent] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formDate, setFormDate] = useState('2026-02-17');

  const totalCost = agents.reduce((s, a) => s + a.cost, 0);
  const totalTimeSaved = agents.reduce((s, a) => s + a.timeSavedHrs, 0);
  const totalValue = agents.reduce((s, a) => s + a.valueGenerated, 0);
  const netValue = totalValue - totalCost;
  const roiMultiplier = totalCost > 0 ? totalValue / totalCost : 0;
  const maxBar = Math.max(...agents.map(a => Math.max(a.cost, a.valueGenerated)));

  const addEntry = () => {
    if (!formAgent || !formDesc || !formTime) return;
    setEntries(prev => [...prev, { id: String(Date.now()), agent: formAgent, description: formDesc, timeSavedMin: parseInt(formTime), date: formDate }]);
    setFormAgent(''); setFormDesc(''); setFormTime('');
  };

  return (
    <div className="min-h-screen bg-[var(--grid-bg)] text-[var(--grid-text)]">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold mb-2">ROI Tracker</h1>
          <p className="text-[var(--grid-text-dim)] font-mono">Value generated vs cost · ${HOURLY_RATE}/hr human equivalent</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Cost', value: `$${totalCost.toFixed(2)}`, color: '#ef4444' },
            { label: 'Time Saved', value: `${totalTimeSaved.toFixed(1)}h`, color: 'var(--grid-accent)' },
            { label: 'ROI Multiplier', value: `${roiMultiplier.toFixed(1)}x`, color: '#22c55e' },
            { label: 'Net Value', value: `$${netValue.toFixed(2)}`, color: '#22c55e' },
          ].map(c => (
            <div key={c.label} className="rounded-lg border p-4" style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}>
              <p className="text-xs font-mono text-[var(--grid-text-dim)] mb-1">{c.label}</p>
              <p className="text-2xl font-mono font-bold" style={{ color: c.color }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* ROI Chart - Cost vs Value bars */}
        <div className="rounded-lg border p-5 mb-8" style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}>
          <h2 className="text-lg font-mono font-bold mb-4">Cost vs Value by Agent</h2>
          <div className="space-y-4">
            {agents.map(a => (
              <div key={a.agent} className="space-y-1">
                <div className="flex justify-between text-sm font-mono">
                  <span>{a.agent}</span>
                  <span className="text-[var(--grid-text-dim)]">{(a.valueGenerated / a.cost).toFixed(1)}x ROI</span>
                </div>
                <div className="flex gap-1 items-center">
                  <span className="text-xs font-mono w-12 text-right text-[var(--grid-text-dim)]">Cost</span>
                  <div className="flex-1 h-4 rounded-sm overflow-hidden" style={{ background: 'var(--grid-bg)' }}>
                    <div className="h-full rounded-sm" style={{ width: `${(a.cost / maxBar) * 100}%`, background: '#ef4444' }} />
                  </div>
                  <span className="text-xs font-mono w-16 text-[var(--grid-text-dim)]">${a.cost.toFixed(2)}</span>
                </div>
                <div className="flex gap-1 items-center">
                  <span className="text-xs font-mono w-12 text-right text-[var(--grid-text-dim)]">Value</span>
                  <div className="flex-1 h-4 rounded-sm overflow-hidden" style={{ background: 'var(--grid-bg)' }}>
                    <div className="h-full rounded-sm" style={{ width: `${(a.valueGenerated / maxBar) * 100}%`, background: '#22c55e' }} />
                  </div>
                  <span className="text-xs font-mono w-16 text-[var(--grid-text-dim)]">${a.valueGenerated.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Table */}
        <div className="rounded-lg border overflow-x-auto mb-8" style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}>
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--grid-border)' }}>
                {['Agent', 'Cost', 'Tasks', 'Time Saved', 'Rate', 'Value', 'ROI'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-[var(--grid-text-dim)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map(a => (
                <tr key={a.agent} className="border-b" style={{ borderColor: 'var(--grid-border)' }}>
                  <td className="px-4 py-3 font-bold">{a.agent}</td>
                  <td className="px-4 py-3" style={{ color: '#ef4444' }}>${a.cost.toFixed(2)}</td>
                  <td className="px-4 py-3">{a.tasksCompleted}</td>
                  <td className="px-4 py-3">{a.timeSavedHrs}h</td>
                  <td className="px-4 py-3 text-[var(--grid-text-dim)]">${HOURLY_RATE}/hr</td>
                  <td className="px-4 py-3" style={{ color: '#22c55e' }}>${a.valueGenerated.toFixed(0)}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: '#22c55e' }}>{(a.valueGenerated / a.cost).toFixed(1)}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Manual Input Form */}
        <div className="rounded-lg border p-5 mb-8" style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}>
          <h2 className="text-lg font-mono font-bold mb-4">Log Time Saved</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <select value={formAgent} onChange={e => setFormAgent(e.target.value)} className="px-3 py-2 rounded border font-mono bg-[var(--grid-bg)] text-[var(--grid-text)]" style={{ borderColor: 'var(--grid-border)' }}>
              <option value="">Agent...</option>
              {agents.map(a => <option key={a.agent} value={a.agent}>{a.agent}</option>)}
            </select>
            <input placeholder="Task description" value={formDesc} onChange={e => setFormDesc(e.target.value)} className="px-3 py-2 rounded border font-mono bg-[var(--grid-bg)] text-[var(--grid-text)] md:col-span-2" style={{ borderColor: 'var(--grid-border)' }} />
            <input type="number" placeholder="Minutes saved" value={formTime} onChange={e => setFormTime(e.target.value)} className="px-3 py-2 rounded border font-mono bg-[var(--grid-bg)] text-[var(--grid-text)]" style={{ borderColor: 'var(--grid-border)' }} />
            <button onClick={addEntry} className="px-4 py-2 rounded font-mono font-bold text-white" style={{ background: 'var(--grid-accent)' }}>Add Entry</button>
          </div>
        </div>

        {/* Manual Entries */}
        {entries.length > 0 && (
          <div className="rounded-lg border p-5" style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}>
            <h2 className="text-lg font-mono font-bold mb-3">Recent Entries</h2>
            <div className="space-y-2">
              {entries.map(e => (
                <div key={e.id} className="flex items-center justify-between text-sm font-mono py-2 border-b" style={{ borderColor: 'var(--grid-border)' }}>
                  <div>
                    <span className="font-bold">{e.agent}</span>
                    <span className="text-[var(--grid-text-dim)] mx-2">—</span>
                    <span>{e.description}</span>
                  </div>
                  <div className="flex gap-4 text-[var(--grid-text-dim)]">
                    <span>{e.timeSavedMin}min saved</span>
                    <span>${((e.timeSavedMin / 60) * HOURLY_RATE).toFixed(0)} value</span>
                    <span>{e.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
