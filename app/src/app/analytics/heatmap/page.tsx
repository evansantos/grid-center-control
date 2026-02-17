import { Metadata } from 'next';
import HeatmapClient from './client';

export const metadata: Metadata = {
  title: 'Tool Call Heatmap',
  description: 'Visualize tool usage patterns across time with an interactive heatmap',
};

export default function HeatmapPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[--grid-text] mb-2">
          Tool Call Heatmap
        </h1>
        <p className="text-[--grid-text-dim]">
          Analyze tool usage patterns across different hours of the day
        </p>
      </div>
      
      <HeatmapClient />
    </div>
  );
}