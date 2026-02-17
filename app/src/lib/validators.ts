import { z } from 'zod';

export const SpawnSchema = z.object({
  agentId: z.string().min(1).max(50),
  model: z.string().max(100).optional(),
  task: z.string().min(1).max(10000),
  timeoutSeconds: z.number().int().min(10).max(3600).optional(),
});

export const SteerSchema = z.object({
  sessionKey: z.string().min(1),
  message: z.string().min(1).max(10000),
});

export const AlertSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['threshold', 'anomaly', 'pattern']),
  condition: z.string().min(1),
  channels: z.array(z.string()).optional(),
  enabled: z.boolean().optional(),
});

export const BudgetSchema = z.object({
  agent: z.string().min(1).max(50),
  daily_limit: z.number().min(0).optional(),
  monthly_limit: z.number().min(0).optional(),
});

export const ProjectIdSchema = z.string().uuid();

// --- Route-specific schemas ---

export const AgentConfigSchema = z.object({
  file: z.string().min(1),
  content: z.string(),
});

export const AgentMessageSchema = z.object({
  message: z.string().min(1),
});

export const AgentActionSchema = z.object({
  action: z.string().min(1),
  params: z.record(z.string(), z.string()).optional(),
});

export const AgentControlSchema = z.object({
  action: z.enum(['pause', 'resume', 'kill']),
});

export const BulkActionSchema = z.object({
  agentIds: z.array(z.string()).min(1),
  action: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export const AlertRulesSchema = z.object({
  rules: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    metric: z.string().min(1),
    threshold: z.number(),
    comparator: z.enum(['gt', 'lt', 'eq', 'increase', 'decrease']).default('gt'),
    window: z.number().default(60),
    enabled: z.boolean().default(true),
    description: z.string().optional(),
  })),
});

export const CronJobCreateSchema = z.object({
  name: z.string().min(1),
  schedule: z.string().min(1),
  command: z.string().min(1),
  enabled: z.boolean().optional(),
});

export const CronJobUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  schedule: z.string().min(1).optional(),
  command: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
});

export const CronJobDeleteSchema = z.object({
  id: z.string().min(1),
});

export const ModelUpdateSchema = z.object({
  model: z.string().min(1).max(100).regex(/^[a-zA-Z0-9._\/-]+$/),
});

export const SoulUpdateSchema = z.object({
  agent: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/),
  file: z.string().min(1),
  content: z.string().optional(),
  revertHash: z.string().regex(/^[a-f0-9]{7,40}$/).optional(),
});

export const WorkflowCreateSchema = z.object({
  templateId: z.string().min(1),
  name: z.string().optional(),
});

export const WorkflowStepUpdateSchema = z.object({
  instanceId: z.string().min(1),
  stepIndex: z.number().int().min(0),
  status: z.enum(['pending', 'active', 'completed', 'failed']),
});

export const SettingsWorkflowCreateSchema = z.object({
  templateId: z.string().min(1),
  name: z.string().optional(),
});

export const SettingsBudgetCreateSchema = z.object({
  scope: z.enum(['global', 'agent']).optional(),
  agentName: z.string().optional(),
  period: z.enum(['daily', 'weekly']).optional(),
  amount: z.number().min(0).optional(),
  alertThreshold: z.number().min(0).max(100).optional(),
  autoPause: z.boolean().optional(),
});

export const SettingsBudgetUpdateSchema = z.object({
  id: z.string().min(1),
  scope: z.enum(['global', 'agent']).optional(),
  agentName: z.string().optional(),
  period: z.enum(['daily', 'weekly']).optional(),
  amount: z.number().min(0).optional(),
  alertThreshold: z.number().min(0).max(100).optional(),
  autoPause: z.boolean().optional(),
});

export const ArtifactActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  projectId: z.string().min(1),
  feedback: z.string().optional(),
});

export const SnapshotActionSchema = z.object({
  action: z.enum(['create-schedule', 'generate-now']),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  targetDashboard: z.string().optional(),
  notificationsEnabled: z.boolean().optional(),
  dashboard: z.string().optional(),
});

export const KanbanMoveSchema = z.object({
  taskId: z.string().min(1),
  status: z.enum(['pending', 'in_progress', 'review', 'done']),
});

export const ROICreateSchema = z.object({
  description: z.string().min(1),
  hoursSaved: z.number().min(0),
  hourlyRate: z.number().min(0).optional(),
  aiCost: z.number().min(0).optional(),
});

export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: result.error.issues.map((e: { path: PropertyKey[]; message: string }) => `${e.path.join('.')}: ${e.message}`).join('; ') };
}
