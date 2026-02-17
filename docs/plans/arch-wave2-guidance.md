# Grid Dashboard Wave 2 - Technical Architecture Guidance

**Document Version**: 1.0  
**Date**: 2025-01-17  
**Architect**: ARCH  
**Context**: Next.js 14 Grid Dashboard Wave 2 Implementation

---

## Executive Summary

After analyzing the current Grid Dashboard architecture, this document provides technical guidance for implementing Wave 2 features. The dashboard is built on Next.js 14 with a modular API architecture reading OpenClaw JSONL session files. Key architectural patterns include file-based session tracking, module-level caching, and real-time status determination via file modification times.

## Current Architecture Analysis

### API Layer (`/src/app/api/`)
- **Activity API** (`/activity/route.ts`): Core status engine with 30s cache TTL
- **Agent Control** (`/agents/[id]/control/route.ts`): CLI wrapper for pause/resume/kill
- **Analytics** (`/analytics/costs/route.ts`): Token usage estimation from session files
- **Status** (`/agents/status/route.ts`): Real-time agent activity detection

### Frontend Components (`/src/components/`)
- **Living Office** (`living-office.tsx`): Main visualization with pixel art agents
- **Activity Feed** (`activity-feed.tsx`): Message stream component
- **Conversation Panel** (`conversation-panel.tsx`): Agent interaction interface
- **Dashboard Stats** (`dashboard-stats.tsx`): Metrics display

### Data Flow
```
JSONL Session Files → File System Monitor → Cache Layer → API Routes → React Components
```

---

## BUG-01: Living Office Status Intermittency

### Root Cause Analysis
The 30s cache TTL in `/api/activity/route.ts` creates a fundamental disconnect between real-time agent activity and UI display. Status determination relies on file `mtime` age, but cache prevents fresh reads.

**Issue Chain:**
1. Agent becomes active → JSONL file updated → mtime refreshed
2. UI polls `/api/activity` → Hits cache (up to 30s old) → Shows stale status
3. User sees "idle" agent that's actually working

### Recommended Solutions

**Option A: Reduce Cache TTL (Quick Fix)**
```typescript
const CACHE_TTL = 5 * 1000; // 5 seconds instead of 30
```
- **Pros**: Simple, immediate improvement
- **Cons**: Higher disk I/O, still has staleness window

**Option B: Server-Sent Events (Recommended)**
```typescript
// /api/activity/stream/route.ts
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const watcher = fs.watch(sessionsPath, { recursive: true }, (event, filename) => {
        if (filename?.endsWith('.jsonl')) {
          const data = fetchActivity();
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        }
      });
      // Initial data
      controller.enqueue(`data: ${JSON.stringify(fetchActivity())}\n\n`);
    }
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
```

**Option C: Hybrid Cache + Invalidation**
- Keep cache for performance
- Add file system watchers to invalidate cache on JSONL changes
- Best of both worlds: performance + freshness

### Implementation Priority
1. **Immediate**: Reduce cache TTL to 5s
2. **Next Sprint**: Implement SSE endpoint
3. **Future**: Add cache invalidation system

---

## BUG-02: Main Agent Missing from Map

### Current Behavior
The activity API explicitly skips the main agent:
```typescript
if (agentId === 'main') continue; // skip main — we want subagents only
```

### Architectural Decision Required

**Option A: Include Main as Regular Agent**
- Add main to `AGENTS` array in `living-office.tsx`
- Remove skip logic in activity API
- **Pros**: Consistent UX, complete visibility
- **Cons**: May clutter interface with non-task activity

**Option B: Special Main Agent Representation**
- Create dedicated "Mission Control" zone in office layout
- Display main agent with distinct visual treatment
- Show orchestration activities vs task execution
- **Pros**: Clear hierarchy, preserves UX intent
- **Cons**: More complex implementation

**Option C: Toggle View**
- Add UI toggle: "Show Main Session" 
- Users can choose to include/exclude main agent
- **Pros**: User control, flexibility
- **Cons**: Additional UI complexity

### Recommendation: Option B (Special Representation)
Main agent serves orchestration role distinct from task agents. Suggest:
1. Add "Command Center" zone (top-center of office)
2. Visual distinction: larger avatar, command console
3. Show session count, active subagents spawned
4. Different status meanings (orchestrating vs executing)

---

## Error Dashboard (OBS-04) + Health Checks (AUT-05)

### Data Sources Analysis

**OpenClaw Error Sources:**
1. **Agent Session Errors**: Parse JSONL for error entries
2. **System Logs**: `~/.openclaw/logs/` directory
3. **API Failures**: HTTP error responses from control endpoints
4. **Resource Issues**: Memory, disk, network problems

### Proposed Architecture

**New API Routes:**
```typescript
// /api/health/route.ts - System health endpoint
GET /api/health -> {
  system: { memory: number, disk: number, network: boolean },
  agents: { [id]: { status: string, lastError?: string, errorCount: number } },
  services: { gateway: boolean, browser: boolean, nodes: number }
}

// /api/errors/route.ts - Error aggregation endpoint  
GET /api/errors?since=timestamp -> {
  errors: Array<{ 
    timestamp: string, 
    agent: string, 
    type: 'session' | 'system' | 'api',
    message: string,
    severity: 'low' | 'medium' | 'high' 
  }>
}
```

**Error Detection Logic:**
1. **Session Errors**: Parse JSONL for `{"type": "error"}` entries
2. **System Health**: Check disk space, memory usage, process status
3. **Agent Health**: Detect stuck sessions, excessive failures
4. **Network Health**: Ping external services, check node connectivity

**UI Components:**
- **Error Dashboard**: `/components/error-dashboard.tsx`
- **Health Status Bar**: Add to top navigation
- **Alert Notifications**: Toast system for critical errors

### Implementation Approach
1. Create health monitoring service
2. Implement error aggregation API
3. Build dashboard components
4. Add real-time error streaming

---

## Token Usage (OBS-05)

### Current Implementation Analysis
The `/api/analytics/costs/route.ts` currently estimates token usage from:
1. Session metadata files (preferred)
2. File size estimation (fallback)

### OpenClaw Token Data Sources

**Session Metadata Pattern:**
```json
// ~/.openclaw/agents/{agent}/sessions/{session}/metadata.json
{
  "tokenUsage": {
    "input": 1500,
    "output": 800,
    "model": "claude-3-sonnet"
  },
  "timestamp": "2025-01-17T15:30:00Z"
}
```

### Real-Time Counter Architecture

**Option A: Polling Approach**
```typescript
// Client-side hook
export function useTokenUsage() {
  const [usage, setUsage] = useState<TokenSummary>();
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const response = await fetch('/api/analytics/costs?period=daily');
      setUsage(await response.json());
    }, 30000); // Every 30s
    
    return () => clearInterval(interval);
  }, []);
  
  return usage;
}
```

**Option B: WebSocket Streaming (Recommended)**
```typescript
// /api/analytics/stream/route.ts
export async function GET() {
  return new Response(
    new ReadableStream({
      start(controller) {
        // Watch session directories for metadata changes
        const watcher = watchSessionMetadata((usage) => {
          controller.enqueue(`data: ${JSON.stringify(usage)}\n\n`);
        });
      }
    }),
    { headers: { 'Content-Type': 'text/event-stream' } }
  );
}
```

**Token Counter Component:**
```tsx
export function TokenCounter() {
  const usage = useTokenStream(); // SSE hook
  
  return (
    <div className="token-counter">
      <span>📊 {usage.totalTokens.toLocaleString()}</span>
      <span>${usage.estimatedCost.toFixed(2)}</span>
      <span className="trend">{usage.trend}%</span>
    </div>
  );
}
```

---

## Control Integration (CTL-03, CTL-06)

### OpenClaw Integration Analysis

**Current Control API:**
- `/api/agents/[id]/control/route.ts`: pause/resume/kill via CLI
- Uses `openclaw agent {action} {id}` shell commands

**Subagent Management API:**
OpenClaw provides these tools for the dashboard to leverage:
- `subagents` tool: list, kill, steer sub-agents
- Session management capabilities

### Proposed Architecture

**Enhanced Control APIs:**
```typescript
// /api/subagents/route.ts
GET /api/subagents -> { subagents: Array<SubagentInfo> }
POST /api/subagents -> { action: 'spawn', task: string, agent?: string }
DELETE /api/subagents/:id -> { success: boolean }

// /api/sessions/route.ts  
POST /api/sessions -> { agent: string, message: string }
GET /api/sessions/:id/messages -> { messages: Array<Message> }
```

**UI Component Architecture:**
```tsx
// /components/control-panel.tsx
export function ControlPanel({ agentId }: { agentId: string }) {
  const subagents = useSubagents();
  
  return (
    <div className="control-panel">
      <SubagentList subagents={subagents} />
      <SpawnControl onSpawn={handleSpawn} />
      <SessionManager agentId={agentId} />
    </div>
  );
}

// /components/subagent-card.tsx
export function SubagentCard({ subagent }: { subagent: SubagentInfo }) {
  return (
    <div className="subagent-card">
      <div className="header">
        <span className="status-dot" data-status={subagent.status} />
        <span className="label">{subagent.label}</span>
        <button onClick={() => steerSubagent(subagent.id)}>🎯 Steer</button>
        <button onClick={() => killSubagent(subagent.id)}>❌ Kill</button>
      </div>
      <div className="task-preview">{subagent.task}</div>
      <div className="metrics">
        <span>Messages: {subagent.messageCount}</span>
        <span>Duration: {formatDuration(subagent.duration)}</span>
      </div>
    </div>
  );
}
```

**Integration Points:**
1. **Living Office**: Add control buttons to agent cards
2. **Conversation Panel**: Integrate subagent spawning
3. **Command Palette**: Add keyboard shortcuts for controls
4. **Activity Feed**: Show subagent spawn/kill events

---

## Analytics Implementation (ANA-02, ANA-03)

### Performance Metrics Data Sources

**Session Performance:**
- Message processing times (from JSONL timestamps)
- Task completion rates
- Agent utilization patterns
- Error frequencies

**System Performance:**
- API response times
- File I/O latency  
- Memory usage trends
- Network connectivity

### Heatmap Component Architecture

```tsx
// /components/analytics/activity-heatmap.tsx
export function ActivityHeatmap({ timeRange }: { timeRange: string }) {
  const data = useActivityData(timeRange);
  
  const heatmapData = useMemo(() => {
    return generateHeatmapMatrix(data, {
      agents: AGENTS.map(a => a.id),
      timeSlots: generateTimeSlots(timeRange),
      metric: 'messageCount' // or 'utilization', 'errors'
    });
  }, [data, timeRange]);
  
  return (
    <div className="heatmap">
      <div className="heatmap-grid">
        {heatmapData.map((row, i) => 
          row.map((cell, j) => (
            <div 
              key={`${i}-${j}`}
              className="heatmap-cell"
              style={{ 
                backgroundColor: getCellColor(cell.value, cell.max),
                opacity: cell.value / cell.max 
              }}
              title={`${cell.agent} at ${cell.time}: ${cell.value}`}
            />
          ))
        )}
      </div>
      <HeatmapLegend />
    </div>
  );
}
```

**Analytics API Routes:**
```typescript
// /api/analytics/performance/route.ts
GET /api/analytics/performance?metric=utilization&period=24h -> {
  data: Array<{ agent: string, timestamp: string, value: number }>,
  summary: { avg: number, peak: number, trend: number }
}

// /api/analytics/heatmap/route.ts
GET /api/analytics/heatmap?agents=grid,arch&hours=24 -> {
  matrix: number[][],
  labels: { agents: string[], times: string[] },
  max: number
}
```

---

## Implementation Roadmap

### Phase 1: Bug Fixes (Sprint 1)
1. **BUG-01**: Reduce cache TTL to 5s
2. **BUG-02**: Add main agent as special representation
3. Update living office layout for main agent zone

### Phase 2: Error & Health System (Sprint 2)
1. Implement `/api/health` and `/api/errors` endpoints
2. Create error dashboard component
3. Add health status indicators to UI
4. Set up real-time error notifications

### Phase 3: Enhanced Metrics (Sprint 3)
1. Build token usage streaming system
2. Implement real-time token counter
3. Create analytics heatmap component
4. Add performance metrics APIs

### Phase 4: Control Integration (Sprint 4)
1. Enhance subagent management APIs
2. Build control panel components
3. Integrate with conversation panel
4. Add keyboard shortcuts and command palette

### Phase 5: Real-time Systems (Sprint 5)
1. Implement SSE for activity updates
2. Add WebSocket support for controls
3. Create comprehensive analytics dashboard
4. Performance optimization and testing

---

## Technical Considerations

### Performance
- Implement connection pooling for SSE
- Add request debouncing for high-frequency updates
- Consider Redis for caching if file-based becomes bottleneck
- Implement lazy loading for analytics components

### Security
- Validate all control commands before execution
- Implement rate limiting on control endpoints
- Sanitize file paths in session access
- Add CSRF protection for state-changing operations

### Scalability
- Design APIs to handle multiple concurrent agents
- Implement pagination for large datasets
- Consider database migration for complex analytics
- Plan for multi-tenant deployment scenarios

### Error Handling
- Implement graceful degradation for API failures
- Add retry logic with exponential backoff
- Create fallback UI states for missing data
- Comprehensive error logging and monitoring

---

## Conclusion

The Grid Dashboard Wave 2 implementation should focus on real-time data freshness, comprehensive observability, and seamless control integration. The current architecture provides a solid foundation, but requires strategic enhancements to support advanced monitoring and control capabilities.

Priority should be given to fixing the status intermittency issue and implementing the error dashboard, as these directly impact user experience and system reliability.

The proposed SSE-based architecture will provide the real-time capabilities needed for effective agent orchestration while maintaining the current file-based simplicity.

---

**Next Steps:**
1. Review and approve architectural decisions
2. Create detailed implementation tickets
3. Set up development environment for testing
4. Begin Phase 1 implementation

*End of Document*