#!/usr/bin/env bash
set -euo pipefail
DB_PATH="${GRID_DB:-$HOME/workspace/mcp-projects/grid/grid.db}"
BACKUP_DIR="${GRID_BACKUP_DIR:-$HOME/workspace/mcp-projects/grid/backups}"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/grid_${TIMESTAMP}.db"

sqlite3 "$DB_PATH" ".backup '$BACKUP_FILE'"
echo "[backup] Created: $BACKUP_FILE"

# Cleanup old backups
find "$BACKUP_DIR" -name "grid_*.db" -mtime +$RETENTION_DAYS -delete
echo "[backup] Cleaned backups older than ${RETENTION_DAYS} days"
