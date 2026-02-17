'use client';

import { useState, useEffect } from 'react';

interface HeatmapData {
  tools: string[];
  hours: number[];
  data: number[][];
  filters: {
    agent: string;
    fromDate: string;
    toDate: string;
  };
  metadata: {
    maxValue: number;
    totalCalls: number;
    generatedAt: string;
  };
}

function heatColor(value: number, max: number): string {
  const intensity = max > 0 ? value / max : 0;
  return `rgba(255, 68, 68, ${intensity * 0.8 + 0.05})`;
}

export default function HeatmapClient() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hoveredCell, setHoveredCell] = useState<{ tool: string; hour: number; value: number } | null>(null);

  // Set default dates
  useEffect(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    setDateFrom(weekAgo.toISOString().split('T')[0]);
    setDateTo(now.toISOString().split('T')[0]);
  }, []);

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        agent: selectedAgent,
        from: dateFrom,
        to: dateTo
      });

      const response = await fetch(`/api/analytics/heatmap?${params}`);
      if (response.ok) {
        const data = await response.json();
        setHeatmapData(data);
      }
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchHeatmapData();
    }
  }, [selectedAgent, dateFrom, dateTo]);

  if (loading) {
    return <div className="text-[--grid-text-dim]">Loading heatmap...</div>;
  }

  if (!heatmapData) {
    return <div className="text-[--grid-text-dim]">Failed to load heatmap data</div>;
  }

  const cellSize = 30;
  const padding = { top: 40, right: 20, bottom: 60, left: 120 };
  const width = padding.left + heatmapData.hours.length * cellSize + padding.right;
  const height = padding.top + heatmapData.tools.length * cellSize + padding.bottom;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-[--grid-surface] border border-[--grid-border] rounded-lg p-6">
        <h2 className="text-xl font-bold text-[--grid-text] mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[--grid-text-dim] mb-2">
              Agent
            </label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2 border border-[--grid-border] rounded bg-[--grid-bg] text-[--grid-text] font-mono"
            >
              <option value="all">All Agents</option>
              <option value="DEV">DEV</option>
              <option value="QA">QA</option>
              <option value="PO">PO</option>
              <option value="PM">PM</option>
              <option value="OPS">OPS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[--grid-text-dim] mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-[--grid-border] rounded bg-[--grid-bg] text-[--grid-text] font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[--grid-text-dim] mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-[--grid-border] rounded bg-[--grid-bg] text-[--grid-text] font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchHeatmapData}
              className="w-full px-4 py-2 bg-[--grid-accent] text-white rounded hover:opacity-80 font-mono"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[--grid-surface] border border-[--grid-border] rounded-lg p-4">
          <div className="text-2xl font-bold text-[--grid-accent] font-mono">
            {heatmapData.metadata.totalCalls}
          </div>
          <div className="text-[--grid-text-dim]">Total Calls</div>
        </div>
        <div className="bg-[--grid-surface] border border-[--grid-border] rounded-lg p-4">
          <div className="text-2xl font-bold text-[--grid-accent] font-mono">
            {heatmapData.metadata.maxValue}
          </div>
          <div className="text-[--grid-text-dim]">Peak Usage</div>
        </div>
        <div className="bg-[--grid-surface] border border-[--grid-border] rounded-lg p-4">
          <div className="text-2xl font-bold text-[--grid-accent] font-mono">
            {heatmapData.tools.length}
          </div>
          <div className="text-[--grid-text-dim]">Tools Tracked</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-[--grid-surface] border border-[--grid-border] rounded-lg p-6 overflow-x-auto">
        <div className="relative">
          <svg width={width} height={height} className="font-mono">
            {/* Y-axis labels (tools) */}
            {heatmapData.tools.map((tool, i) => (
              <text
                key={tool}
                x={padding.left - 10}
                y={padding.top + i * cellSize + cellSize / 2}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="12"
                fill="var(--grid-text)"
                className="font-mono"
              >
                {tool}
              </text>
            ))}

            {/* X-axis labels (hours) */}
            {heatmapData.hours.map((hour, i) => (
              <text
                key={hour}
                x={padding.left + i * cellSize + cellSize / 2}
                y={padding.top - 10}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fill="var(--grid-text)"
                className="font-mono"
              >
                {hour.toString().padStart(2, '0')}
              </text>
            ))}

            {/* Grid lines */}
            <g stroke="var(--grid-border)" strokeWidth="1" opacity="0.3">
              {/* Vertical lines */}
              {heatmapData.hours.map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={padding.left + i * cellSize}
                  y1={padding.top}
                  x2={padding.left + i * cellSize}
                  y2={padding.top + heatmapData.tools.length * cellSize}
                />
              ))}
              {/* Horizontal lines */}
              {heatmapData.tools.map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1={padding.left}
                  y1={padding.top + i * cellSize}
                  x2={padding.left + heatmapData.hours.length * cellSize}
                  y2={padding.top + i * cellSize}
                />
              ))}
            </g>

            {/* Heatmap cells */}
            {heatmapData.tools.map((tool, toolIndex) =>
              heatmapData.hours.map((hour, hourIndex) => {
                const value = heatmapData.data[toolIndex][hourIndex];
                const color = heatColor(value, heatmapData.metadata.maxValue);
                
                return (
                  <rect
                    key={`${tool}-${hour}`}
                    x={padding.left + hourIndex * cellSize + 1}
                    y={padding.top + toolIndex * cellSize + 1}
                    width={cellSize - 2}
                    height={cellSize - 2}
                    fill={color}
                    stroke="var(--grid-border)"
                    strokeWidth="0.5"
                    className="cursor-pointer hover:stroke-2"
                    onMouseEnter={() => setHoveredCell({ tool, hour, value })}
                    onMouseLeave={() => setHoveredCell(null)}
                  />
                );
              })
            )}

            {/* Working hours highlight */}
            <rect
              x={padding.left + 9 * cellSize}
              y={padding.top}
              width={10 * cellSize}
              height={heatmapData.tools.length * cellSize}
              fill="none"
              stroke="var(--grid-accent)"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.5"
              pointerEvents="none"
            />
          </svg>

          {/* Tooltip */}
          {hoveredCell && (
            <div className="absolute bg-[--grid-bg] border border-[--grid-border] rounded px-3 py-2 text-sm font-mono shadow-lg pointer-events-none z-10">
              <div className="text-[--grid-text] font-bold">{hoveredCell.tool}</div>
              <div className="text-[--grid-text-dim]">
                {hoveredCell.value} calls at {hoveredCell.hour.toString().padStart(2, '0')}:00
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <span className="text-[--grid-text-dim] text-sm">Low</span>
          <div className="flex">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity, i) => (
              <div
                key={i}
                className="w-6 h-4 border border-[--grid-border]"
                style={{ 
                  backgroundColor: `rgba(255, 68, 68, ${intensity * 0.8 + 0.05})` 
                }}
              />
            ))}
          </div>
          <span className="text-[--grid-text-dim] text-sm">High</span>
        </div>

        <div className="mt-4 text-center text-sm text-[--grid-text-dim]">
          <span>Working hours (9-18) are highlighted</span>
          {' • '}
          <span>Generated: {new Date(heatmapData.metadata.generatedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}