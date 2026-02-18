/**
 * Cost calculation and formatting utilities
 */

export interface UsageData {
  input?: number;
  output?: number;
  cost?: {
    total?: number;
  };
  // Legacy field names
  input_tokens?: number;
  output_tokens?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
}

/**
 * Extract cost from usage data
 */
export function extractCost(usage: UsageData): number {
  return usage.cost?.total || 0;
}

/**
 * Format cost as USD with appropriate precision
 */
export function formatCostUSD(cost: number | undefined | null): string {
  if (!cost) return '$0.00';
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}

/**
 * Format large costs with K/M suffixes
 */
export function formatLargeCostUSD(cost: number | undefined | null): string {
  if (!cost) return '$0.00';
  if (cost >= 1000) return `$${(cost / 1000).toFixed(1)}K`;
  if (cost >= 100) return `$${cost.toFixed(0)}`;
  return formatCostUSD(cost);
}

/**
 * Calculate cost per thousand tokens for rate analysis
 */
export function calculateCostPerK(totalCost: number, totalTokens: number): number {
  if (totalTokens === 0) return 0;
  return (totalCost / totalTokens) * 1000;
}