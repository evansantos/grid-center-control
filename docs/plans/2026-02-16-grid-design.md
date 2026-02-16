# Grid — Dev Workflow Orchestrator

> MCP's development workflow engine with dashboard. TRON-themed. 🔴

**Goal:** Orchestrate spec-driven, multi-agent development with process gates, git worktrees, and a local web dashboard for visibility and approvals.

---

## Architecture

- **Engine** (`engine/`) — TypeScript CLI + library. Manages projects, state machine, git worktrees, SQLite DB. Invoked by MCP via `exec`.
- **Dashboard** (`app/`) — Next.js app (localhost). Dark TRON theme. Shows project state, artifacts, tasks, logs. Approve/reject from browser.
- **Telegram** — Inline buttons for quick approvals. Links to dashboard for details.
- **SQLite** (`grid.db`) — Single source of truth. Both engine and dashboard read/write.

## Project Structure

```
~/workspace/mcp-projects/grid/
├── app/                    # Next.js dashboard
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   └── lib/            # DB client, types, utils
│   ├── package.json
│   └── next.config.js
├── engine/                 # Core workflow engine (TS library)
│   ├── src/
│   │   ├── worktree.ts     # Git worktree management
│   │   ├── state.ts        # State machine (phases/transitions)
│   │   ├── db.ts           # SQLite operations
│   │   ├── cli.ts          # CLI entry point
│   │   └── types.ts        # Shared types
│   ├── package.json
│   └── tsconfig.json
├── grid.db                 # SQLite database
└── docs/
    └── plans/
```

## Database Schema

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  repo_path TEXT NOT NULL,
  phase TEXT NOT NULL,          -- brainstorm|design|plan|execute|review|done
  model_config TEXT,            -- JSON: {"brainstorm":"opus","execute":"sonnet",...} NULL = defaults
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE artifacts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  type TEXT NOT NULL,           -- design|plan
  content TEXT NOT NULL,
  file_path TEXT,
  status TEXT NOT NULL,         -- draft|pending_approval|approved|rejected
  feedback TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE worktrees (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  branch TEXT NOT NULL,
  path TEXT NOT NULL,
  status TEXT NOT NULL,         -- active|merged|discarded
  created_at TEXT NOT NULL
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  artifact_id TEXT REFERENCES artifacts(id),
  worktree_id TEXT REFERENCES worktrees(id),
  task_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,         -- pending|in_progress|review|approved|failed
  agent_session TEXT,
  spec_review TEXT,
  quality_review TEXT,
  started_at TEXT,
  completed_at TEXT
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL REFERENCES projects(id),
  event_type TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL
);
```

## State Machine

```
brainstorm → design → plan → execute → review → done
```

| Transition | Gate |
|---|---|
| brainstorm → design | ≥1 design artifact approved |
| design → plan | All design artifacts approved |
| plan → execute | Plan approved + worktree created |
| execute → review | All tasks approved (spec + quality) |
| review → done | Final review approved by Evan |

## Model Strategy (defaults)

| Phase | Model | Why |
|---|---|---|
| Brainstorm | Opus | Deep reasoning, creative |
| Design review | Opus | Architecture judgment |
| Writing plans | Opus | Precise task specs |
| Execute (subagent) | Sonnet | Well-defined tasks, fast + cheap |
| Spec review | Sonnet | Structured comparison |
| Quality review | Opus | Taste and judgment |
| Final review | Opus | Last gate |

Per-project overrides via `model_config` JSON column.

## Engine CLI

```bash
grid project create --name "X" --repo ~/path
grid project list
grid project phase <id>
grid project set-model <id> --phase execute --model sonnet

grid artifact create <id> --type design --file ./design.md
grid artifact approve <id> <artifact-id>
grid artifact reject <id> <artifact-id> --feedback "needs X"

grid worktree create <id> --branch feat/x
grid worktree list <id>
grid worktree cleanup <id>

grid task list <id>
grid task start <id> <n>
grid task update <id> <n> --status review
grid task review <id> <n> --type spec --result pass
grid task review <id> <n> --type quality --result fail --feedback "..."

grid log <id> --limit 20
grid advance <id>
```

JSON output. Exit codes: 0 success, 1 gate blocked, 2 error.

## Dashboard Pages

1. **Home `/`** — Project list with phase badges
2. **Project `/project/:id`** — Phase progress bar, artifact viewer, approve/reject, task list, subagent progress
3. **Task `/project/:id/task/:n`** — Full spec, session log, review results
4. **Log `/project/:id/log`** — Chronological events feed

Dark theme, TRON aesthetic. Polling every 2-3s on active pages.

## Telegram Integration

- Inline buttons for approve/reject on designs and plans
- Button callbacks formatted as `grid:<action>:<id>`
- Dashboard links in messages for detail viewing
- Notifications only for: approvals needed, subagent questions, completion, failures
