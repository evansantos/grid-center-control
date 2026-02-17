import { NextRequest, NextResponse } from 'next/server';

export interface ChangelogEntry {
  id: string;
  timestamp: string;
  agent: string;
  changeType: 'soul_edit' | 'cron_modified' | 'model_changed' | 'skill_added' | 'skill_removed' | 'config_updated';
  description: string;
  diff: { before: string; after: string };
}

const MOCK_DATA: ChangelogEntry[] = [
  { id: '1', timestamp: '2026-02-17T16:45:00Z', agent: 'po', changeType: 'soul_edit', description: 'Updated personality traits section — added empathy guidelines', diff: { before: '## Personality\n- Helpful\n- Direct', after: '## Personality\n- Helpful\n- Direct\n- Empathetic in error handling' } },
  { id: '2', timestamp: '2026-02-17T16:20:00Z', agent: 'dev', changeType: 'model_changed', description: 'Switched default model from gpt-4o to claude-opus-4-6', diff: { before: 'default_model=openai/gpt-4o', after: 'default_model=anthropic/claude-opus-4-6' } },
  { id: '3', timestamp: '2026-02-17T15:30:00Z', agent: 'qa', changeType: 'cron_modified', description: 'Added daily test suite run at 06:00 UTC', diff: { before: 'crons: []', after: 'crons:\n  - schedule: "0 6 * * *"\n    task: "run test suite"' } },
  { id: '4', timestamp: '2026-02-17T14:55:00Z', agent: 'ui', changeType: 'skill_added', description: 'Added browser-automation skill for UI testing', diff: { before: 'skills: [tts, web_search]', after: 'skills: [tts, web_search, browser_automation]' } },
  { id: '5', timestamp: '2026-02-17T14:10:00Z', agent: 'main', changeType: 'config_updated', description: 'Increased heartbeat interval from 15m to 30m', diff: { before: 'heartbeat_interval: 15', after: 'heartbeat_interval: 30' } },
  { id: '6', timestamp: '2026-02-17T13:00:00Z', agent: 'po', changeType: 'cron_modified', description: 'Disabled weekend email check cron', diff: { before: 'schedule: "0 9 * * *"', after: 'schedule: "0 9 * * 1-5"' } },
  { id: '7', timestamp: '2026-02-17T11:30:00Z', agent: 'dev', changeType: 'skill_removed', description: 'Removed deprecated legacy-deploy skill', diff: { before: 'skills: [git, deploy, legacy-deploy]', after: 'skills: [git, deploy]' } },
  { id: '8', timestamp: '2026-02-17T10:15:00Z', agent: 'qa', changeType: 'soul_edit', description: 'Added strict mode for test assertions', diff: { before: '## Testing\n- Run tests on request', after: '## Testing\n- Run tests on request\n- Always use strict assertions\n- Fail fast on flaky tests' } },
  { id: '9', timestamp: '2026-02-17T09:00:00Z', agent: 'po', changeType: 'config_updated', description: 'Set default channel to telegram', diff: { before: 'channel: discord', after: 'channel: telegram' } },
  { id: '10', timestamp: '2026-02-17T08:20:00Z', agent: 'ui', changeType: 'model_changed', description: 'Switched to gpt-4o-mini for quick UI feedback', diff: { before: 'model=openai/gpt-4o', after: 'model=openai/gpt-4o-mini' } },
  { id: '11', timestamp: '2026-02-16T22:00:00Z', agent: 'main', changeType: 'soul_edit', description: 'Rewrote intro section with new voice guidelines', diff: { before: '## Voice\nBe professional.', after: '## Voice\nBe warm but professional. Use humor sparingly.' } },
  { id: '12', timestamp: '2026-02-16T20:30:00Z', agent: 'dev', changeType: 'config_updated', description: 'Enabled thinking mode for complex tasks', diff: { before: 'thinking: off', after: 'thinking: low' } },
  { id: '13', timestamp: '2026-02-16T19:45:00Z', agent: 'po', changeType: 'skill_added', description: 'Added calendar-sync skill', diff: { before: 'skills: [tts, web_search]', after: 'skills: [tts, web_search, calendar_sync]' } },
  { id: '14', timestamp: '2026-02-16T18:00:00Z', agent: 'qa', changeType: 'cron_modified', description: 'Changed test report delivery to 08:00 instead of 07:00', diff: { before: 'schedule: "0 7 * * *"', after: 'schedule: "0 8 * * *"' } },
  { id: '15', timestamp: '2026-02-16T16:30:00Z', agent: 'ui', changeType: 'soul_edit', description: 'Added accessibility-first design principles', diff: { before: '## Design\n- Clean UI', after: '## Design\n- Clean UI\n- Accessibility first\n- WCAG 2.1 AA minimum' } },
  { id: '16', timestamp: '2026-02-16T15:10:00Z', agent: 'main', changeType: 'model_changed', description: 'Upgraded to claude-opus-4-6 from claude-sonnet-4-20250514', diff: { before: 'model=anthropic/claude-sonnet-4-20250514', after: 'model=anthropic/claude-opus-4-6' } },
  { id: '17', timestamp: '2026-02-16T13:40:00Z', agent: 'dev', changeType: 'skill_added', description: 'Added docker-compose skill for local dev', diff: { before: 'skills: [git, deploy]', after: 'skills: [git, deploy, docker_compose]' } },
  { id: '18', timestamp: '2026-02-16T12:00:00Z', agent: 'po', changeType: 'config_updated', description: 'Updated timezone from UTC to Europe/Warsaw', diff: { before: 'timezone: UTC', after: 'timezone: Europe/Warsaw' } },
  { id: '19', timestamp: '2026-02-16T10:20:00Z', agent: 'qa', changeType: 'skill_removed', description: 'Removed manual-review skill — fully automated now', diff: { before: 'skills: [test, lint, manual_review]', after: 'skills: [test, lint]' } },
  { id: '20', timestamp: '2026-02-16T09:00:00Z', agent: 'ui', changeType: 'config_updated', description: 'Enabled dark mode as default theme', diff: { before: 'theme: light', after: 'theme: dark' } },
  { id: '21', timestamp: '2026-02-15T21:00:00Z', agent: 'main', changeType: 'cron_modified', description: 'Added weekly summary cron every Monday 09:00', diff: { before: 'crons:\n  - daily_check', after: 'crons:\n  - daily_check\n  - schedule: "0 9 * * 1"\n    task: weekly_summary' } },
  { id: '22', timestamp: '2026-02-15T19:30:00Z', agent: 'po', changeType: 'soul_edit', description: 'Clarified boundaries for group chat behavior', diff: { before: '## Groups\nParticipate when relevant.', after: '## Groups\nParticipate when relevant.\nNever dominate. Quality > quantity.' } },
  { id: '23', timestamp: '2026-02-15T17:45:00Z', agent: 'dev', changeType: 'config_updated', description: 'Set max file size limit to 50KB for reads', diff: { before: 'max_read_size: 100KB', after: 'max_read_size: 50KB' } },
  { id: '24', timestamp: '2026-02-15T16:00:00Z', agent: 'qa', changeType: 'model_changed', description: 'Switched to gpt-4o for better test analysis', diff: { before: 'model=openai/gpt-4o-mini', after: 'model=openai/gpt-4o' } },
  { id: '25', timestamp: '2026-02-15T14:20:00Z', agent: 'ui', changeType: 'skill_added', description: 'Added figma-export skill for design tokens', diff: { before: 'skills: [tts, browser_automation]', after: 'skills: [tts, browser_automation, figma_export]' } },
  { id: '26', timestamp: '2026-02-15T12:00:00Z', agent: 'main', changeType: 'soul_edit', description: 'Added safety section about data exfiltration', diff: { before: '## Safety\nAsk before destructive ops.', after: '## Safety\nAsk before destructive ops.\nNever exfiltrate private data.' } },
  { id: '27', timestamp: '2026-02-15T10:30:00Z', agent: 'po', changeType: 'skill_removed', description: 'Removed twitter-post skill temporarily', diff: { before: 'skills: [tts, web_search, calendar_sync, twitter_post]', after: 'skills: [tts, web_search, calendar_sync]' } },
  { id: '28', timestamp: '2026-02-15T09:00:00Z', agent: 'dev', changeType: 'cron_modified', description: 'Added nightly build cron at 02:00 UTC', diff: { before: 'crons: [deploy_check]', after: 'crons:\n  - deploy_check\n  - schedule: "0 2 * * *"\n    task: nightly_build' } },
  { id: '29', timestamp: '2026-02-14T20:00:00Z', agent: 'qa', changeType: 'config_updated', description: 'Enabled verbose logging for test runs', diff: { before: 'log_level: info', after: 'log_level: verbose' } },
  { id: '30', timestamp: '2026-02-14T18:00:00Z', agent: 'ui', changeType: 'soul_edit', description: 'Added component naming conventions', diff: { before: '## Components\nUse PascalCase.', after: '## Components\nUse PascalCase.\nPrefix shared components with Grid-.\nDocument props with JSDoc.' } },
  { id: '31', timestamp: '2026-02-14T15:30:00Z', agent: 'main', changeType: 'config_updated', description: 'Reduced max tokens from 8192 to 4096', diff: { before: 'max_tokens: 8192', after: 'max_tokens: 4096' } },
  { id: '32', timestamp: '2026-02-14T12:00:00Z', agent: 'po', changeType: 'model_changed', description: 'Tested switching to claude-sonnet-4-20250514 for speed', diff: { before: 'model=anthropic/claude-opus-4-6', after: 'model=anthropic/claude-sonnet-4-20250514' } },
  { id: '33', timestamp: '2026-02-14T10:00:00Z', agent: 'dev', changeType: 'soul_edit', description: 'Added code review checklist to dev workflow', diff: { before: '## Workflow\n- Write code\n- Test', after: '## Workflow\n- Write code\n- Test\n- Self-review: types, edge cases, naming' } },
];

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const agent = url.searchParams.get('agent');
  const changeTypes = url.searchParams.get('changeTypes')?.split(',').filter(Boolean);
  const dateFrom = url.searchParams.get('dateFrom');
  const dateTo = url.searchParams.get('dateTo');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const limit = parseInt(url.searchParams.get('limit') || '20');

  let filtered = [...MOCK_DATA];

  if (agent) filtered = filtered.filter(e => e.agent === agent);
  if (changeTypes?.length) filtered = filtered.filter(e => changeTypes.includes(e.changeType));
  if (dateFrom) filtered = filtered.filter(e => e.timestamp >= new Date(dateFrom).toISOString());
  if (dateTo) {
    const to = new Date(dateTo);
    to.setDate(to.getDate() + 1);
    filtered = filtered.filter(e => e.timestamp < to.toISOString());
  }

  const total = filtered.length;
  const entries = filtered.slice(offset, offset + limit);

  // Stats
  const today = '2026-02-17';
  const todayEntries = MOCK_DATA.filter(e => e.timestamp.startsWith(today));
  const agentCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  MOCK_DATA.forEach(e => {
    agentCounts[e.agent] = (agentCounts[e.agent] || 0) + 1;
    typeCounts[e.changeType] = (typeCounts[e.changeType] || 0) + 1;
  });
  const mostActiveAgent = Object.entries(agentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  const mostCommonType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

  return NextResponse.json({
    entries,
    total,
    stats: {
      todayCount: todayEntries.length,
      mostActiveAgent,
      mostCommonType,
    },
  });
}
