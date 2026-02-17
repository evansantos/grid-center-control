'use client';

import React, { useState, useEffect } from 'react';
import { AlertRule, Alert } from '@/lib/alerts';
import { useNotifications } from '@/components/notification-provider';

const SEVERITY_COLORS = {
  low: 'text-blue-600 bg-blue-50',
  medium: 'text-yellow-600 bg-yellow-50',
  high: 'text-orange-600 bg-orange-50',
  critical: 'text-red-600 bg-red-50'
};

const SEVERITY_ICONS = {
  low: '🔵',
  medium: '🟡',
  high: '🟠',
  critical: '🔴'
};

export default function AlertsClient() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchAlertConfig();
    fetchActiveAlerts();
  }, []);

  const fetchAlertConfig = async () => {
    try {
      const response = await fetch('/api/alerts?config=true');
      if (response.ok) {
        const data = await response.json();
        setRules(data);
      }
    } catch (error) {
      console.error('Error fetching alert config:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to fetch alert configuration',
        type: 'error'
      });
    }
  };

  const fetchActiveAlerts = async () => {
    try {
      const response = await fetch('/api/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to fetch active alerts',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRuleChange = (ruleId: string, field: keyof AlertRule, value: AlertRule[keyof AlertRule]) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, [field]: value }
        : rule
    ));
  };

  const handleSaveConfiguration = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules }),
      });

      if (response.ok) {
        addNotification({
          title: 'Success',
          message: 'Alert configuration saved successfully',
          type: 'success'
        });
        // Refresh alerts after saving config
        await fetchActiveAlerts();
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      addNotification({
        title: 'Error',
        message: 'Failed to save alert configuration',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePushAlert = (alert: Alert) => {
    addNotification({
      title: alert.rule.name,
      message: alert.message,
      type: alert.severity === 'critical' ? 'error' : 
            alert.severity === 'high' ? 'warning' : 'info'
    });
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return <div className="font-mono text-[var(--grid-text-dim)]">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Alert Rules Configuration */}
      <div className="bg-[var(--grid-surface)] border border-[var(--grid-border)] rounded">
        <div className="p-4 border-b border-[var(--grid-border)] flex justify-between items-center">
          <h2 className="font-mono font-bold text-[var(--grid-text)]">Alert Rules</h2>
          <button
            onClick={handleSaveConfiguration}
            disabled={saving}
            className="px-4 py-2 bg-[var(--grid-accent)] text-white font-mono text-sm rounded border hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
        
        <div className="divide-y divide-[var(--grid-border)]">
          {rules.map((rule) => (
            <div key={rule.id} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-mono font-semibold text-[var(--grid-text)]">
                      {rule.name}
                    </h3>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => handleRuleChange(rule.id, 'enabled', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-mono text-[var(--grid-text-dim)]">Enabled</span>
                    </label>
                  </div>
                  <p className="text-sm font-mono text-[var(--grid-text-dim)] mb-4">
                    {rule.description}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-mono text-[var(--grid-text)] mb-2">
                    Metric
                  </label>
                  <input
                    type="text"
                    value={rule.metric}
                    onChange={(e) => handleRuleChange(rule.id, 'metric', e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--grid-border)] rounded bg-[var(--grid-bg)] text-[var(--grid-text)] font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[var(--grid-accent)]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-mono text-[var(--grid-text)] mb-2">
                    Threshold {rule.comparator === 'increase' || rule.comparator === 'decrease' ? '(%)' : ''}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="500"
                      step="1"
                      value={rule.threshold}
                      onChange={(e) => handleRuleChange(rule.id, 'threshold', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      value={rule.threshold}
                      onChange={(e) => handleRuleChange(rule.id, 'threshold', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-[var(--grid-border)] rounded bg-[var(--grid-bg)] text-[var(--grid-text)] font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[var(--grid-accent)]"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-mono text-[var(--grid-text)] mb-2">
                    Window (minutes)
                  </label>
                  <select
                    value={rule.window}
                    onChange={(e) => handleRuleChange(rule.id, 'window', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-[var(--grid-border)] rounded bg-[var(--grid-bg)] text-[var(--grid-text)] font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[var(--grid-accent)]"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={360}>6 hours</option>
                    <option value={720}>12 hours</option>
                    <option value={1440}>24 hours</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-[var(--grid-surface)] border border-[var(--grid-border)] rounded">
        <div className="p-4 border-b border-[var(--grid-border)]">
          <div className="flex justify-between items-center">
            <h2 className="font-mono font-bold text-[var(--grid-text)]">
              Active Alerts ({alerts.length})
            </h2>
            <button
              onClick={fetchActiveAlerts}
              className="px-3 py-1 text-sm font-mono border border-[var(--grid-border)] text-[var(--grid-text)] hover:bg-[var(--grid-border)] rounded transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 text-center text-[var(--grid-text-dim)] font-mono">
            No active alerts
          </div>
        ) : (
          <div className="divide-y divide-[var(--grid-border)]">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{SEVERITY_ICONS[alert.severity]}</span>
                      <span className={`px-2 py-1 text-xs font-mono rounded ${SEVERITY_COLORS[alert.severity]}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <h3 className="font-mono font-semibold text-[var(--grid-text)]">
                        {alert.rule.name}
                      </h3>
                    </div>
                    
                    <p className="font-mono text-[var(--grid-text)] mb-2">
                      {alert.message}
                    </p>
                    
                    <div className="space-y-1 text-sm font-mono text-[var(--grid-text-dim)]">
                      <div>
                        <span className="text-[var(--grid-text)]">Current value:</span> {alert.metric_value.toFixed(2)}
                      </div>
                      <div>
                        <span className="text-[var(--grid-text)]">Baseline:</span> {alert.baseline_value.toFixed(2)}
                      </div>
                      <div>
                        <span className="text-[var(--grid-text)]">Time:</span> {formatDateTime(alert.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button
                      onClick={() => handlePushAlert(alert)}
                      className="px-3 py-1 text-sm font-mono bg-[var(--grid-accent)] text-white rounded hover:opacity-80 transition-opacity"
                    >
                      Push to Notifications
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['critical', 'high', 'medium', 'low'] as const).map((severity) => {
          const count = alerts.filter(a => a.severity === severity).length;
          return (
            <div key={severity} className="bg-[var(--grid-surface)] border border-[var(--grid-border)] rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{SEVERITY_ICONS[severity]}</span>
                <span className="font-mono text-sm text-[var(--grid-text-dim)] uppercase">
                  {severity}
                </span>
              </div>
              <div className="text-2xl font-mono font-bold text-[var(--grid-text)]">
                {count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}