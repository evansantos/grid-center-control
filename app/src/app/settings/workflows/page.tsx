'use client';

import { useState } from 'react';

/* ─── types ─── */
interface WorkflowStep { agent: string; label: string; icon: string }
interface Template { id: string; name: string; description: string; steps: WorkflowStep[] }
interface ActiveWorkflow { id: string; templateId: string; name: string; startedAt: string; currentStep: number; totalSteps: number }

/* ─── sample data ─── */
const TEMPLATES: Template[] = [
  {
    id: 'new-feature', name: 'New Feature', description: 'Full feature lifecycle from planning to deployment',
    steps: [
      { agent: 'CEO', label: 'Define Vision', icon: '👔' },
      { agent: 'SPEC', label: 'Write Spec', icon: '📋' },
      { agent: 'DEV', label: 'Implement', icon: '💻' },
      { agent: 'QA', label: 'Test', icon: '🧪' },
      { agent: 'DEVOPS', label: 'Deploy', icon: '🚀' },
    ],
  },
  {
    id: 'bug-fix', name: 'Bug Fix', description: 'Quick bug triage, fix, and verification',
    steps: [
      { agent: 'QA', label: 'Reproduce & Report', icon: '🧪' },
      { agent: 'DEV', label: 'Fix', icon: '💻' },
      { agent: 'QA', label: 'Verify', icon: '✅' },
    ],
  },
  {
    id: 'research', name: 'Research', description: 'Market research and feasibility analysis',
    steps: [
      { agent: 'CEO', label: 'Define Scope', icon: '👔' },
      { agent: 'PO', label: 'Gather Requirements', icon: '📊' },
      { agent: 'DEV', label: 'Prototype', icon: '💻' },
    ],
  },
];

const INITIAL_ACTIVE: ActiveWorkflow[] = [
  { id: 'w1', templateId: 'new-feature', name: 'Auth Revamp', startedAt: '2026-02-16T10:30:00Z', currentStep: 3, totalSteps: 5 },
  { id: 'w2', templateId: 'bug-fix', name: 'Login Timeout #482', startedAt: '2026-02-17T09:00:00Z', currentStep: 1, totalSteps: 3 },
];

export default function WorkflowsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [activeWorkflows, setActiveWorkflows] = useState(INITIAL_ACTIVE);
  const [confirmStart, setConfirmStart] = useState<Template | null>(null);

  const startWorkflow = (t: Template) => {
    setActiveWorkflows(prev => [
      { id: `w${Date.now()}`, templateId: t.id, name: `${t.name} run`, startedAt: new Date().toISOString(), currentStep: 0, totalSteps: t.steps.length },
      ...prev,
    ]);
    setConfirmStart(null);
  };

  const templateFor = (id: string) => TEMPLATES.find(t => t.id === id);

  return (
    <div className="min-h-screen bg-[var(--grid-bg)] text-[var(--grid-text)]">
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold mb-2">Workflow Templates</h1>
          <p className="text-[var(--grid-text-dim)] font-mono">Multi-agent visual workflows — one-click start</p>
        </div>

        {/* Confirmation modal */}
        {confirmStart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="rounded-lg border border-[var(--grid-border)] bg-[var(--grid-surface)] p-6 max-w-sm w-full mx-4">
              <h3 className="font-mono font-bold text-lg mb-2">Start Workflow?</h3>
              <p className="text-sm text-[var(--grid-text-dim)] font-mono mb-4">
                This will start <strong>{confirmStart.name}</strong> with {confirmStart.steps.length} steps.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setConfirmStart(null)} className="px-4 py-2 rounded border border-[var(--grid-border)] font-mono text-sm hover:bg-[var(--grid-bg)]">Cancel</button>
                <button onClick={() => startWorkflow(confirmStart)} className="px-4 py-2 rounded bg-[var(--grid-accent)] text-white font-mono text-sm hover:opacity-90">Start</button>
              </div>
            </div>
          </div>
        )}

        {/* Template Library */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {TEMPLATES.map(t => (
            <div
              key={t.id}
              onClick={() => setSelectedTemplate(selectedTemplate?.id === t.id ? null : t)}
              className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                selectedTemplate?.id === t.id ? 'border-[var(--grid-accent)] bg-[var(--grid-surface)]' : 'border-[var(--grid-border)] bg-[var(--grid-surface)] hover:border-[var(--grid-accent)]'
              }`}
            >
              <h3 className="font-mono font-bold mb-1">{t.name}</h3>
              <p className="text-xs text-[var(--grid-text-dim)] font-mono mb-3">{t.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-1">
                  {t.steps.map((s, i) => (
                    <span key={i} title={s.agent} className="inline-block w-7 h-7 rounded-full bg-[var(--grid-bg)] border border-[var(--grid-border)] text-center leading-7 text-sm">{s.icon}</span>
                  ))}
                </div>
                <span className="text-xs text-[var(--grid-text-dim)] font-mono">{t.steps.length} steps</span>
              </div>
            </div>
          ))}
        </div>

        {/* Workflow Detail */}
        {selectedTemplate && (
          <div className="rounded-lg border border-[var(--grid-accent)] bg-[var(--grid-surface)] p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-mono font-bold">{selectedTemplate.name}</h2>
              <button
                onClick={() => setConfirmStart(selectedTemplate)}
                className="px-4 py-2 rounded bg-[var(--grid-accent)] text-white font-mono text-sm hover:opacity-90"
              >
                ▶ Start Workflow
              </button>
            </div>
            {/* Visual step list */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedTemplate.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="rounded border border-[var(--grid-border)] bg-[var(--grid-bg)] px-3 py-2 text-center">
                    <div className="text-xl mb-1">{step.icon}</div>
                    <div className="text-xs font-mono font-bold">{step.agent}</div>
                    <div className="text-[10px] text-[var(--grid-text-dim)] font-mono">{step.label}</div>
                  </div>
                  {i < selectedTemplate.steps.length - 1 && (
                    <span className="text-[var(--grid-text-dim)] font-mono text-lg">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Workflows */}
        <div className="rounded-lg border border-[var(--grid-border)] bg-[var(--grid-surface)] p-5">
          <h2 className="text-lg font-mono font-semibold mb-4">Active Workflows</h2>
          {activeWorkflows.length === 0 ? (
            <p className="text-sm text-[var(--grid-text-dim)] font-mono">No active workflows</p>
          ) : (
            <div className="space-y-3">
              {activeWorkflows.map(w => {
                const tmpl = templateFor(w.templateId);
                const pct = Math.round((w.currentStep / w.totalSteps) * 100);
                return (
                  <div key={w.id} className="rounded border border-[var(--grid-border)] bg-[var(--grid-bg)] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-mono font-bold text-sm">{w.name}</span>
                        <span className="text-xs text-[var(--grid-text-dim)] font-mono ml-2">({tmpl?.name})</span>
                      </div>
                      <span className="text-xs text-[var(--grid-text-dim)] font-mono">Step {w.currentStep}/{w.totalSteps}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--grid-border)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--grid-accent)] transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    {tmpl && (
                      <div className="flex gap-1 mt-2">
                        {tmpl.steps.map((s, i) => (
                          <span key={i} className={`text-sm ${i < w.currentStep ? 'opacity-100' : 'opacity-30'}`}>{s.icon}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
