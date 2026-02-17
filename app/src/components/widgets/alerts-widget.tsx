'use client';

import React, { useState, useEffect } from 'react';
import { Alert } from '@/lib/alerts';

const SEVERITY_ICONS = {
  low: '🔵',
  medium: '🟡',
  high: '🟠',
  critical: '🔴'
};

const SEVERITY_COLORS = {
  low: 'text-blue-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  critical: 'text-red-600'
};

export default function AlertsWidget() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const highAlerts = alerts.filter(a => a.severity === 'high');
  const hasCriticalAlerts = criticalAlerts.length > 0;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAlertsByPriority = () => {
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  };

  if (loading) {
    return (
      <div className="bg-[var(--grid-surface)] border border-[var(--grid-border)] rounded p-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
          <span className="font-mono text-sm text-[var(--grid-text-dim)]">Loading alerts...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-[var(--grid-surface)] border rounded p-4 transition-all ${
        hasCriticalAlerts 
          ? 'border-red-500 shadow-lg shadow-red-500/20' 
          : 'border-[var(--grid-border)]'
      }`}
    >
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {hasCriticalAlerts && (
              <span className="animate-pulse text-red-500">🔴</span>
            )}
            {!hasCriticalAlerts && alerts.length > 0 && (
              <span className="text-[var(--grid-accent)]">⚠️</span>
            )}
            {alerts.length === 0 && (
              <span className="text-green-500">✅</span>
            )}
          </div>
          <div>
            <h3 className="font-mono font-semibold text-[var(--grid-text)]">
              Alerts
            </h3>
            <p className="text-sm font-mono text-[var(--grid-text-dim)]">
              {alerts.length === 0 
                ? 'All clear'
                : `${alerts.length} active alert${alerts.length > 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Quick severity counts */}
          {criticalAlerts.length > 0 && (
            <span className="px-2 py-1 text-xs font-mono bg-red-100 text-red-800 rounded">
              {criticalAlerts.length} critical
            </span>
          )}
          {highAlerts.length > 0 && (
            <span className="px-2 py-1 text-xs font-mono bg-orange-100 text-orange-800 rounded">
              {highAlerts.length} high
            </span>
          )}
          
          <button className="text-[var(--grid-text-dim)] hover:text-[var(--grid-text)] transition-colors">
            <svg 
              className={`w-4 h-4 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-[var(--grid-border)]">
          {alerts.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-2xl mb-2">🎉</div>
              <p className="font-mono text-sm text-[var(--grid-text-dim)]">
                No alerts detected
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {getAlertsByPriority().map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 bg-[var(--grid-bg)] rounded border border-[var(--grid-border)]">
                  <span className="text-sm">{SEVERITY_ICONS[alert.severity]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-mono uppercase font-bold ${SEVERITY_COLORS[alert.severity]}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs font-mono text-[var(--grid-text-dim)]">
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                    <p className="font-mono text-sm text-[var(--grid-text)] leading-tight">
                      {alert.message}
                    </p>
                    <div className="mt-1 text-xs font-mono text-[var(--grid-text-dim)]">
                      Current: {alert.metric_value.toFixed(2)} | Baseline: {alert.baseline_value.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t border-[var(--grid-border)]">
            <a 
              href="/settings/alerts"
              className="text-sm font-mono text-[var(--grid-accent)] hover:underline"
            >
              Configure alerts →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}