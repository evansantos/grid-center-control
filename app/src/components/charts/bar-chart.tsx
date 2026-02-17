'use client';

import { useState } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export default function BarChart({ 
  data, 
  width = 400, 
  height = 200, 
  color = 'var(--grid-accent)',
  className = '' 
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data.length) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-[--grid-text-dim]">No data available</span>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = chartWidth / data.length * 0.8;
  const barSpacing = chartWidth / data.length * 0.2;

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Chart area background */}
        <rect
          x={padding.left}
          y={padding.top}
          width={chartWidth}
          height={chartHeight}
          fill="transparent"
          stroke="var(--grid-border)"
          strokeOpacity="0.2"
        />

        {/* Y-axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={padding.top + chartHeight * (1 - ratio)}
              x2={padding.left + chartWidth}
              y2={padding.top + chartHeight * (1 - ratio)}
              stroke="var(--grid-border)"
              strokeOpacity="0.1"
            />
            <text
              x={padding.left - 8}
              y={padding.top + chartHeight * (1 - ratio) + 4}
              textAnchor="end"
              fontSize="10"
              fill="var(--grid-text-dim)"
              className="font-mono"
            >
              {Math.round(maxValue * ratio)}
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
          const x = padding.left + index * (barWidth + barSpacing) + barSpacing / 2;
          const y = padding.top + chartHeight - barHeight;
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={hoveredIndex === index ? color : color}
                fillOpacity={hoveredIndex === index ? 1 : 0.8}
                stroke="var(--grid-border)"
                strokeWidth="1"
                rx="2"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              
              {/* X-axis labels */}
              <text
                x={x + barWidth / 2}
                y={padding.top + chartHeight + 20}
                textAnchor="middle"
                fontSize="10"
                fill="var(--grid-text-dim)"
                className="font-mono"
              >
                {item.label.length > 8 ? item.label.substring(0, 6) + '...' : item.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="absolute bg-[--grid-surface] border border-[--grid-border] rounded px-2 py-1 text-sm font-mono pointer-events-none z-10 shadow-lg"
          style={{
            left: padding.left + hoveredIndex * (barWidth + barSpacing) + barSpacing / 2 + barWidth / 2,
            top: padding.top - 10,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="text-[--grid-text]">{data[hoveredIndex].label}</div>
          <div className="text-[--grid-accent] font-bold">{data[hoveredIndex].value}</div>
        </div>
      )}
    </div>
  );
}