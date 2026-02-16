# Grid Orchestration + Telegram Buttons — Design

**Goal:** Add Telegram inline buttons for approvals and subagent-driven task execution to Grid.

## Telegram Buttons
- Send designs/plans with inline buttons: [✅ Approve] [❌ Revise] [💬 View on Dashboard]
- Callbacks formatted as `grid:<action>:<id>` parsed by MCP
- Dashboard approve/reject works independently (both write to same DB)
- Checkpoint messages every 3 tasks with [▶️ Continue] [⏸ Pause]

## Subagent Orchestration
- Plan approved → create worktree → parse tasks → enter task loop
- Per task: spawn implementer → spec review subagent → quality review subagent
- Checkpoints every 3 tasks (Telegram buttons, wait for continue)
- Failure: max 3 review attempts, then stop and notify
- Models: implementer=sonnet, spec=sonnet, quality=opus (configurable per project)

## Architecture
- Orchestration lives in MCP behavior, not engine code
- Engine gets: task create/batch commands, plan parser, model lookup
- Subagents get: task description, worktree path, TDD rules, reviewer prompts

## Approved: 2026-02-16
