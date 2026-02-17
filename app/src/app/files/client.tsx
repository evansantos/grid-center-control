'use client';

import { useState, useEffect, useCallback } from 'react';

interface FileEntry {
  name: string;
  type: 'file' | 'dir';
  size: number;
  mtime: string;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
  mtime: string;
  children?: TreeNode[];
  expanded?: boolean;
  loaded?: boolean;
}

const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.json', '.py', '.sh', '.bash',
  '.css', '.scss', '.html', '.xml', '.yaml', '.yml', '.toml',
  '.env', '.cfg', '.conf', '.ini', '.sql', '.graphql', '.rs',
  '.go', '.java', '.c', '.cpp', '.h', '.rb', '.php', '.swift',
]);

function isCodeFile(name: string): boolean {
  const dot = name.lastIndexOf('.');
  if (dot === -1) return false;
  return CODE_EXTENSIONS.has(name.substring(dot).toLowerCase());
}

function isMarkdown(name: string): boolean {
  return name.toLowerCase().endsWith('.md');
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // headings
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1.1em;font-weight:700;margin:1em 0 0.3em">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="font-size:1.25em;font-weight:700;margin:1em 0 0.3em">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="font-size:1.5em;font-weight:700;margin:1em 0 0.3em">$1</h1>')
    // code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:var(--grid-bg);padding:12px;border-radius:6px;overflow-x:auto;font-size:0.85em;border:1px solid var(--grid-border)"><code>$2</code></pre>')
    // inline code
    .replace(/`([^`]+)`/g, '<code style="background:var(--grid-bg);padding:2px 5px;border-radius:3px;font-size:0.9em">$1</code>')
    // bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--grid-accent)">$1</a>')
    // list items
    .replace(/^- (.+)$/gm, '<li style="margin-left:1.5em">$1</li>')
    // paragraphs (double newline)
    .replace(/\n\n/g, '</p><p style="margin:0.5em 0">');
  return `<div style="line-height:1.6"><p style="margin:0.5em 0">${html}</p></div>`;
}

function FileIcon({ type, name, expanded }: { type: string; name: string; expanded?: boolean }) {
  if (type === 'dir') return <span>{expanded ? '📂' : '📁'}</span>;
  if (isMarkdown(name)) return <span>📝</span>;
  if (isCodeFile(name)) return <span>📄</span>;
  if (name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) return <span>🖼️</span>;
  return <span>📄</span>;
}

function TreeItem({
  node,
  depth,
  onSelect,
  onToggle,
  selectedPath,
}: {
  node: TreeNode;
  depth: number;
  onSelect: (node: TreeNode) => void;
  onToggle: (node: TreeNode) => void;
  selectedPath: string;
}) {
  const isSelected = node.path === selectedPath;

  return (
    <>
      <button
        onClick={() => node.type === 'dir' ? onToggle(node) : onSelect(node)}
        className="w-full flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-colors text-left"
        style={{
          paddingLeft: `${depth * 16 + 8}px`,
          color: isSelected ? 'var(--grid-accent)' : 'var(--grid-text-dim)',
          background: isSelected ? 'var(--grid-surface-hover)' : 'transparent',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.background = 'var(--grid-surface-hover)';
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.background = 'transparent';
        }}
      >
        {node.type === 'dir' && (
          <span className="text-[10px] w-3 text-center" style={{ color: 'var(--grid-text-muted)' }}>
            {node.expanded ? '▾' : '▸'}
          </span>
        )}
        {node.type === 'file' && <span className="w-3" />}
        <FileIcon type={node.type} name={node.name} expanded={node.expanded} />
        <span className="truncate">{node.name}</span>
      </button>
      {node.type === 'dir' && node.expanded && node.children?.map((child) => (
        <TreeItem
          key={child.path}
          node={child}
          depth={depth + 1}
          onSelect={onSelect}
          onToggle={onToggle}
          selectedPath={selectedPath}
        />
      ))}
    </>
  );
}

export function ContentBrowser() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<TreeNode | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDir = useCallback(async (dirPath: string): Promise<TreeNode[]> => {
    const res = await fetch(`/api/files?path=${encodeURIComponent(dirPath)}`);
    if (!res.ok) throw new Error(`Failed to load directory: ${res.status}`);
    const entries: FileEntry[] = await res.json();
    return entries
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .map((e) => ({
        ...e,
        path: dirPath ? `${dirPath}/${e.name}` : e.name,
        expanded: false,
        loaded: false,
        children: e.type === 'dir' ? [] : undefined,
      }));
  }, []);

  useEffect(() => {
    fetchDir('').then(setTree).catch((e) => setError(e.message));
  }, [fetchDir]);

  const toggleDir = useCallback(async (node: TreeNode) => {
    const updateNodes = (nodes: TreeNode[]): TreeNode[] =>
      nodes.map((n) => {
        if (n.path === node.path) {
          if (!n.loaded) {
            fetchDir(n.path).then((children) => {
              setTree((prev) => {
                const patch = (ns: TreeNode[]): TreeNode[] =>
                  ns.map((x) =>
                    x.path === node.path
                      ? { ...x, children, expanded: true, loaded: true }
                      : x.children
                        ? { ...x, children: patch(x.children) }
                        : x
                  );
                return patch(prev);
              });
            });
            return { ...n, expanded: true };
          }
          return { ...n, expanded: !n.expanded };
        }
        if (n.children) return { ...n, children: updateNodes(n.children) };
        return n;
      });
    setTree((prev) => updateNodes(prev));
  }, [fetchDir]);

  const selectFile = useCallback(async (node: TreeNode) => {
    setSelectedFile(node);
    setContent(null);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(node.path)}&content=true`);
      if (res.status === 413) {
        setError('File too large to preview (>100KB)');
        return;
      }
      if (!res.ok) throw new Error(`Failed to load file: ${res.status}`);
      const text = await res.text();
      setContent(text);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex h-[calc(100vh-60px)]" style={{ background: 'var(--grid-bg)' }}>
      {/* Left panel: file tree */}
      <div
        className="w-72 min-w-[200px] border-r overflow-y-auto py-2"
        style={{ borderColor: 'var(--grid-border)', background: 'var(--grid-surface)' }}
      >
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--grid-text-muted)' }}>
          Workspace
        </div>
        {tree.length === 0 && !error && (
          <div className="px-3 py-2 text-xs" style={{ color: 'var(--grid-text-muted)' }}>Loading...</div>
        )}
        {tree.map((node) => (
          <TreeItem
            key={node.path}
            node={node}
            depth={0}
            onSelect={selectFile}
            onToggle={toggleDir}
            selectedPath={selectedFile?.path ?? ''}
          />
        ))}
      </div>

      {/* Right panel: content preview */}
      <div className="flex-1 overflow-y-auto">
        {!selectedFile && !error && (
          <div className="flex items-center justify-center h-full" style={{ color: 'var(--grid-text-muted)' }}>
            <div className="text-center space-y-2">
              <div className="text-4xl">📁</div>
              <div className="text-sm">Select a file to preview</div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6">
            <div className="p-4 rounded-lg text-sm" style={{ background: 'var(--grid-status-error-bg, rgba(255,0,0,0.1))', color: 'var(--grid-status-error, #f87171)' }}>
              {error}
            </div>
          </div>
        )}

        {selectedFile && (
          <div className="p-6">
            {/* File header */}
            <div className="mb-4 pb-3 border-b" style={{ borderColor: 'var(--grid-border)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--grid-text)' }}>
                {selectedFile.name}
              </h2>
              <div className="flex gap-4 mt-1 text-xs" style={{ color: 'var(--grid-text-muted)' }}>
                <span>{formatSize(selectedFile.size)}</span>
                <span>{new Date(selectedFile.mtime).toLocaleString()}</span>
                <span className="font-mono" style={{ color: 'var(--grid-text-dim)' }}>{selectedFile.path}</span>
              </div>
            </div>

            {/* Content */}
            {loading && (
              <div className="animate-pulse space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-4 rounded" style={{ background: 'var(--grid-border)', width: `${40 + Math.random() * 50}%` }} />
                ))}
              </div>
            )}

            {content !== null && !loading && (
              isMarkdown(selectedFile.name) ? (
                <div
                  className="prose-sm max-w-none"
                  style={{ color: 'var(--grid-text)' }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                />
              ) : (
                <pre
                  className="text-xs leading-relaxed overflow-x-auto p-4 rounded-lg"
                  style={{
                    background: 'var(--grid-bg)',
                    color: 'var(--grid-text)',
                    border: '1px solid var(--grid-border)',
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                  }}
                >
                  <code>{content}</code>
                </pre>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
