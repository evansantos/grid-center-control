export function cronToHuman(expr: string): string {
  const parts = expr.split(' ');
  if (parts.length !== 5) return expr;
  const [min, hour, dom, mon, dow] = parts;
  
  if (min === '*' && hour === '*') return 'Every minute';
  if (hour === '*') return `Every ${min} minutes`;
  if (dom === '*' && mon === '*' && dow === '*') return `Daily at ${hour}:${min.padStart(2,'0')}`;
  if (dow !== '*') {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return `${days[+dow] || dow} at ${hour}:${min.padStart(2,'0')}`;
  }
  return expr;
}

export function nextRun(expr: string): string {
  // Simple estimate - just return "in X minutes" placeholder
  return 'calculating...';
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  command: string;
  enabled: boolean;
  lastRun?: string;
  lastStatus?: 'success' | 'error' | 'running';
}