import { NextRequest, NextResponse } from 'next/server';
import { WorkflowCreateSchema, WorkflowStepUpdateSchema, validateBody } from '@/lib/validators';

/* ── Templates ── */
const TEMPLATES = [
  {
    id: 'new-feature',
    name: 'New Feature',
    icon: '🚀',
    description: 'Full feature pipeline: ideation through deployment',
    steps: [
      { name: 'CEO', description: 'Define vision & requirements' },
      { name: 'SPEC', description: 'Write technical specification' },
      { name: 'DEV', description: 'Implement the feature' },
      { name: 'BUG', description: 'Test & find issues' },
      { name: 'Deploy', description: 'Ship to production' },
    ],
  },
  {
    id: 'bug-fix',
    name: 'Bug Fix',
    icon: '🐛',
    description: 'Quick bug triage, fix, and verification',
    steps: [
      { name: 'BUG', description: 'Reproduce & document bug' },
      { name: 'DEV', description: 'Implement fix' },
      { name: 'QA', description: 'Verify the fix' },
      { name: 'Deploy', description: 'Ship the patch' },
    ],
  },
  {
    id: 'research',
    name: 'Research',
    icon: '🔬',
    description: 'Investigate a topic and produce a report',
    steps: [
      { name: 'CEO', description: 'Define research question' },
      { name: 'SPEC', description: 'Gather data & analyze' },
      { name: 'Report', description: 'Write findings report' },
    ],
  },
  {
    id: 'refactor',
    name: 'Refactor',
    icon: '♻️',
    description: 'Improve code quality with safety checks',
    steps: [
      { name: 'DEV', description: 'Refactor codebase' },
      { name: 'QA', description: 'Run test suite' },
      { name: 'Deploy', description: 'Ship improvements' },
    ],
  },
];

/* ── In-memory instances ── */
interface WorkflowStep { name: string; description: string; status: 'pending' | 'active' | 'completed' | 'failed' }
interface WorkflowInstance {
  id: string;
  templateId: string;
  templateName: string;
  steps: WorkflowStep[];
  currentStep: number;
  startedAt: string;
  status: 'running' | 'completed' | 'failed';
}

const instances: WorkflowInstance[] = [];
let counter = 0;

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type');
  if (type === 'instances') return NextResponse.json(instances);
  return NextResponse.json(TEMPLATES);
}

export async function POST(req: NextRequest) {
  const raw = await req.json();
  const validated = validateBody(WorkflowCreateSchema, raw);
  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { templateId } = validated.data;
  const t = TEMPLATES.find((t) => t.id === templateId);
  if (!t) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

  const inst: WorkflowInstance = {
    id: `wf-${++counter}-${Date.now()}`,
    templateId: t.id,
    templateName: t.name,
    steps: t.steps.map((s, i) => ({ ...s, status: i === 0 ? 'active' : 'pending' })),
    currentStep: 0,
    startedAt: new Date().toISOString(),
    status: 'running',
  };
  instances.unshift(inst);
  return NextResponse.json(inst, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const raw = await req.json();
  const validated = validateBody(WorkflowStepUpdateSchema, raw);
  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { instanceId, stepIndex, status } = validated.data;
  const inst = instances.find((i) => i.id === instanceId);
  if (!inst) return NextResponse.json({ error: 'Instance not found' }, { status: 404 });

  inst.steps[stepIndex].status = status;

  if (status === 'failed') {
    inst.status = 'failed';
  } else if (status === 'completed') {
    const next = stepIndex + 1;
    if (next < inst.steps.length) {
      inst.steps[next].status = 'active';
      inst.currentStep = next;
    } else {
      inst.status = 'completed';
      inst.currentStep = inst.steps.length;
    }
  }

  return NextResponse.json(inst);
}
