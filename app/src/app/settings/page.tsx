'use client';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--grid-text)' }}>Settings</h1>

      <div className="rounded-lg p-6 border" style={{ background: 'var(--grid-surface)', borderColor: 'var(--grid-border)' }}>
        <p className="text-sm" style={{ color: 'var(--grid-text-dim)' }}>
          Settings page — more options coming soon.
        </p>
      </div>
    </div>
  );
}
