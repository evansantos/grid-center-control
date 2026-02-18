'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TokenUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  requests: number;
  avgTokensPerRequest: number;
}

interface TokenAnalytics {
  overview: {
    totalTokens: number;
    totalCost: number;
    totalRequests: number;
    avgCostPerRequest: number;
  };
  models: TokenUsage[];
  trends: {
    tokens: 'up' | 'down' | 'neutral';
    cost: 'up' | 'down' | 'neutral';
    requests: 'up' | 'down' | 'neutral';
  };
  period: {
    start: string;
    end: string;
  };
}

export default function TokenAnalyticsPage() {
  const [analytics, setAnalytics] = useState<TokenAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('24h');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchTokenData = async () => {
    try {
      const response = await fetch(`/api/analytics/tokens?period=${period}`);
      const data = await response.json();
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch token data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenData();
    const interval = setInterval(fetchTokenData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [period]);

  const handleRefresh = () => {
    setLoading(true);
    fetchTokenData();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  if (loading && !analytics) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <PageHeader
          title="Token Analytics"
          description="Loading token usage and cost data..."
          icon="🪙"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-grid-surface-hover rounded mb-2" />
                <div className="h-8 bg-grid-surface-hover rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Token Analytics"
        description="Track API token usage, costs, and efficiency across models and time periods"
        icon="🪙"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-grid-text-muted">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        }
      />

      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        {(['24h', '7d', '30d'] as const).map((p) => (
          <Button
            key={p}
            variant={period === p ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriod(p)}
          >
            {p === '24h' ? 'Last 24 Hours' : p === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
          </Button>
        ))}
      </div>

      {/* Token Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="🪙"
          label="Total Tokens"
          value={formatNumber(analytics?.overview.totalTokens ?? 0)}
          variant="info"
          change={analytics?.trends.tokens === 'up' ? '+23%' : analytics?.trends.tokens === 'down' ? '-12%' : '0%'}
          changeType={analytics?.trends.tokens === 'up' ? 'increase' : analytics?.trends.tokens === 'down' ? 'decrease' : 'neutral'}
        />
        <StatCard
          icon="💰"
          label="Total Cost"
          value={formatCurrency(analytics?.overview.totalCost ?? 0)}
          variant={analytics?.overview.totalCost && analytics.overview.totalCost > 100 ? 'warning' : 'success'}
          change={analytics?.trends.cost === 'up' ? '+18%' : analytics?.trends.cost === 'down' ? '-7%' : '0%'}
          changeType={analytics?.trends.cost === 'up' ? 'increase' : analytics?.trends.cost === 'down' ? 'decrease' : 'neutral'}
        />
        <StatCard
          icon="📊"
          label="Total Requests"
          value={formatNumber(analytics?.overview.totalRequests ?? 0)}
          variant="default"
          change={analytics?.trends.requests === 'up' ? '+31' : analytics?.trends.requests === 'down' ? '-15' : '0'}
          changeType={analytics?.trends.requests === 'up' ? 'increase' : analytics?.trends.requests === 'down' ? 'decrease' : 'neutral'}
        />
        <StatCard
          icon="⚖️"
          label="Avg Cost/Request"
          value={formatCurrency(analytics?.overview.avgCostPerRequest ?? 0)}
          variant="default"
        />
      </div>

      {/* Period Information */}
      {analytics?.period && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-grid-text-muted">
                Period: {new Date(analytics.period.start).toLocaleString()} - {new Date(analytics.period.end).toLocaleString()}
              </span>
              <Badge variant="outline" size="sm">
                {period}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Model Usage Breakdown */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-grid-text">Usage by Model</h2>
        </CardHeader>
        <CardContent>
          {analytics?.models && analytics.models.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-grid-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-grid-text-muted">Model</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Requests</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Input Tokens</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Output Tokens</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Total Tokens</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Avg/Request</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-grid-text-muted">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.models
                    .sort((a, b) => b.totalTokens - a.totalTokens) // Sort by total tokens desc
                    .map((model, index) => (
                    <tr key={model.model} className="border-b border-grid-border/50 hover:bg-grid-surface/50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-grid-text">
                            {model.model}
                          </span>
                          {index === 0 && (
                            <Badge variant="success" size="sm">Most Used</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-grid-text">
                        {formatNumber(model.requests)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-grid-text">
                        {formatNumber(model.inputTokens)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-grid-text">
                        {formatNumber(model.outputTokens)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-semibold text-grid-text">
                        {formatNumber(model.totalTokens)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-grid-text-muted">
                        {Math.round(model.avgTokensPerRequest).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-mono">
                        <span className={
                          model.cost > 10 ? 'text-red-400' :
                          model.cost > 1 ? 'text-yellow-400' : 'text-green-400'
                        }>
                          {formatCurrency(model.cost)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-grid-border font-semibold">
                    <td className="py-3 px-2 text-grid-text">Total</td>
                    <td className="py-3 px-2 text-right font-mono text-grid-text">
                      {formatNumber(analytics.overview.totalRequests)}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-grid-text">
                      {formatNumber(analytics.models.reduce((sum, m) => sum + m.inputTokens, 0))}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-grid-text">
                      {formatNumber(analytics.models.reduce((sum, m) => sum + m.outputTokens, 0))}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-grid-text">
                      {formatNumber(analytics.overview.totalTokens)}
                    </td>
                    <td className="py-3 px-2"></td>
                    <td className="py-3 px-2 text-right font-mono text-grid-text">
                      {formatCurrency(analytics.overview.totalCost)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-grid-text-muted">
              No token usage data available for this period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}