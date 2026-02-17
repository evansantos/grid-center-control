/** Cost configuration for AI model pricing */

export interface ModelPricing {
  inputPer1k: number;   // USD per 1k input tokens
  outputPer1k: number;  // USD per 1k output tokens
  name: string;
  provider: string;
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  'claude-opus-4': {
    inputPer1k: 0.015,
    outputPer1k: 0.075,
    name: 'Claude Opus 4',
    provider: 'Anthropic',
  },
  'claude-sonnet-4': {
    inputPer1k: 0.003,
    outputPer1k: 0.015,
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
  },
  'claude-haiku-3.5': {
    inputPer1k: 0.0008,
    outputPer1k: 0.004,
    name: 'Claude Haiku 3.5',
    provider: 'Anthropic',
  },
  'gpt-4o': {
    inputPer1k: 0.0025,
    outputPer1k: 0.01,
    name: 'GPT-4o',
    provider: 'OpenAI',
  },
  'gpt-4o-mini': {
    inputPer1k: 0.00015,
    outputPer1k: 0.0006,
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
  },
};

export const DEFAULT_MODEL = 'claude-sonnet-4';

export function getModelPricing(model: string): ModelPricing {
  // Try exact match, then partial match
  if (MODEL_PRICING[model]) return MODEL_PRICING[model];
  const key = Object.keys(MODEL_PRICING).find(k => model.includes(k));
  return key ? MODEL_PRICING[key] : MODEL_PRICING[DEFAULT_MODEL];
}

/** Budget thresholds */
export const BUDGET = {
  dailyWarning: 5,    // USD
  dailyCritical: 15,
  monthlyWarning: 50,
  monthlyCritical: 150,
};
