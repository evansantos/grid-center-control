'use client';

import { useState, useEffect, useCallback } from 'react';

/* ── Types ── */
interface WorkflowStep {
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

interface WorkflowTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  steps: { name: string; description: string }[];
}

interface WorkflowInstance {
  id: string;
  templateId: string;
  templateName: string;
  steps: WorkflowStep[];
  currentStep: number;
  startedAt: string;
  status: 'running' | 'completed' | 'failed';
}

/* ── Status colors ── */
const STATUS_COLORS: Record<string, string> = {
  pending: 'var(--grid-text-dim)',
  active: '#ffaa00',
  completed: '#44ff44',
  failed: '#ff4444',
};

/* ── Step Badge ── */
function StepBadge({ step, index, isLast }: { step: WorkflowStep; index: number; isLast: boolean }) {
  const color = STATUS_COLORS[step.status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span
        style={{
          padding: '4px 10px',
          borderRadius: 4,
          border: `1px solid ${color}`,
          color,
          fontSize: 12,
          background: step.status === 'active' ? 'rgba(255,170,0,0.1)' : 'transparent',
        }}
      >
        {step.name}
      </span>
      {!isLast && <span style={{ color: 'var(--grid-text-dim)', margin: '0 2px' }}>→</span>}
    </span>
  );
}

export default function WorkflowsClient() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [tRes, iRes] = await Promise.all([
        fetch('/api/workflows?type=templates'),
        fetch('/api/workflows?type=instances'),
      ]);
      setTemplates(await tRes.json());
      setInstances(await iRes.json());
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const startWorkflow = async (t: WorkflowTemplate) => {
    await fetch('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: t.id }),
    });
    fetchData();
  };

  const advanceStep = async (instanceId: string, stepIndex: number, result: 'completed' | 'failed') => {
    await fetch('/api/workflows', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instanceId, stepIndex, status: result }),
    });
    fetchData();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p style={{ color: 'var(--grid-text-dim)' }}>Loading workflows…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-wide mb-2" style={{ color: 'var(--grid-text)' }}>
          Workflow Templates
        </h1>
        <p className="text-sm" style={{ color: 'var(--grid-text-dim)' }}>
          Multi-agent workflow templates — start with one click, track every step
        </p>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((t) => (
          <div
            key={t.id}
            onClick={() => setSelectedTemplate(selectedTemplate?.id === t.id ? null : t)}
            style={{
              background: 'var(--grid-surface)',
              border: `1px solid ${selectedTemplate?.id === t.id ? 'var(--grid-accent)' : 'var(--grid-border)'}`,
              borderRadius: 8,
              padding: 16,
              cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{t.icon}</span>
              <span className="font-bold" style={{ color: 'var(--grid-text)' }}>{t.name}</span>
              <span className="text-xs" style={{ color: 'var(--grid-text-dim)', marginLeft: 'auto' }}>
                {t.steps.length} steps
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--grid-text-dim)', marginBottom: 10 }}>
              {t.description}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              {t.steps.map((s, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  <span className="text-xs" style={{ color: 'var(--grid-text-dim)' }}>{s.name}</span>
                  {i < t.steps.length - 1 && (
                    <span className="text-xs" style={{ color: 'var(--grid-text-dim)' }}>→</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Template Detail */}
      {selectedTemplate && (
        <div
          style={{
            background: 'var(--grid-surface)',
            border: '1px solid var(--grid-border)',
            borderRadius: 8,
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--grid-text)' }}>
              {selectedTemplate.icon} {selectedTemplate.name}
            </h2>
            <button
              onClick={() => startWorkflow(selectedTemplate)}
              style={{
                background: 'var(--grid-accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 18px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              ▶ Start Workflow
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {selectedTemplate.steps.map((s, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    border: '1px solid var(--grid-border)',
                    borderRadius: 6,
                    padding: '8px 14px',
                  }}
                >
                  <div className="text-sm font-bold" style={{ color: 'var(--grid-text)' }}>{s.name}</div>
                  <div className="text-xs" style={{ color: 'var(--grid-text-dim)' }}>{s.description}</div>
                </div>
                {i < selectedTemplate.steps.length - 1 && (
                  <span style={{ color: 'var(--grid-text-dim)', fontSize: 18 }}>→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Workflows */}
      <div>
        <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--grid-text)' }}>
          Active Workflows
        </h2>
        {instances.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--grid-text-dim)' }}>
            No active workflows. Select a template and click Start.
          </p>
        ) : (
          <div className="space-y-4">
            {instances.map((inst) => {
              const completedCount = inst.steps.filter((s) => s.status === 'completed').length;
              return (
                <div
                  key={inst.id}
                  style={{
                    background: 'var(--grid-surface)',
                    border: '1px solid var(--grid-border)',
                    borderRadius: 8,
                    padding: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span className="font-bold text-sm" style={{ color: 'var(--grid-text)' }}>
                      {inst.templateName}
                    </span>
                    <span className="text-xs" style={{ color: STATUS_COLORS[inst.status === 'running' ? 'active' : inst.status] }}>
                      Step {Math.min(inst.currentStep + 1, inst.steps.length)} of {inst.steps.length}
                      {inst.status !== 'running' && ` — ${inst.status}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', marginBottom: 10 }}>
                    {inst.steps.map((s, i) => (
                      <StepBadge key={i} step={s} index={i} isLast={i === inst.steps.length - 1} />
                    ))}
                  </div>
                  {/* Progress bar */}
                  <div style={{ background: 'var(--grid-border)', borderRadius: 4, height: 4, marginBottom: 8 }}>
                    <div
                      style={{
                        background: inst.status === 'failed' ? '#ff4444' : '#44ff44',
                        width: `${(completedCount / inst.steps.length) * 100}%`,
                        height: '100%',
                        borderRadius: 4,
                        transition: 'width 0.3s',
                      }}
                    />
                  </div>
                  {inst.status === 'running' && inst.currentStep < inst.steps.length && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => advanceStep(inst.id, inst.currentStep, 'completed')}
                        className="text-xs"
                        style={{
                          background: 'transparent',
                          border: '1px solid #44ff44',
                          color: '#44ff44',
                          borderRadius: 4,
                          padding: '4px 12px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        ✓ Complete Step
                      </button>
                      <button
                        onClick={() => advanceStep(inst.id, inst.currentStep, 'failed')}
                        className="text-xs"
                        style={{
                          background: 'transparent',
                          border: '1px solid #ff4444',
                          color: '#ff4444',
                          borderRadius: 4,
                          padding: '4px 12px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        ✗ Fail Step
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
