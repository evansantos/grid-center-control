#!/bin/bash

# Script to add accessibility checks to e2e test files that don't have them yet

FILES=(
    "/Users/evandrocavalcantesantos/workspace/mcp-projects/.worktrees/design-system-wave4/app/e2e/calendar.spec.ts"
    "/Users/evandrocavalcantesantos/workspace/mcp-projects/.worktrees/design-system-wave4/app/e2e/kanban.spec.ts" 
    "/Users/evandrocavalcantesantos/workspace/mcp-projects/.worktrees/design-system-wave4/app/e2e/office.spec.ts"
    "/Users/evandrocavalcantesantos/workspace/mcp-projects/.worktrees/design-system-wave4/app/e2e/reports.spec.ts"
    "/Users/evandrocavalcantesantos/workspace/mcp-projects/.worktrees/design-system-wave4/app/e2e/spawn.spec.ts"
    "/Users/evandrocavalcantesantos/workspace/mcp-projects/.worktrees/design-system-wave4/app/e2e/subagents.spec.ts"
    "/Users/evandrocavalcantesantos/workspace/mcp-projects/.worktrees/design-system-wave4/app/e2e/visual-regression.spec.ts"
    "/Users/evandrocavalcantesantos/workspace/mcp-projects/.worktrees/design-system-wave4/app/e2e/workflows.spec.ts"
)

for file in "${FILES[@]}"; do
    echo "Processing $file"
    
    # Check if file already has checkA11y import
    if ! grep -q "checkA11y" "$file"; then
        # Add the import after the existing imports
        sed -i '' '1s/.*/import { test, expect } from '\''@playwright\/test'\'';\
import { checkA11y, checkHeadingHierarchy } from '\''\.\/axe-helper'\'';/' "$file"
        
        echo "Added accessibility imports to $file"
    fi
done

echo "Accessibility imports added to all files."