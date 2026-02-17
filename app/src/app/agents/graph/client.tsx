'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Node {
  id: string;
  group: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number; // fixed position when dragging
  fy?: number;
}

interface Edge {
  source: string;
  target: string;
}

interface GraphData {
  nodes: Array<{ id: string; group: string }>;
  edges: Edge[];
}

const GROUP_COLORS = {
  engineering: '#3b82f6',
  operations: '#f59e0b', 
  management: '#a855f7'
};

export default function AgentsGraphClient() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [viewBox, setViewBox] = useState({ x: -400, y: -300, width: 800, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<Node | null>(null);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const animationId = useRef<number>(0);

  // Fetch graph data
  useEffect(() => {
    fetch('/api/agents/graph')
      .then(res => res.json())
      .then(data => {
        setGraphData(data);
        
        // Initialize nodes with random positions
        const initialNodes = data.nodes.map((node: any) => ({
          ...node,
          x: (Math.random() - 0.5) * 400,
          y: (Math.random() - 0.5) * 300,
          vx: 0,
          vy: 0
        }));
        setNodes(initialNodes);
      })
      .catch(console.error);
  }, []);

  // Force simulation
  const applyForces = useCallback((currentNodes: Node[], edges: Edge[]) => {
    const alpha = 0.1;
    const repulsionStrength = 1000;
    const attractionStrength = 0.01;
    const centerStrength = 0.005;
    const damping = 0.9;

    currentNodes.forEach((node, i) => {
      if (node.fx !== undefined) {
        node.x = node.fx;
        node.y = node.fy!;
        return;
      }

      let fx = 0, fy = 0;

      // Repulsion between all nodes
      currentNodes.forEach((other, j) => {
        if (i === j) return;
        const dx = node.x - other.x;
        const dy = node.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsionStrength / (distance * distance);
        fx += (dx / distance) * force;
        fy += (dy / distance) * force;
      });

      // Attraction along edges
      edges.forEach(edge => {
        let other: Node | undefined;
        if (edge.source === node.id) {
          other = currentNodes.find(n => n.id === edge.target);
        } else if (edge.target === node.id) {
          other = currentNodes.find(n => n.id === edge.source);
        }
        
        if (other) {
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          fx += dx * attractionStrength;
          fy += dy * attractionStrength;
        }
      });

      // Center gravity
      fx += -node.x * centerStrength;
      fy += -node.y * centerStrength;

      // Update velocity and position
      node.vx = (node.vx + fx * alpha) * damping;
      node.vy = (node.vy + fy * alpha) * damping;
      node.x += node.vx;
      node.y += node.vy;
    });

    return [...currentNodes];
  }, []);

  // Animation loop
  useEffect(() => {
    if (!graphData) return;

    const animate = () => {
      setNodes(currentNodes => applyForces(currentNodes, graphData.edges));
      animationId.current = requestAnimationFrame(animate);
    };

    animationId.current = requestAnimationFrame(animate);

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [graphData, applyForces]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent, node: Node) => {
    e.preventDefault();
    setIsDragging(true);
    setDragNode(node);
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const scale = viewBox.width / rect.width;
      const mouseX = viewBox.x + (e.clientX - rect.left) * scale;
      const mouseY = viewBox.y + (e.clientY - rect.top) * scale;
      node.fx = mouseX;
      node.fy = mouseY;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragNode) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const scale = viewBox.width / rect.width;
      const mouseX = viewBox.x + (e.clientX - rect.left) * scale;
      const mouseY = viewBox.y + (e.clientY - rect.top) * scale;
      dragNode.fx = mouseX;
      dragNode.fy = mouseY;
    }
  };

  const handleMouseUp = () => {
    if (dragNode) {
      delete dragNode.fx;
      delete dragNode.fy;
      setDragNode(null);
    }
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const scale = e.deltaY > 0 ? zoomFactor : 1 / zoomFactor;
    
    setViewBox(vb => ({
      x: vb.x,
      y: vb.y,
      width: vb.width * scale,
      height: vb.height * scale
    }));
  };

  const handleNodeClick = (node: Node) => {
    if (!isDragging) {
      setSelectedNode(selectedNode?.id === node.id ? null : node);
    }
  };

  const getConnections = (nodeId: string) => {
    if (!graphData) return [];
    return graphData.edges.filter(edge => 
      edge.source === nodeId || edge.target === nodeId
    ).map(edge => edge.source === nodeId ? edge.target : edge.source);
  };

  if (!graphData) {
    return <div className="text-[--grid-text-dim]">Loading graph...</div>;
  }

  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <div className="bg-[--grid-surface] border border-[--grid-border] rounded-lg overflow-hidden">
          <svg
            ref={svgRef}
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            className="w-full h-96 cursor-grab active:cursor-grabbing"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* Edges */}
            <g>
              {graphData.edges.map((edge, i) => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                
                if (!sourceNode || !targetNode) return null;
                
                const dx = targetNode.x - sourceNode.x;
                const dy = targetNode.y - sourceNode.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                const arrowLength = 12;
                const nodeRadius = 25;
                
                // Calculate edge endpoints (stop at node circumference)
                const startX = sourceNode.x + (dx / distance) * nodeRadius;
                const startY = sourceNode.y + (dy / distance) * nodeRadius;
                const endX = targetNode.x - (dx / distance) * (nodeRadius + arrowLength);
                const endY = targetNode.y - (dy / distance) * (nodeRadius + arrowLength);
                
                // Arrow tip
                const arrowX = targetNode.x - (dx / distance) * nodeRadius;
                const arrowY = targetNode.y - (dy / distance) * nodeRadius;
                
                return (
                  <g key={i}>
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke="var(--grid-border)"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                    <polygon
                      points={`${arrowX},${arrowY} ${arrowX - (dx/distance) * arrowLength + (dy/distance) * 4},${arrowY - (dy/distance) * arrowLength - (dx/distance) * 4} ${arrowX - (dx/distance) * arrowLength - (dy/distance) * 4},${arrowY - (dy/distance) * arrowLength + (dx/distance) * 4}`}
                      fill="var(--grid-border)"
                    />
                  </g>
                );
              })}
            </g>
            
            {/* Nodes */}
            <g>
              {nodes.map(node => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="25"
                    fill={GROUP_COLORS[node.group as keyof typeof GROUP_COLORS] || '#666'}
                    stroke={selectedNode?.id === node.id ? 'var(--grid-accent)' : 'var(--grid-border)'}
                    strokeWidth={selectedNode?.id === node.id ? '3' : '1'}
                    className="cursor-pointer"
                    onMouseDown={(e) => handleMouseDown(e, node)}
                    onClick={() => handleNodeClick(node)}
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dy="0.3em"
                    fontSize="12"
                    fill="white"
                    className="pointer-events-none font-mono font-bold"
                  >
                    {node.id}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
        
        <div className="mt-4 text-sm text-[--grid-text-dim]">
          <p>🖱️ Click and drag nodes to reposition • 🔍 Scroll to zoom • 🎯 Click nodes for details</p>
        </div>
      </div>
      
      {selectedNode && (
        <div className="w-80 bg-[--grid-surface] border border-[--grid-border] rounded-lg p-6">
          <h3 className="text-xl font-bold text-[--grid-text] mb-4">
            {selectedNode.id}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-[--grid-text-dim] block mb-1">
                Group
              </label>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: GROUP_COLORS[selectedNode.group as keyof typeof GROUP_COLORS] }}
                />
                <span className="text-[--grid-text] capitalize font-mono">
                  {selectedNode.group}
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-semibold text-[--grid-text-dim] block mb-2">
                Connections ({getConnections(selectedNode.id).length})
              </label>
              <div className="space-y-1">
                {getConnections(selectedNode.id).map(connId => {
                  const connNode = nodes.find(n => n.id === connId);
                  return (
                    <div key={connId} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: connNode ? GROUP_COLORS[connNode.group as keyof typeof GROUP_COLORS] : '#666' }}
                      />
                      <span className="text-[--grid-text] font-mono text-sm">
                        {connId}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}