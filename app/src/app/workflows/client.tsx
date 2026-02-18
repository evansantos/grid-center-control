'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';

// ══════════════════════════════════════════════════════════════════════════════
// Types & Constants
// ══════════════════════════════════════════════════════════════════════════════

interface WorkflowNode {
  id: string;
  type: 'start' | 'task' | 'decision' | 'end' | 'agent' | 'data';
  title: string;
  description?: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'paused';
  agent?: string;
  position: { x: number; y: number };
  inputs: string[];  // node ids
  outputs: string[]; // node ids
  data?: Record<string, any>;
}

interface WorkflowConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
  condition?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  status: 'draft' | 'running' | 'completed' | 'failed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

const NODE_TYPE_CONFIGS = {
  start: { color: 'success', icon: '▶️', label: 'Start', shape: 'circle' },
  task: { color: 'info', icon: '⚙️', label: 'Task', shape: 'rect' },
  decision: { color: 'warning', icon: '❓', label: 'Decision', shape: 'diamond' },
  end: { color: 'error', icon: '⏹️', label: 'End', shape: 'circle' },
  agent: { color: 'default', icon: '🤖', label: 'Agent', shape: 'rect' },
  data: { color: 'info', icon: '📊', label: 'Data', shape: 'rect' },
} as const;

const STATUS_CONFIGS = {
  idle: { color: 'default', label: 'Idle' },
  running: { color: 'warning', label: 'Running' },
  completed: { color: 'success', label: 'Completed' },
  failed: { color: 'error', label: 'Failed' },
  paused: { color: 'default', label: 'Paused' },
} as const;

// ══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ══════════════════════════════════════════════════════════════════════════════

function getConnectionPath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const midX = from.x + dx / 2;
  
  // Create curved path for better visual flow
  return `M ${from.x} ${from.y} Q ${midX} ${from.y} ${midX} ${from.y + dy / 2} Q ${midX} ${to.y} ${to.x} ${to.y}`;
}

function isPointInRect(point: { x: number; y: number }, rect: { x: number; y: number; width: number; height: number }): boolean {
  return point.x >= rect.x && point.x <= rect.x + rect.width &&
         point.y >= rect.y && point.y <= rect.y + rect.height;
}

// ══════════════════════════════════════════════════════════════════════════════
// Workflow Canvas Component
// ══════════════════════════════════════════════════════════════════════════════

interface WorkflowCanvasProps {
  workflow: Workflow | null;
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeSelect: (nodeId: string | null) => void;
  selectedNodeId: string | null;
  scale: number;
  viewBox: { x: number; y: number; width: number; height: number };
}

function WorkflowCanvas({ workflow, onNodeMove, onNodeSelect, selectedNodeId, scale, viewBox }: WorkflowCanvasProps) {
  const [dragState, setDragState] = useState<{
    nodeId: string;
    startPos: { x: number; y: number };
    offset: { x: number; y: number };
  } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (!workflow) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = (e.clientX - rect.left) / scale + viewBox.x;
    const mouseY = (e.clientY - rect.top) / scale + viewBox.y;

    setDragState({
      nodeId,
      startPos: { x: mouseX, y: mouseY },
      offset: {
        x: mouseX - node.position.x,
        y: mouseY - node.position.y,
      },
    });

    onNodeSelect(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState || !workflow) return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = (e.clientX - rect.left) / scale + viewBox.x;
    const mouseY = (e.clientY - rect.top) / scale + viewBox.y;

    const newPosition = {
      x: mouseX - dragState.offset.x,
      y: mouseY - dragState.offset.y,
    };

    onNodeMove(dragState.nodeId, newPosition);
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (dragState) {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = (e.clientX - rect.left) / scale + viewBox.x;
        const mouseY = (e.clientY - rect.top) / scale + viewBox.y;

        const newPosition = {
          x: mouseX - dragState.offset.x,
          y: mouseY - dragState.offset.y,
        };

        onNodeMove(dragState.nodeId, newPosition);
      }
    };

    const handleGlobalMouseUp = () => {
      setDragState(null);
    };

    if (dragState) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [dragState, onNodeMove, scale, viewBox]);

  if (!workflow) {
    return (
      <div className="flex-1 bg-grid-surface rounded-lg flex items-center justify-center">
        <div className="text-grid-text-muted text-center">
          <div className="text-4xl mb-2">🔄</div>
          <div>Select a workflow to visualize</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-grid-surface rounded-lg overflow-hidden relative">
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            onNodeSelect(null);
          }
        }}
      >
        {/* Grid pattern */}
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="var(--grid-border)"
              strokeWidth="0.5"
              opacity="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Connections */}
        {workflow.connections.map(connection => {
          const fromNode = workflow.nodes.find(n => n.id === connection.from);
          const toNode = workflow.nodes.find(n => n.id === connection.to);
          
          if (!fromNode || !toNode) return null;
          
          const fromPos = { x: fromNode.position.x + 80, y: fromNode.position.y + 40 }; // Center of node
          const toPos = { x: toNode.position.x, y: toNode.position.y + 40 };
          
          return (
            <g key={connection.id}>
              <path
                d={getConnectionPath(fromPos, toPos)}
                fill="none"
                stroke="var(--grid-text-dim)"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                className="hover:stroke-grid-accent transition-colors"
              />
              {connection.label && (
                <text
                  x={fromPos.x + (toPos.x - fromPos.x) / 2}
                  y={fromPos.y + (toPos.y - fromPos.y) / 2 - 8}
                  textAnchor="middle"
                  className="text-xs fill-grid-text-muted"
                >
                  {connection.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Arrow marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="10"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="var(--grid-text-dim)"
            />
          </marker>
        </defs>

        {/* Nodes */}
        {workflow.nodes.map(node => {
          const config = NODE_TYPE_CONFIGS[node.type];
          const statusConfig = STATUS_CONFIGS[node.status];
          const isSelected = selectedNodeId === node.id;
          
          return (
            <g
              key={node.id}
              transform={`translate(${node.position.x}, ${node.position.y})`}
              className="cursor-pointer"
              onMouseDown={(e) => handleMouseDown(e, node.id)}
            >
              {/* Node background */}
              <rect
                width="160"
                height="80"
                rx="8"
                fill="var(--grid-surface)"
                stroke={isSelected ? 'var(--grid-accent)' : 'var(--grid-border)'}
                strokeWidth={isSelected ? "2" : "1"}
                className="transition-all hover:stroke-grid-accent"
              />
              
              {/* Status indicator */}
              <rect
                x="0"
                y="0"
                width="160"
                height="4"
                rx="4 4 0 0"
                fill={`var(--grid-${statusConfig.color === 'default' ? 'text-muted' : statusConfig.color})`}
              />

              {/* Node content */}
              <text
                x="8"
                y="20"
                className="text-xs font-medium fill-grid-text"
              >
                {config.icon} {node.title}
              </text>
              
              {node.description && (
                <text
                  x="8"
                  y="36"
                  className="text-xs fill-grid-text-muted"
                >
                  {node.description.length > 20 ? 
                    `${node.description.slice(0, 20)}...` : 
                    node.description
                  }
                </text>
              )}

              {node.agent && (
                <text
                  x="8"
                  y="52"
                  className="text-xs fill-grid-text-dim"
                >
                  Agent: {node.agent}
                </text>
              )}

              {/* Status badge */}
              <rect
                x="8"
                y="60"
                width="40"
                height="16"
                rx="8"
                fill={`var(--grid-${statusConfig.color === 'default' ? 'surface' : statusConfig.color})/10`}
                stroke={`var(--grid-${statusConfig.color === 'default' ? 'text-muted' : statusConfig.color})`}
                strokeWidth="1"
              />
              <text
                x="28"
                y="70"
                textAnchor="middle"
                className="text-xs"
                fill={`var(--grid-${statusConfig.color === 'default' ? 'text-muted' : statusConfig.color})`}
              >
                {statusConfig.label}
              </text>

              {/* Connection points */}
              {node.inputs.length > 0 && (
                <circle
                  cx="0"
                  cy="40"
                  r="4"
                  fill="var(--grid-surface)"
                  stroke="var(--grid-border)"
                  strokeWidth="2"
                />
              )}
              {node.outputs.length > 0 && (
                <circle
                  cx="160"
                  cy="40"
                  r="4"
                  fill="var(--grid-surface)"
                  stroke="var(--grid-border)"
                  strokeWidth="2"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Workflows Component
// ══════════════════════════════════════════════════════════════════════════════

export function WorkflowsClient() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  // ────────────────────────────────────────────────────────────────────────────
  // Data Fetching
  // ────────────────────────────────────────────────────────────────────────────

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/workflows');
      const data = await response.json();
      setWorkflows(data.workflows || []);
      
      // Auto-select first workflow if none selected
      if (data.workflows && data.workflows.length > 0 && !selectedWorkflow) {
        setSelectedWorkflow(data.workflows[0]);
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  }, [selectedWorkflow]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  // ────────────────────────────────────────────────────────────────────────────
  // Canvas Interaction
  // ────────────────────────────────────────────────────────────────────────────

  const handleNodeMove = useCallback((nodeId: string, position: { x: number; y: number }) => {
    if (!selectedWorkflow) return;

    const updatedWorkflow = {
      ...selectedWorkflow,
      nodes: selectedWorkflow.nodes.map(node =>
        node.id === nodeId ? { ...node, position } : node
      ),
    };

    setSelectedWorkflow(updatedWorkflow);
    setWorkflows(workflows.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w));
  }, [selectedWorkflow, workflows]);

  const handleZoom = useCallback((delta: number, centerX?: number, centerY?: number) => {
    const newScale = Math.max(0.1, Math.min(2, scale + delta * 0.1));
    
    if (centerX !== undefined && centerY !== undefined) {
      // Zoom towards mouse position
      const scaleRatio = newScale / scale;
      const newViewBox = {
        ...viewBox,
        x: centerX - (centerX - viewBox.x) * scaleRatio,
        y: centerY - (centerY - viewBox.y) * scaleRatio,
        width: viewBox.width * (scale / newScale),
        height: viewBox.height * (scale / newScale),
      };
      setViewBox(newViewBox);
    }
    
    setScale(newScale);
  }, [scale, viewBox]);

  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setViewBox(prev => ({
      ...prev,
      x: prev.x - deltaX / scale,
      y: prev.y - deltaY / scale,
    }));
  }, [scale]);

  const resetView = useCallback(() => {
    setScale(1);
    setViewBox({ x: 0, y: 0, width: 800, height: 600 });
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // Keyboard Shortcuts
  // ────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedWorkflow || !containerRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedNodeId) {
            // Delete node (in real implementation, this would update the workflow)
            console.log('Delete node:', selectedNodeId);
            setSelectedNodeId(null);
            e.preventDefault();
          }
          break;
        case 'd':
          if (e.metaKey || e.ctrlKey) {
            // Duplicate node
            if (selectedNodeId) {
              console.log('Duplicate node:', selectedNodeId);
              e.preventDefault();
            }
          }
          break;
        case '=':
        case '+':
          handleZoom(1);
          e.preventDefault();
          break;
        case '-':
          handleZoom(-1);
          e.preventDefault();
          break;
        case '0':
          if (e.metaKey || e.ctrlKey) {
            resetView();
            e.preventDefault();
          }
          break;
        case 'Escape':
          setSelectedNodeId(null);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedWorkflow, selectedNodeId, handleZoom, resetView]);

  // ────────────────────────────────────────────────────────────────────────────
  // Mouse Interactions
  // ────────────────────────────────────────────────────────────────────────────

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.metaKey || e.ctrlKey) {
      // Zoom
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = (e.clientX - rect.left) / scale + viewBox.x;
        const centerY = (e.clientY - rect.top) / scale + viewBox.y;
        handleZoom(-e.deltaY / 100, centerX, centerY);
      }
      e.preventDefault();
    } else {
      // Pan
      handlePan(e.deltaX, e.deltaY);
    }
  }, [handleZoom, handlePan, scale, viewBox]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.metaKey)) {
      // Middle click or Cmd+click for panning
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      handlePan(deltaX, deltaY);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, panStart, handlePan]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // Selected Node Details
  // ────────────────────────────────────────────────────────────────────────────

  const selectedNode = useMemo(() => {
    if (!selectedWorkflow || !selectedNodeId) return null;
    return selectedWorkflow.nodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedWorkflow, selectedNodeId]);

  // ────────────────────────────────────────────────────────────────────────────
  // Actions
  // ────────────────────────────────────────────────────────────────────────────

  const executeWorkflow = useCallback(async (workflowId: string) => {
    try {
      await fetch(`/api/workflows/${workflowId}/execute`, { method: 'POST' });
      // Refresh workflows to get updated status
      fetchWorkflows();
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  }, [fetchWorkflows]);

  const pauseWorkflow = useCallback(async (workflowId: string) => {
    try {
      await fetch(`/api/workflows/${workflowId}/pause`, { method: 'POST' });
      fetchWorkflows();
    } catch (error) {
      console.error('Failed to pause workflow:', error);
    }
  }, [fetchWorkflows]);

  // ────────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-grid-text-muted">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Workflows"
        description="Visual workflow designer with drag-and-drop nodes. Use Cmd/Ctrl + scroll to zoom, drag to pan."
        icon="🔄"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={resetView}>
              Reset View
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleZoom(1)}>
              Zoom In (+)
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleZoom(-1)}>
              Zoom Out (-)
            </Button>
            {selectedWorkflow && (
              <>
                {selectedWorkflow.status === 'running' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => pauseWorkflow(selectedWorkflow.id)}
                  >
                    ⏸️ Pause
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => executeWorkflow(selectedWorkflow.id)}
                  >
                    ▶️ Execute
                  </Button>
                )}
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-12 gap-4 h-[600px]">
        {/* Workflow List */}
        <div className="col-span-3 space-y-2 overflow-y-auto">
          <h3 className="font-semibold text-grid-text mb-3">Workflows</h3>
          {workflows.map(workflow => {
            const statusConfig = STATUS_CONFIGS[workflow.status];
            const isSelected = selectedWorkflow?.id === workflow.id;
            
            return (
              <Card
                key={workflow.id}
                className={cn(
                  'cursor-pointer transition-all',
                  isSelected && 'border-grid-accent'
                )}
                onClick={() => {
                  setSelectedWorkflow(workflow);
                  setSelectedNodeId(null);
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{workflow.name}</h4>
                      <p className="text-xs text-grid-text-muted mt-1">
                        {workflow.description}
                      </p>
                    </div>
                    <Badge size="sm" variant={statusConfig.color}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-grid-text-muted">
                    <span>{workflow.nodes.length} nodes</span>
                    <span>{workflow.connections.length} connections</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {workflows.length === 0 && (
            <div className="text-center text-grid-text-muted py-8">
              <div className="text-2xl mb-2">🔄</div>
              <div>No workflows found</div>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="col-span-6 relative"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          tabIndex={0}
          role="application"
          aria-label="Workflow canvas - Use Cmd+scroll to zoom, drag to pan, arrow keys to navigate"
        >
          <WorkflowCanvas
            workflow={selectedWorkflow}
            onNodeMove={handleNodeMove}
            onNodeSelect={setSelectedNodeId}
            selectedNodeId={selectedNodeId}
            scale={scale}
            viewBox={viewBox}
          />
          
          {/* Zoom indicator */}
          <div className="absolute bottom-4 left-4 bg-grid-surface border border-grid-border rounded px-2 py-1 text-xs text-grid-text-muted">
            {Math.round(scale * 100)}%
          </div>
        </div>

        {/* Node Details */}
        <div className="col-span-3 space-y-4">
          <h3 className="font-semibold text-grid-text">
            {selectedNode ? 'Node Details' : 'Inspector'}
          </h3>
          
          {selectedNode ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span>{NODE_TYPE_CONFIGS[selectedNode.type].icon}</span>
                  <h4 className="font-medium">{selectedNode.title}</h4>
                  <Badge size="sm" variant={NODE_TYPE_CONFIGS[selectedNode.type].color}>
                    {NODE_TYPE_CONFIGS[selectedNode.type].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedNode.description && (
                  <div>
                    <label className="text-xs font-medium text-grid-text-muted">Description</label>
                    <p className="text-sm">{selectedNode.description}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-medium text-grid-text-muted">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={STATUS_CONFIGS[selectedNode.status].color}>
                      {STATUS_CONFIGS[selectedNode.status].label}
                    </Badge>
                  </div>
                </div>
                
                {selectedNode.agent && (
                  <div>
                    <label className="text-xs font-medium text-grid-text-muted">Agent</label>
                    <p className="text-sm">{selectedNode.agent}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-medium text-grid-text-muted">Position</label>
                  <div className="text-sm text-grid-text-muted">
                    x: {Math.round(selectedNode.position.x)}, y: {Math.round(selectedNode.position.y)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-medium text-grid-text-muted">Inputs</label>
                    <div className="text-grid-text-dim">{selectedNode.inputs.length}</div>
                  </div>
                  <div>
                    <label className="font-medium text-grid-text-muted">Outputs</label>
                    <div className="text-grid-text-dim">{selectedNode.outputs.length}</div>
                  </div>
                </div>
                
                {selectedNode.data && Object.keys(selectedNode.data).length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-grid-text-muted">Data</label>
                    <div className="bg-grid-bg rounded p-2 text-xs font-mono">
                      <pre>{JSON.stringify(selectedNode.data, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : selectedWorkflow ? (
            <Card>
              <CardHeader>
                <h4 className="font-medium">Workflow Info</h4>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-grid-text-muted">Name</label>
                  <p className="text-sm">{selectedWorkflow.name}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-grid-text-muted">Description</label>
                  <p className="text-sm">{selectedWorkflow.description}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-grid-text-muted">Status</label>
                  <Badge variant={STATUS_CONFIGS[selectedWorkflow.status].color}>
                    {STATUS_CONFIGS[selectedWorkflow.status].label}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="font-medium text-grid-text-muted">Nodes</label>
                    <div className="text-grid-text-dim">{selectedWorkflow.nodes.length}</div>
                  </div>
                  <div>
                    <label className="font-medium text-grid-text-muted">Connections</label>
                    <div className="text-grid-text-dim">{selectedWorkflow.connections.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-grid-text-muted py-8">
              <div className="text-2xl mb-2">👆</div>
              <div>Select a workflow to inspect</div>
            </div>
          )}

          {/* Keyboard shortcuts help */}
          <Card variant="glass">
            <CardHeader>
              <h4 className="font-medium text-sm">Keyboard Shortcuts</h4>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs text-grid-text-muted">
                <div><kbd className="px-1 py-0.5 bg-grid-bg rounded text-xs">Del</kbd> Delete node</div>
                <div><kbd className="px-1 py-0.5 bg-grid-bg rounded text-xs">⌘D</kbd> Duplicate node</div>
                <div><kbd className="px-1 py-0.5 bg-grid-bg rounded text-xs">+/-</kbd> Zoom in/out</div>
                <div><kbd className="px-1 py-0.5 bg-grid-bg rounded text-xs">⌘0</kbd> Reset view</div>
                <div><kbd className="px-1 py-0.5 bg-grid-bg rounded text-xs">Esc</kbd> Deselect</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}