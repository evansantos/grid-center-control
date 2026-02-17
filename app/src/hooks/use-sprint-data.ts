import { useState, useEffect } from 'react';

interface SprintTask {
  id: string;
  task_number: number;
  title: string;
  description: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
}

interface SprintSummary {
  total: number;
  done: number;
  inProgress: number;
  pending: number;
}

interface SprintData {
  projectName: string;
  tasks: SprintTask[];
  summary: SprintSummary;
}

export function useSprintData() {
  const [data, setData] = useState<SprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSprintData = async () => {
    try {
      const response = await fetch('/api/sprint/current');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const newData = await response.json();
      setData(newData);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sprint data');
      // Keep the last successful response during refresh
      // Don't clear data on error to show stale data while refreshing
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchSprintData();
    
    // Set up polling every 30 seconds
    const interval = setInterval(fetchSprintData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}