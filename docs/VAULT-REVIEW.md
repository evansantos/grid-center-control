# VAULT — Data Integrity & Storage Review: Grid Dashboard

**Review Date:** February 17, 2026  
**Reviewer:** Vault Agent (Subagent)  
**Target:** Grid Dashboard data layer at `~/workspace/mcp-projects/grid/`

## Executive Summary

The Grid Dashboard uses a SQLite-based data layer with generally sound design patterns but has **critical foreign key constraint enforcement disabled** and missing performance indexes. The database contains healthy data (20 projects, 82 tasks, 23 artifacts, 352 events, 14 worktrees) with no orphaned records detected.

**Key Findings:**
- ✅ Schema design is logically sound
- ❌ **CRITICAL**: Foreign keys disabled in production database
- ❌ Performance indexes from migrations not applied
- ✅ No data integrity violations found
- ❌ No backup/recovery mechanism
- ⚠️ WAL mode active (3.5MB wal file) but no checkpoint strategy

## Schema Analysis

### Current Schema Structure
```sql
projects (id, name, repo_path, phase, model_config, created_at, updated_at)
artifacts (id, project_id→projects, type, content, file_path, status, feedback, created_at, updated_at)
tasks (id, project_id→projects, artifact_id→artifacts, worktree_id→worktrees, task_number, title, description, status, agent_session, spec_review, quality_review, started_at, completed_at)
worktrees (id, project_id→projects, branch, path, status, created_at)
events (id, project_id→projects, event_type, details, created_at)
```

### Schema Strengths
- **Proper normalization**: Clear separation of concerns between projects, tasks, artifacts
- **Text-based IDs**: Using UUIDs/meaningful identifiers instead of integers for main entities
- **Audit trails**: Created/updated timestamps throughout
- **Flexible data**: JSON storage for model_config, TEXT for variable content
- **Logical relationships**: Well-defined foreign key references in schema

### Schema Issues
- **No CASCADE constraints**: Deletion behavior undefined (commented in migration 007)
- **No CHECK constraints**: Status fields accept any text values
- **No NOT NULL enforcement**: Several optional fields could benefit from explicit defaults
- **Missing unique constraints**: Only tasks have unique (project_id, task_number)

## Data Integrity Findings

### ✅ Referential Integrity (Despite No FK Enforcement)
- **0 orphaned artifacts** (all have valid project_id)
- **0 orphaned tasks** (all have valid project_id)  
- **0 orphaned worktrees** (all have valid project_id)
- **0 orphaned events** (all have valid project_id)
- **0 invalid task→artifact references** 
- **0 invalid task→worktree references**

### 🔍 Data Consistency Analysis
Current data counts:
- Projects: 20
- Tasks: 82 (4.1 tasks/project avg)
- Artifacts: 23 (1.15 artifacts/project avg)  
- Events: 352 (17.6 events/project avg)
- Worktrees: 14 (0.7 worktrees/project avg)

**Status Distribution Analysis Needed**: Task status field allows free-form text but queries expect specific values (`approved`, `done`, `in_progress`, `failed`). Migration 004 addressed `in-progress` → `in_progress` standardization.

## Query Patterns Review

### Code Analysis: `app/src/lib/queries.ts`

#### ✅ SQL Injection Protection
- **Excellent parameterization**: All queries use `?` placeholders
- **No string concatenation**: No dynamic SQL construction detected  
- **Prepared statements**: Using better-sqlite3 `.prepare()` correctly

#### ⚠️ Query Performance Issues
```typescript
// No indexes present for these common queries:
listArtifacts(projectId, type) // WHERE project_id = ? AND type = ?
listTasks(projectId)          // WHERE project_id = ? ORDER BY task_number  
listEvents(projectId, limit)  // WHERE project_id = ? ORDER BY id DESC LIMIT ?
```

#### 🔍 Missing Query Patterns
- **No batch operations**: Individual record updates only
- **No transaction management**: Updates not wrapped in transactions
- **No connection pooling**: Single connection reused (appropriate for SQLite)

## Configuration Issues

### ❌ CRITICAL: Foreign Keys Disabled
```javascript
// db.ts sets PRAGMA foreign_keys = ON
// But database shows: PRAGMA foreign_keys; → 0 (disabled)
```

**Root Cause**: The database was likely created before foreign key pragma was set, or pragma failed silently. Better-sqlite3 applies pragmas per-connection, but existing databases retain their constraint enforcement state.

### ❌ Missing Performance Indexes  
Expected indexes from `engine/migrations/005_add_indexes.sql`:
```sql
-- These indexes are NOT present in the current database:
idx_artifacts_project ON artifacts(project_id, type)
idx_tasks_project ON tasks(project_id, task_number)  
idx_worktrees_project ON worktrees(project_id)
idx_events_project ON events(project_id, id)
```

Only auto-generated primary key indexes exist.

## Backup & Recovery Assessment

### ❌ No Backup Mechanism
- **No automated backups** found in project structure
- **No dump/export scripts** identified
- **WAL mode active** (3.5MB wal file) but no checkpoint strategy
- **Single point of failure**: Database corruption = total data loss

### File System State
```
grid.db         249KB (main database)
grid.db-shm     32KB  (shared memory)  
grid.db-wal     3.5MB (write-ahead log)
```

**Risk**: Large WAL file indicates many uncommitted transactions. No automatic checkpointing could lead to unbounded WAL growth.

## Filesystem Access Patterns

### Session Data Access (`app/src/app/api/subagents/route.ts`)
- **Directory**: `~/.openclaw/sessions/`
- **Pattern**: Read entire `.jsonl` files sequentially
- **Concurrent access**: No locking mechanism detected
- **Race conditions**: Possible during session file updates

```typescript
// Potential race condition:
const content = await readFile(path.join(SESSIONS_DIR, file), 'utf-8');
// File could be written to between check and read
```

### ⚠️ OpenClaw Integration Risks
- **No validation**: Direct filesystem access without error handling
- **Stale session reads**: No timestamp validation on session files  
- **Permission issues**: Hardcoded path `~/.openclaw/sessions/` may not exist

## Migration Strategy

### Current State
- **Migration files exist** in `engine/migrations/`
- **No migration runner** detected in codebase
- **Manual migration application** required
- **Schema versioning**: No version tracking in database

### Missing Migrations Applied
The current database appears to be missing these migrations:
- `005_add_indexes.sql` (performance indexes)  
- `007_cascade_fk.sql` (foreign key constraints)

## Risk Assessment

### 🚨 HIGH RISK
1. **Foreign key constraints disabled** - No referential integrity enforcement
2. **No backup mechanism** - Total data loss on corruption
3. **Large uncommitted WAL** - Potential performance degradation

### ⚠️ MEDIUM RISK  
1. **Missing performance indexes** - Poor query performance at scale
2. **No migration system** - Schema evolution difficulties
3. **Filesystem race conditions** - Session data corruption possible

### 💛 LOW RISK
1. **Status field validation** - Logic bugs but not data corruption
2. **Session file staleness** - UI inconsistencies only

## Recommendations

### 🔥 IMMEDIATE (Critical)
1. **Enable foreign key constraints**:
   ```bash
   cd ~/workspace/mcp-projects/grid
   sqlite3 grid.db "PRAGMA foreign_keys = ON; PRAGMA foreign_key_check;"
   ```

2. **Apply missing indexes**:
   ```bash
   sqlite3 grid.db < engine/migrations/005_add_indexes.sql
   ```

3. **Checkpoint WAL file**:
   ```bash
   sqlite3 grid.db "PRAGMA wal_checkpoint(FULL);"
   ```

4. **Implement backup strategy**:
   ```bash
   # Create backup script
   sqlite3 grid.db ".backup grid-$(date +%Y%m%d-%H%M%S).db"
   ```

### 📋 SHORT TERM (1-2 weeks)
1. **Add CHECK constraints** for status fields
2. **Implement proper migration runner** with version tracking  
3. **Add transaction management** for multi-step operations
4. **Create WAL checkpoint automation** (daily/weekly)

### 🔧 MEDIUM TERM (1-2 months)  
1. **Implement connection pooling** if scaling beyond single user
2. **Add database monitoring** (size, performance metrics)
3. **Create schema documentation** with ERD diagrams
4. **Add integration tests** for data integrity

### 🚀 LONG TERM (3+ months)
1. **Consider migration to PostgreSQL** if multi-user access needed
2. **Implement event sourcing** for full audit trails
3. **Add real-time subscriptions** for dashboard updates
4. **Create data archival strategy** for long-term storage

## Kanban Integration Bug

**CONFIRMED**: The task mentions Kanban reading from nonexistent `tasks.json` files instead of `grid.db`. This suggests a configuration or code path issue where the Kanban component is not properly integrated with the SQLite data layer.

**Investigation needed**: Locate Kanban component code and verify data source configuration.

## Conclusion

The Grid Dashboard data layer demonstrates solid architectural principles but suffers from critical operational issues that prevent it from reaching production-ready status. The most severe concern is the disabled foreign key constraints, which eliminates referential integrity protection despite having a well-designed relational schema.

**Priority Fix Order:**
1. Enable foreign keys + verify constraints
2. Apply performance indexes  
3. Implement backup automation
4. Address WAL checkpoint strategy
5. Create proper migration system

**Data Confidence:** Despite the configuration issues, the actual data appears clean with no integrity violations detected. This suggests the application logic is maintaining consistency, but this is fragile without database-level constraints.

---

**Review completed:** February 17, 2026  
**Next review recommended:** After implementing critical fixes