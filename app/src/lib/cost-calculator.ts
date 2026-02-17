import { getModelPricing, BUDGET, type ModelPricing } from './cost-config';

export interface TokenUsage {
  agent: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  timestamp: string;
}

export interface CostBreakdown {
  agent: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

export interface CostSummary {
  totalCost: number;
  byAgent: Record<string, number>;
  byModel: Record<string, number>;
  breakdowns: CostBreakdown[];
  budgetStatus: 'ok' | 'warning' | 'critical';
  budgetPercent: number;
}

export function calculateCost(usage: TokenUsage): CostBreakdown {
  const pricing = getModelPricing(usage.model);
  const inputCost = (usage.inputTokens / 1000) * pricing.inputPer1k;
  const outputCost = (usage.outputTokens / 1000) * pricing.outputPer1k;

  return {
    agent: usage.agent,
    model: usage.model,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}

export function summarizeCosts(usages: TokenUsage[], period: 'daily' | 'monthly' = 'daily'): CostSummary {
  const breakdowns = usages.map(calculateCost);
  const totalCost = breakdowns.reduce((sum, b) => sum + b.totalCost, 0);

  const byAgent: Record<string, number> = {};
  const byModel: Record<string, number> = {};

  for (const b of breakdowns) {
    byAgent[b.agent] = (byAgent[b.agent] || 0) + b.totalCost;
    byModel[b.model] = (byModel[b.model] || 0) + b.totalCost;
  }

  const threshold = period === 'daily'
    ? { warning: BUDGET.dailyWarning, critical: BUDGET.dailyCritical }
    : { warning: BUDGET.monthlyWarning, critical: BUDGET.monthlyCritical };

  const budgetStatus = totalCost >= threshold.critical ? 'critical'
    : totalCost >= threshold.warning ? 'warning' : 'ok';
  const budgetPercent = (totalCost / threshold.critical) * 100;

  return { totalCost, byAgent, byModel, breakdowns, budgetStatus, budgetPercent };
}

export function formatCost(usd: number): string {
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  if (usd < 1) return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(2)}`;
}
