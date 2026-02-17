import { NextRequest, NextResponse } from 'next/server';
import { AlertRulesSchema, validateBody } from '@/lib/validators';
import fs from 'fs/promises';
import path from 'path';
import { getDB } from '@/lib/db';
import { detectAnomalies, DEFAULT_ALERT_RULES, AlertRule, Event } from '@/lib/alerts';
import os from 'os';

const ALERT_CONFIG_FILE = path.join(os.homedir(), '.openclaw', 'alert-config.json');

async function loadAlertConfig(): Promise<AlertRule[]> {
  try {
    const data = await fs.readFile(ALERT_CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, use defaults
    return DEFAULT_ALERT_RULES;
  }
}

async function saveAlertConfig(rules: AlertRule[]): Promise<void> {
  const dir = path.dirname(ALERT_CONFIG_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(ALERT_CONFIG_FILE, JSON.stringify(rules, null, 2));
}

async function getRecentEvents(): Promise<Event[]> {
  const db = getDB();
  
  // Get events from the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  try {
    const stmt = db.prepare(`
      SELECT id, created_at as timestamp, type, data
      FROM events 
      WHERE created_at > ?
      ORDER BY created_at DESC
    `);
    
    const rows = stmt.all(twentyFourHoursAgo) as Array<{
      id: string;
      timestamp: string;
      type: string;
      data: string;
    }>;

    return rows.map(row => {
      let metadata = {};
      let metric = '';
      let value: number | undefined;

      try {
        metadata = JSON.parse(row.data || '{}');
        // Extract metric and value from metadata
        if (metadata && typeof metadata === 'object') {
          const data = metadata as Record<string, any>;
          metric = data.metric || row.type;
          value = typeof data.value === 'number' ? data.value : undefined;
        }
      } catch (error) {
        /* Invalid JSON in event data — skip metadata parsing */
      }

      return {
        id: row.id,
        timestamp: row.timestamp,
        type: row.type,
        metric,
        value,
        metadata
      };
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    // Return mock data if database is not available
    return generateMockEvents();
  }
}

function generateMockEvents(): Event[] {
  const events: Event[] = [];
  const now = new Date();
  
  // Generate some mock events for the last 2 hours
  for (let i = 0; i < 120; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 1000); // Every minute
    
    events.push({
      id: `mock_${i}`,
      timestamp: timestamp.toISOString(),
      type: 'cost',
      metric: 'cost',
      value: Math.random() * 100 + 50 + (i < 30 ? Math.random() * 200 : 0), // Spike in recent data
      metadata: { source: 'mock' }
    });

    if (i % 3 === 0) {
      events.push({
        id: `mock_error_${i}`,
        timestamp: timestamp.toISOString(),
        type: 'error',
        metric: 'errors',
        value: Math.random() * 10 + (i < 20 ? Math.random() * 50 : 0), // Error spike
        metadata: { source: 'mock' }
      });
    }

    if (i % 2 === 0) {
      events.push({
        id: `mock_usage_${i}`,
        timestamp: timestamp.toISOString(),
        type: 'usage',
        metric: 'usage',
        value: Math.random() * 1000 + 100 + (i < 15 ? Math.random() * 2000 : 0), // Usage spike
        metadata: { source: 'mock' }
      });
    }
  }
  
  return events;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configOnly = searchParams.get('config') === 'true';

    if (configOnly) {
      const config = await loadAlertConfig();
      return NextResponse.json(config);
    }

    // Get recent events and run anomaly detection
    const events = await getRecentEvents();
    const alertRules = await loadAlertConfig();
    const alerts = detectAnomalies(events, alertRules);

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error in alerts API:', error);
    return NextResponse.json({ error: 'Failed to process alerts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const validated = validateBody(AlertRulesSchema, raw);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { rules } = validated.data;

    // Normalize rules with defaults for AlertRule compatibility
    const normalized: AlertRule[] = rules.map(rule => ({
      ...rule,
      description: rule.description ?? rule.name,
    }));

    await saveAlertConfig(normalized);

    return NextResponse.json({ message: 'Alert configuration updated successfully' });
  } catch (error) {
    console.error('Error updating alert config:', error);
    return NextResponse.json({ error: 'Failed to update alert configuration' }, { status: 500 });
  }
}