# Grid Dashboard — VidClaw-Inspired Features Backlog

> Created: 2026-02-17 | Source: [VidClaw](https://github.com/madrzak/vidclaw) competitive analysis  
> Scope: Features VidClaw has that Grid doesn't — filtered for genuine value

---

## VID-01: Kanban Task Board (P1 — L)

**What:** Drag-and-drop kanban board with columns: Backlog → Todo → In Progress → Done. Tasks have priority levels, skill assignments, and agent assignment. Agent auto-picks tasks from the queue via heartbeat/cron.

**Why it matters:** Grid has project task lists but no visual kanban workflow. This is VidClaw's #1 feature and the most user-visible gap. Kanban gives users a tangible way to manage agent work without touching the CLI.

**VidClaw approach:** Express backend with JSON file storage. Tasks have `status`, `priority` (1-5), `skills` array, `assignedAgent`. API has `/api/tasks/queue` returning priority-sorted executable tasks. Agent picks up via `/api/tasks/:id/pickup`.

**Our approach:** Add as a new page `/kanban`. Use our existing project/task infrastructure but add drag-drop (dnd-kit or @hello-pangea/dnd). Store kanban state in project JSON. Key difference: we have multi-agent, so board should support per-agent swimlanes or filters. The auto-pickup mechanism should integrate with our existing cron/heartbeat system — agent reads HEARTBEAT.md which checks the board API.

---

## VID-02: Skills Manager Panel (P1 — M)

**What:** Browse all bundled and workspace skills, see their status (enabled/disabled), read SKILL.md content inline, toggle skills on/off, create new custom skills from the UI.

**Why it matters:** Skills are a core OpenClaw concept with no Grid visibility. Users currently manage skills via filesystem only. This closes that gap.

**VidClaw approach:** Reads `~/.openclaw/skills/` and workspace `skills/` dirs. Toggle writes to openclaw.json or agent config. Create skill scaffolds a new directory with SKILL.md template.

**Our approach:** New page `/skills`. API reads skill directories, parses SKILL.md frontmatter. Toggle updates agent config. Create form generates directory + SKILL.md + optional tool files. Show per-agent skill assignments since we're multi-agent. Monaco editor for SKILL.md editing.

---

## VID-03: Soul Editor with Version History (P1 — M)

**What:** Edit SOUL.md (and related identity files) with a rich editor, automatic version history on every save, one-click revert to any previous version, and starter persona templates.

**Why it matters:** Grid's backlog has CTL-05 (config editor) but it's P2 and doesn't mention version history or templates. VidClaw's version history + revert is a killer feature for iterating on agent personality safely. Templates lower the barrier for new users.

**VidClaw approach:** Every PUT to `/api/soul` saves a timestamped copy in `.soul-history/`. History endpoint returns list of versions. Revert copies historical version back. 6 starter templates (assistant, developer, researcher, creative, ops, minimal).

**Our approach:** Extend our existing agent config editor (CTL-05) with: (1) Git-based version history (we already have git, use it instead of file copies), (2) diff view between versions, (3) 4-6 persona templates as JSON/MD files. Covers SOUL.md, AGENTS.md, USER.md, TOOLS.md per agent. Promote from P2 to P1.

---

## VID-04: Activity Calendar View (P1 — S)

**What:** Monthly calendar showing agent activity per day — parsed from memory files (`memory/YYYY-MM-DD.md`) and task completion history. GitHub-contributions style but as actual calendar.

**Why it matters:** Grid has an analytics heatmap (ANA-03/heatmap route) but it's session-focused. A calendar parsed from memory files is more meaningful — shows what the agent *did* each day, not just token counts. Quick way to answer "what happened last Tuesday?"

**VidClaw approach:** `/api/calendar` reads `memory/` directory, extracts dates from filenames, counts entries. Returns `{ "2026-02-15": { entries: 12, tasks: 3 } }`. Frontend renders month grid with intensity colors.

**Our approach:** New component on the analytics page or standalone `/calendar` route. Parse memory files across all agents. Click a day → show that day's memory entries + completed tasks. Multi-agent color coding. This is small scope because the data source (memory files) already exists.

---

## VID-05: Workspace Content Browser (P1 — M)

**What:** File browser for the agent workspace with directory navigation, markdown preview, syntax highlighting, and file download.

**Why it matters:** Grid has no way to browse workspace files. Users SSH in or use the CLI. A content browser makes the dashboard self-sufficient for reviewing agent output — especially useful for checking generated code, docs, and artifacts.

**VidClaw approach:** `/api/files?path=` lists directory. `/api/files/content?path=` reads file. `/api/files/download?path=` serves file. Frontend has tree view + preview pane with highlight.js.

**Our approach:** New page `/files` or `/workspace`. API wraps fs operations with security constraints (no traversal above workspace root). Preview pane: Monaco editor (read-only) for code, rendered markdown for .md files, image preview for images. Tree view with lazy-loading for large directories. Consider integrating with our existing agent config editor for editable files.

---

## VID-06: Rate Limit Window Progress Bars (P2 — S)

**What:** Visual progress bars showing current usage against Anthropic's rate limit windows (requests/min, tokens/min, tokens/day). Real-time indication of how close you are to hitting limits.

**Why it matters:** Grid tracks token usage and costs but doesn't show rate limit proximity. Knowing you're at 80% of your minute window prevents surprise throttling and helps schedule heavy work.

**VidClaw approach:** Parses session transcripts for token counts, maps against known Anthropic rate limits per model tier. Shows percentage bars in the usage panel.

**Our approach:** Add to existing `/tokens` page or as a navbar widget. Read token data from our existing API, calculate against configurable rate limits (user sets their tier). Gauge/progress bar component. Could integrate with AUT-03 (auto-escalation) to warn when approaching limits.

---

## VID-07: Model Hot-Switch from Navbar (P2 — S)

**What:** Dropdown in the navbar to switch the active Claude model. Takes effect immediately via OpenClaw's config watcher.

**Why it matters:** Currently requires editing openclaw.json or using CLI. A one-click switch from any page is convenient for cost management (switch to cheaper model for routine tasks, expensive for complex ones).

**VidClaw approach:** Reads available models from openclaw.json. POST to `/api/model` writes the new default. OpenClaw's config file watcher picks up the change.

**Our approach:** Add model selector to the navbar (already have a navbar). API endpoint writes to openclaw.json `defaultModel` field. Show current model + cost indicator. Per-agent model override would be even better than VidClaw's global switch.

---

## VID-08: Task Auto-Pickup via Heartbeat Integration (P2 — M)

**What:** Agent automatically picks up highest-priority task from the kanban board during heartbeat cycles. "Run Now" button triggers immediate execution outside the heartbeat schedule.

**Why it matters:** Closes the loop between the kanban board (VID-01) and actual agent execution. Without this, the board is just a visual todo list. With it, it becomes a real task queue.

**VidClaw approach:** Setup script auto-appends to HEARTBEAT.md: "Check /api/tasks/queue, pick up top task if available." Agent's heartbeat reads this, calls the API, updates task status.

**Our approach:** Depends on VID-01. Add a HEARTBEAT.md snippet that agents can opt into. "Run Now" button calls our spawn API to create an immediate session with the task description. Track execution status back to the board. Per-agent opt-in since not all agents should auto-pick tasks.

---

## Summary

| ID | Title | Priority | Scope | Depends On |
|----|-------|----------|-------|------------|
| VID-01 | Kanban Task Board | P1 | L | — |
| VID-02 | Skills Manager Panel | P1 | M | — |
| VID-03 | Soul Editor + Version History | P1 | M | Extends CTL-05 |
| VID-04 | Activity Calendar View | P1 | S | — |
| VID-05 | Workspace Content Browser | P1 | M | — |
| VID-06 | Rate Limit Progress Bars | P2 | S | — |
| VID-07 | Model Hot-Switch (Navbar) | P2 | S | — |
| VID-08 | Task Auto-Pickup | P2 | M | VID-01 |

### What We Deliberately Skipped

- **VidClaw's Express backend** — We use Next.js API routes, no need to adopt their stack
- **JSON file storage for tasks** — We already have project infrastructure; extend that instead
- **SSH-only auth** — We already handle this differently
- **Single-agent assumption** — VidClaw is single-agent; every feature above is designed for our multi-agent context
