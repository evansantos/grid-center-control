#!/bin/bash
# close-project.sh — Close all tasks in a Grid CLI project and advance to done
# Usage: ./scripts/close-project.sh <projectId> [feedback]
#
# Fixes the depth-2 orphan problem: SPEC spawns workers but session expires
# before closing tasks. MCP runs this after BUG approves.

set -e

PROJECT_ID="$1"
FEEDBACK="${2:-Delivered and BUG approved}"
ENGINE_DIR="$(dirname "$0")/../engine"

if [ -z "$PROJECT_ID" ]; then
  echo "Usage: $0 <projectId> [feedback]"
  echo ""
  echo "Projects:"
  cd "$ENGINE_DIR" && npx tsx src/cli.ts project list 2>/dev/null | grep -E '"id"|"name"|"phase"' | paste - - - | sed 's/[",]//g'
  exit 1
fi

cd "$ENGINE_DIR"

# Get current phase
PHASE=$(npx tsx src/cli.ts project list 2>/dev/null | python3 -c "
import json, sys
projects = json.load(sys.stdin)
for p in projects:
    if p['id'] == '$PROJECT_ID':
        print(p['phase'])
        break
")

echo "Project phase: $PHASE"

if [ "$PHASE" = "done" ]; then
  echo "Already done!"
  exit 0
fi

# Get all task numbers
TASKS=$(npx tsx src/cli.ts task list "$PROJECT_ID" 2>/dev/null | python3 -c "
import json, sys
tasks = json.load(sys.stdin)
for t in tasks:
    print(t['task_number'])
")

if [ -z "$TASKS" ]; then
  echo "No tasks found. Advancing phases directly..."
else
  echo "Closing tasks: $TASKS"
  for TASK_NUM in $TASKS; do
    echo "  Task $TASK_NUM: marking done + reviews..."
    npx tsx src/cli.ts task update "$PROJECT_ID" "$TASK_NUM" --status done 2>/dev/null || true
    npx tsx src/cli.ts task review "$PROJECT_ID" "$TASK_NUM" --type spec --result pass --feedback "$FEEDBACK" 2>/dev/null || true
    npx tsx src/cli.ts task review "$PROJECT_ID" "$TASK_NUM" --type quality --result pass --feedback "$FEEDBACK" 2>/dev/null || true
  done
fi

# Advance through remaining phases to done
echo "Advancing to done..."
for i in 1 2 3 4 5; do
  RESULT=$(npx tsx src/cli.ts advance "$PROJECT_ID" 2>&1) || true
  echo "  $RESULT" | grep -E 'success|from|to|reason' || true
  echo "$RESULT" | grep -q '"to":"done"' && break
done

# Verify
FINAL=$(npx tsx src/cli.ts project list 2>/dev/null | python3 -c "
import json, sys
projects = json.load(sys.stdin)
for p in projects:
    if p['id'] == '$PROJECT_ID':
        print(p['phase'])
        break
")
echo "Final phase: $FINAL"
