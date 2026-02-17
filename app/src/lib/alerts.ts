export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  comparator: 'gt' | 'lt' | 'eq' | 'increase' | 'decrease';
  window: number; // minutes
  enabled: boolean;
  description: string;
}

export interface Alert {
  id: string;
  rule: AlertRule;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  metric_value: number;
  baseline_value: number;
}

export interface Event {
  id: string;
  timestamp: string;
  type: string;
  metric?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'cost_spike',
    name: 'Cost Spike',
    metric: 'cost',
    threshold: 50,
    comparator: 'increase',
    window: 60,
    enabled: true,
    description: 'Alert when costs increase by more than 50% compared to baseline'
  },
  {
    id: 'error_rate',
    name: 'Error Rate',
    metric: 'errors',
    threshold: 200,
    comparator: 'increase',
    window: 30,
    enabled: true,
    description: 'Alert when error rate exceeds 2x baseline'
  },
  {
    id: 'usage_spike',
    name: 'Usage Spike',
    metric: 'usage',
    threshold: 300,
    comparator: 'increase',
    window: 60,
    enabled: true,
    description: 'Alert when usage exceeds 3x average'
  }
];

function calculateBaseline(events: Event[], metric: string, windowMinutes: number): number {
  const now = new Date();
  const windowStart = new Date(now.getTime() - (windowMinutes * 2 * 60 * 1000)); // 2x window for baseline
  const baselineEnd = new Date(now.getTime() - (windowMinutes * 60 * 1000));
  
  const baselineEvents = events.filter(event => {
    const eventTime = new Date(event.timestamp);
    return eventTime >= windowStart && 
           eventTime <= baselineEnd && 
           event.metric === metric && 
           event.value !== undefined;
  });

  if (baselineEvents.length === 0) return 0;

  const values = baselineEvents.map(e => e.value!);
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function getCurrentValue(events: Event[], metric: string, windowMinutes: number): number {
  const now = new Date();
  const windowStart = new Date(now.getTime() - (windowMinutes * 60 * 1000));
  
  const currentEvents = events.filter(event => {
    const eventTime = new Date(event.timestamp);
    return eventTime >= windowStart && 
           event.metric === metric && 
           event.value !== undefined;
  });

  if (currentEvents.length === 0) return 0;

  const values = currentEvents.map(e => e.value!);
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculateSeverity(rule: AlertRule, currentValue: number, baselineValue: number): Alert['severity'] {
  const percentChange = baselineValue === 0 ? 100 : ((currentValue - baselineValue) / baselineValue) * 100;
  
  if (percentChange >= rule.threshold * 2) return 'critical';
  if (percentChange >= rule.threshold * 1.5) return 'high';
  if (percentChange >= rule.threshold) return 'medium';
  return 'low';
}

export function detectAnomalies(events: Event[], rules: AlertRule[] = DEFAULT_ALERT_RULES): Alert[] {
  const alerts: Alert[] = [];
  
  for (const rule of rules) {
    if (!rule.enabled) continue;

    const currentValue = getCurrentValue(events, rule.metric, rule.window);
    const baselineValue = calculateBaseline(events, rule.metric, rule.window);
    
    let isTriggered = false;
    let message = '';

    switch (rule.comparator) {
      case 'gt':
        isTriggered = currentValue > rule.threshold;
        message = `${rule.name}: ${rule.metric} is ${currentValue.toFixed(2)} (threshold: ${rule.threshold})`;
        break;
      case 'lt':
        isTriggered = currentValue < rule.threshold;
        message = `${rule.name}: ${rule.metric} is ${currentValue.toFixed(2)} (threshold: ${rule.threshold})`;
        break;
      case 'eq':
        isTriggered = Math.abs(currentValue - rule.threshold) < 0.01;
        message = `${rule.name}: ${rule.metric} equals ${currentValue.toFixed(2)}`;
        break;
      case 'increase':
        if (baselineValue > 0) {
          const percentIncrease = ((currentValue - baselineValue) / baselineValue) * 100;
          isTriggered = percentIncrease > rule.threshold;
          message = `${rule.name}: ${rule.metric} increased ${percentIncrease.toFixed(1)}% (threshold: ${rule.threshold}%)`;
        }
        break;
      case 'decrease':
        if (baselineValue > 0) {
          const percentDecrease = ((baselineValue - currentValue) / baselineValue) * 100;
          isTriggered = percentDecrease > rule.threshold;
          message = `${rule.name}: ${rule.metric} decreased ${percentDecrease.toFixed(1)}% (threshold: ${rule.threshold}%)`;
        }
        break;
    }

    if (isTriggered) {
      const severity = calculateSeverity(rule, currentValue, baselineValue);
      
      alerts.push({
        id: `${rule.id}_${Date.now()}`,
        rule,
        severity,
        message,
        timestamp: new Date().toISOString(),
        metric_value: currentValue,
        baseline_value: baselineValue
      });
    }
  }

  return alerts;
}