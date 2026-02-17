#!/bin/bash
# Usage: ./log-activity.sh <project-id> <message>
# Quick way for agents to log activity to Grid
cd "$(dirname "$0")/engine"
npx tsx src/cli.ts log "$1" --message "$2" 2>/dev/null
