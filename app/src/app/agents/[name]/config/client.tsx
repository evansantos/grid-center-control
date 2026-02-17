'use client';

import { useState, useEffect, use } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type FileType = 'SOUL.md' | 'TOOLS.md' | 'HEARTBEAT.md';

interface AgentFiles {
  [key: string]: string;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export function AgentConfigClient({ 
  namePromise 
}: { 
  namePromise: Promise<{ name: string }> 
}) {
  const { name } = use(namePromise);
  
  const [files, setFiles] = useState<AgentFiles>({});
  const [activeTab, setActiveTab] = useState<FileType>('SOUL.md');
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const isDirty = content !== originalContent;

  // Load files on mount
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const response = await fetch(`/api/agents/${name}/config`);
        if (!response.ok) throw new Error('Failed to load files');
        
        const data = await response.json();
        setFiles(data.files);
        
        // Set initial content for first tab
        const initialContent = data.files['SOUL.md'] || '';
        setContent(initialContent);
        setOriginalContent(initialContent);
      } catch (error) {
        console.error('Error loading files:', error);
        showToast('error', 'Failed to load configuration files');
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [name]);

  // Update content when switching tabs
  useEffect(() => {
    if (!loading && files[activeTab] !== undefined) {
      const tabContent = files[activeTab] || '';
      setContent(tabContent);
      setOriginalContent(tabContent);
    }
  }, [activeTab, files, loading]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/agents/${name}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: activeTab, content }),
      });

      if (!response.ok) throw new Error('Failed to save file');

      // Update local state
      setFiles(prev => ({ ...prev, [activeTab]: content }));
      setOriginalContent(content);
      showToast('success', `${activeTab} saved successfully`);
    } catch (error) {
      console.error('Error saving file:', error);
      showToast('error', `Failed to save ${activeTab}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ background: 'var(--grid-border)' }} />
        <div className="h-96 bg-gray-200 rounded animate-pulse" style={{ background: 'var(--grid-border)' }} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-wide" style={{ color: 'var(--grid-text)' }}>
          Agent Configuration: {name}
        </h1>
        {isDirty && (
          <span className="text-sm px-2 py-1 rounded" style={{ 
            background: 'var(--grid-accent)20', 
            color: 'var(--grid-accent)' 
          }}>
            ● Unsaved changes
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: 'var(--grid-border)' }}>
        {(['SOUL.md', 'TOOLS.md', 'HEARTBEAT.md'] as FileType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab ? 'border-current' : 'border-transparent hover:opacity-80'
            }`}
            style={{ 
              color: activeTab === tab ? 'var(--grid-accent)' : 'var(--grid-text-dim)'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-sm px-3 py-1 rounded border hover:opacity-80"
          style={{ 
            border: '1px solid var(--grid-border)',
            background: showPreview ? 'var(--grid-accent)20' : 'var(--grid-surface)',
            color: 'var(--grid-text)'
          }}
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
        
        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="px-4 py-2 text-sm font-medium rounded disabled:opacity-50 hover:opacity-80 disabled:hover:opacity-50"
          style={{ 
            background: isDirty ? 'var(--grid-accent)' : 'var(--grid-border)',
            color: isDirty ? 'white' : 'var(--grid-text-dim)'
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Content */}
      <div 
        className="rounded border"
        style={{ 
          border: '1px solid var(--grid-border)',
          background: 'var(--grid-surface)'
        }}
      >
        {showPreview ? (
          <div className="p-6 prose max-w-none" style={{ color: 'var(--grid-text)' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || `# ${activeTab}\n\nThis file is empty.`}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 p-4 resize-none font-mono text-sm border-none outline-none"
            style={{
              background: 'transparent',
              color: 'var(--grid-text)',
            }}
            placeholder={`Enter content for ${activeTab}...`}
          />
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg text-white text-sm ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}