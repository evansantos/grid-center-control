import { NextRequest, NextResponse } from 'next/server';
import { SettingsWorkflowCreateSchema, validateBody } from '@/lib/validators';

const templates = [
  { id: 'new-feature', name: 'New Feature', description: 'Full feature lifecycle from planning to deployment', steps: ['CEO', 'SPEC', 'DEV', 'QA', 'DEVOPS'] },
  { id: 'bug-fix', name: 'Bug Fix', description: 'Quick bug triage, fix, and verification', steps: ['QA', 'DEV', 'QA'] },
  { id: 'research', name: 'Research', description: 'Market research and feasibility analysis', steps: ['CEO', 'PO', 'DEV'] },
];

const active: { id: string; templateId: string; name: string; startedAt: string; currentStep: number }[] = [];

export async function GET() {
  return NextResponse.json({ templates, active });
}

export async function POST(req: NextRequest) {
  const raw = await req.json();
  const validated = validateBody(SettingsWorkflowCreateSchema, raw);
  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const { templateId, name } = validated.data;
  const tmpl = templates.find(t => t.id === templateId);
  if (!tmpl) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  const instance = { id: `w${Date.now()}`, templateId, name: name || tmpl.name, startedAt: new Date().toISOString(), currentStep: 0 };
  active.unshift(instance);
  return NextResponse.json(instance, { status: 201 });
}
