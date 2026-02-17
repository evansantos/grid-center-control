'use client';

import { useState, useEffect, useCallback } from 'react';

interface ROIEntry {
  id: string;
  description: string;
  hoursSaved: number;
  hourlyRate: number;
  estimatedValue: number;
  aiCost: number;
  createdAt: string;
}

export default function ROIClient() {
  const [entries, setEntries] = useState<ROIEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [desc, setDesc] = useState('');
  const [hours, setHours] = useState('');
  const [rate, setRate] = useState('75');
  const [cost, setCost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    fetch('/api/analytics/roi')
      .then(r => r.json())
      .then(d => setEntries(d.entries || []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalValue = entries.reduce((s, e) => s + e.estimatedValue, 0);
  const totalCost = entries.reduce((s, e) => s + e.aiCost, 0);
  const roiRatio = totalCost > 0 ? totalValue / totalCost : 0;
  const totalHours = entries.reduce((s, e) => s + e.hoursSaved, 0);
  const payback = totalValue >= totalCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !hours) return;
    setSubmitting(true);
    await fetch('/api/analytics/roi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: desc,
        hoursSaved: parseFloat(hours),
        hourlyRate: parseFloat(rate) || 75,
        aiCost: parseFloat(cost) || 0,
      }),
    });
    setDesc(''); setHours(''); setCost('');
    setSubmitting(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/analytics/roi?id=${id}`, { method: 'DELETE' });
    load();
  };

  const maxBar = Math.max(totalValue, totalCost, 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-mono font-bold text-white">📊 ROI Tracker</h1>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total AI Cost', value: `$${totalCost.toFixed(2)}`, color: '#ef4444' },
          { label: 'Value Saved', value: `$${totalValue.toFixed(2)}`, color: '#22c55e' },
          { label: 'ROI Ratio', value: totalCost > 0 ? `${roiRatio.toFixed(1)}x` : '—', color: '#a78bfa' },
          { label: 'Payback', value: payback ? '✅ Paid back' : '⏳ Not yet', color: payback ? '#22c55e' : '#eab308' },
        ].map(card => (
          <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="text-xs font-mono text-zinc-500 mb-1">{card.label}</div>
            <div className="text-xl font-mono font-bold" style={{ color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Cost vs Value Bar Chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h2 className="text-sm font-mono font-bold text-zinc-400 mb-4">Cost vs Value</h2>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-zinc-400">AI Cost</span>
              <span className="text-xs font-mono text-red-400">${totalCost.toFixed(2)}</span>
            </div>
            <div className="h-6 bg-zinc-800 rounded overflow-hidden">
              <div
                className="h-full bg-red-500/70 rounded transition-all"
                style={{ width: `${(totalCost / maxBar) * 100}%`, minWidth: totalCost > 0 ? '2px' : '0' }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-zinc-400">Human Value Saved</span>
              <span className="text-xs font-mono text-green-400">${totalValue.toFixed(2)}</span>
            </div>
            <div className="h-6 bg-zinc-800 rounded overflow-hidden">
              <div
                className="h-full bg-green-500/70 rounded transition-all"
                style={{ width: `${(totalValue / maxBar) * 100}%`, minWidth: totalValue > 0 ? '2px' : '0' }}
              />
            </div>
          </div>
        </div>
        <div className="text-xs font-mono text-zinc-600 mt-2">
          {totalHours.toFixed(1)}h human time saved across {entries.length} entries
        </div>
      </div>

      {/* Per-Entry Bars */}
      {entries.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h2 className="text-sm font-mono font-bold text-zinc-400 mb-3">Value by Entry</h2>
          <div className="space-y-2">
            {entries.map(entry => {
              const entryMax = Math.max(...entries.map(e => e.estimatedValue), 1);
              return (
                <div key={entry.id} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-300 w-32 truncate" title={entry.description}>
                    {entry.description}
                  </span>
                  <div className="flex-1 h-3 bg-zinc-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-violet-500/70 rounded"
                      style={{ width: `${(entry.estimatedValue / entryMax) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-zinc-400 w-16 text-right">
                    ${entry.estimatedValue.toFixed(0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Entry Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h2 className="text-sm font-mono font-bold text-zinc-400 mb-3">Add ROI Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
            placeholder="Task description"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            required
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
              placeholder="Hours saved"
              type="number"
              step="0.1"
              min="0"
              value={hours}
              onChange={e => setHours(e.target.value)}
              required
            />
            <input
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
              placeholder="$/hr (75)"
              type="number"
              step="1"
              min="0"
              value={rate}
              onChange={e => setRate(e.target.value)}
            />
            <input
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50"
              placeholder="AI cost ($)"
              type="number"
              step="0.01"
              min="0"
              value={cost}
              onChange={e => setCost(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-xs font-mono rounded-md bg-violet-500/20 border border-violet-500/50 text-violet-300 hover:bg-violet-500/30 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Adding...' : '+ Add Entry'}
          </button>
        </form>
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="text-center py-8 text-zinc-500 font-mono">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 font-mono">No ROI entries yet</div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left p-3">Description</th>
                <th className="text-right p-3">Hours</th>
                <th className="text-right p-3">Rate</th>
                <th className="text-right p-3">Value</th>
                <th className="text-right p-3">AI Cost</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="p-3 text-zinc-300">{entry.description}</td>
                  <td className="p-3 text-right text-zinc-400">{entry.hoursSaved}h</td>
                  <td className="p-3 text-right text-zinc-400">${entry.hourlyRate}</td>
                  <td className="p-3 text-right text-green-400">${entry.estimatedValue.toFixed(0)}</td>
                  <td className="p-3 text-right text-red-400">${entry.aiCost.toFixed(2)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
