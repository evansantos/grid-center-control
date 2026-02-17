'use client';

import React, { useState, useEffect } from 'react';
import { CronJob, cronToHuman, nextRun } from '@/lib/cron-utils';
import { useNotifications } from '@/components/notification-provider';

interface CronFormData {
  name: string;
  schedule: string;
  command: string;
  enabled: boolean;
}

export default function CronClient() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<CronJob | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<CronFormData>({
    name: '',
    schedule: '',
    command: '',
    enabled: true,
  });
  const { addNotification } = useNotifications();

  const mockExecutionHistory = [
    { id: '1', jobName: 'Daily Backup', timestamp: '2024-01-15 09:00:00', status: 'success', duration: '2.3s' },
    { id: '2', jobName: 'System Check', timestamp: '2024-01-15 08:30:00', status: 'success', duration: '1.1s' },
    { id: '3', jobName: 'Log Cleanup', timestamp: '2024-01-15 08:00:00', status: 'error', duration: '0.8s' },
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/cron');
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching cron jobs:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to fetch cron jobs',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/cron';
      const method = editingJob ? 'PUT' : 'POST';
      const body = editingJob 
        ? { ...formData, id: editingJob.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchJobs();
        setShowModal(false);
        setEditingJob(null);
        setFormData({ name: '', schedule: '', command: '', enabled: true });
        addNotification({
          title: 'Success',
          message: `Cron job ${editingJob ? 'updated' : 'created'} successfully`,
          type: 'success'
        });
      } else {
        throw new Error('Failed to save cron job');
      }
    } catch (error) {
      addNotification({
        title: 'Error',
        message: 'Failed to save cron job',
        type: 'error'
      });
    }
  };

  const handleEdit = (job: CronJob) => {
    setEditingJob(job);
    setFormData({
      name: job.name,
      schedule: job.schedule,
      command: job.command,
      enabled: job.enabled,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/cron', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchJobs();
        setDeleteConfirm(null);
        addNotification({
          title: 'Success',
          message: 'Cron job deleted successfully',
          type: 'success'
        });
      }
    } catch (error) {
      addNotification({
        title: 'Error',
        message: 'Failed to delete cron job',
        type: 'error'
      });
    }
  };

  const handleToggle = async (job: CronJob) => {
    try {
      const response = await fetch('/api/cron', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...job, enabled: !job.enabled }),
      });

      if (response.ok) {
        await fetchJobs();
      }
    } catch (error) {
      addNotification({
        title: 'Error',
        message: 'Failed to toggle cron job',
        type: 'error'
      });
    }
  };

  const openCreateModal = () => {
    setEditingJob(null);
    setFormData({ name: '', schedule: '', command: '', enabled: true });
    setShowModal(true);
  };

  if (loading) {
    return <div className="font-mono text-[var(--grid-text-dim)]">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-mono font-bold text-[var(--grid-text)]">
            Scheduled Jobs ({jobs.length})
          </h2>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[var(--grid-accent)] text-white font-mono text-sm rounded border hover:opacity-80 transition-opacity"
        >
          + Create Job
        </button>
      </div>

      {/* Jobs List */}
      <div className="bg-[var(--grid-surface)] border border-[var(--grid-border)] rounded">
        {jobs.length === 0 ? (
          <div className="p-8 text-center text-[var(--grid-text-dim)] font-mono">
            No cron jobs configured
          </div>
        ) : (
          <div className="divide-y divide-[var(--grid-border)]">
            {jobs.map((job) => (
              <div key={job.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-mono font-semibold text-[var(--grid-text)]">
                        {job.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-mono rounded ${
                        job.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {job.enabled ? 'enabled' : 'disabled'}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm font-mono">
                      <div className="text-[var(--grid-text-dim)]">
                        <span className="text-[var(--grid-text)]">Schedule:</span> {cronToHuman(job.schedule)} ({job.schedule})
                      </div>
                      <div className="text-[var(--grid-text-dim)]">
                        <span className="text-[var(--grid-text)]">Next run:</span> {nextRun(job.schedule)}
                      </div>
                      <div className="text-[var(--grid-text-dim)]">
                        <span className="text-[var(--grid-text)]">Command:</span> {job.command}
                      </div>
                      {job.lastRun && (
                        <div className="text-[var(--grid-text-dim)]">
                          <span className="text-[var(--grid-text)]">Last run:</span> {job.lastRun}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleToggle(job)}
                      className={`px-3 py-1 text-xs font-mono rounded border transition-colors ${
                        job.enabled
                          ? 'border-gray-300 text-[var(--grid-text-dim)] hover:bg-gray-100'
                          : 'border-[var(--grid-accent)] text-[var(--grid-accent)] hover:bg-[var(--grid-accent)] hover:text-white'
                      }`}
                    >
                      {job.enabled ? 'disable' : 'enable'}
                    </button>
                    <button
                      onClick={() => handleEdit(job)}
                      className="px-3 py-1 text-xs font-mono border border-[var(--grid-border)] text-[var(--grid-text)] hover:bg-[var(--grid-border)] rounded transition-colors"
                    >
                      edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(job.id)}
                      className="px-3 py-1 text-xs font-mono border border-red-300 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Execution History */}
      <div className="bg-[var(--grid-surface)] border border-[var(--grid-border)] rounded">
        <div className="p-4 border-b border-[var(--grid-border)]">
          <h3 className="font-mono font-bold text-[var(--grid-text)]">Recent Executions</h3>
        </div>
        <div className="divide-y divide-[var(--grid-border)]">
          {mockExecutionHistory.map((exec) => (
            <div key={exec.id} className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="font-mono text-[var(--grid-text)]">{exec.jobName}</div>
                <div className="text-sm font-mono text-[var(--grid-text-dim)]">{exec.timestamp}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm font-mono text-[var(--grid-text-dim)]">{exec.duration}</div>
                <span className={`px-2 py-1 text-xs font-mono rounded ${
                  exec.status === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {exec.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--grid-surface)] border border-[var(--grid-border)] rounded p-6 w-full max-w-lg mx-4">
            <h3 className="font-mono font-bold text-[var(--grid-text)] mb-4">
              {editingJob ? 'Edit Cron Job' : 'Create Cron Job'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-[var(--grid-text)] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--grid-border)] rounded bg-[var(--grid-bg)] text-[var(--grid-text)] font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[var(--grid-accent)]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-mono text-[var(--grid-text)] mb-2">
                  Schedule (Cron Expression)
                </label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="0 9 * * *"
                  className="w-full px-3 py-2 border border-[var(--grid-border)] rounded bg-[var(--grid-bg)] text-[var(--grid-text)] font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[var(--grid-accent)]"
                  required
                />
                <div className="mt-1 text-xs font-mono text-[var(--grid-text-dim)]">
                  {formData.schedule && cronToHuman(formData.schedule)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-mono text-[var(--grid-text)] mb-2">
                  Command
                </label>
                <textarea
                  value={formData.command}
                  onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-[var(--grid-border)] rounded bg-[var(--grid-bg)] text-[var(--grid-text)] font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[var(--grid-accent)]"
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="enabled" className="text-sm font-mono text-[var(--grid-text)]">
                  Enabled
                </label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--grid-accent)] text-white font-mono text-sm rounded hover:opacity-80 transition-opacity"
                >
                  {editingJob ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[var(--grid-border)] text-[var(--grid-text)] font-mono text-sm rounded hover:bg-[var(--grid-border)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--grid-surface)] border border-[var(--grid-border)] rounded p-6 w-full max-w-sm mx-4">
            <h3 className="font-mono font-bold text-[var(--grid-text)] mb-4">
              Confirm Delete
            </h3>
            <p className="font-mono text-[var(--grid-text-dim)] mb-6">
              Are you sure you want to delete this cron job? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white font-mono text-sm rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-[var(--grid-border)] text-[var(--grid-text)] font-mono text-sm rounded hover:bg-[var(--grid-border)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}