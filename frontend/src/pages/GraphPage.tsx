import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useUser } from '../context/UserContext';
import { Card, CardContent } from '../components/ui/Card';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { cn } from '../lib/utils';
import { Info } from 'lucide-react';

export default function GraphPage() {
  const { selectedUserId } = useUser();
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  const [selectedEdge, setSelectedEdge] = useState<any>(null);
  const [evidence, setEvidence] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!selectedUserId) return;
      setLoading(true);
      try {
        const [graphRes, patternsRes] = await Promise.all([
          api.getGraph(selectedUserId),
          api.getPatterns(selectedUserId)
        ]);
        
        setEvidence(patternsRes.evidence);

        // Simple layout logic: Place 'Headache' in center, others around it
        const centerNode = graphRes.nodes.find((n: any) => n.id.toLowerCase() === 'headache');
        const otherNodes = graphRes.nodes.filter((n: any) => n.id.toLowerCase() !== 'headache');
        
        const centerX = 400;
        const centerY = 300;
        const radius = 200;
        
        const flowNodes: Node[] = [];
        
        if (centerNode) {
          flowNodes.push({
            id: centerNode.id,
            position: { x: centerX, y: centerY },
            data: { label: centerNode.label.replace('_', ' ') },
            style: { 
              background: '#0f172a', 
              color: '#f8fafc', 
              border: '1px solid #1e293b', 
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: 500,
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }
          });
        }
        
        otherNodes.forEach((node: any, i: number) => {
          const angle = (i / otherNodes.length) * 2 * Math.PI;
          flowNodes.push({
            id: node.id,
            position: { 
              x: centerX + radius * Math.cos(angle) - 50, 
              y: centerY + radius * Math.sin(angle) - 20
            },
            data: { label: node.label.replace('_', ' ') },
            style: { 
              background: '#1e293b', 
              color: '#cbd5e1', 
              border: '1px solid #334155', 
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px'
            }
          });
        });

        const flowEdges: Edge[] = graphRes.edges.map((e: any, i: number) => {
          const isPositive = e.direction === 'positive';
          const strength = parseFloat(e.strength);
          return {
            id: `e${i}`,
            source: e.source,
            target: e.target,
            animated: true,
            label: `${isPositive ? '+' : '-'} ${strength.toFixed(2)}`,
            labelStyle: { fill: '#94a3b8', fontSize: 12, fontWeight: 500 },
            labelBgStyle: { fill: '#0f172a', fillOpacity: 0.8 },
            labelBgPadding: [4, 4],
            labelBgBorderRadius: 4,
            style: { 
              stroke: isPositive ? '#10b981' : '#f59e0b', 
              strokeWidth: 2 + (strength * 3)
            },
            data: { ...e }
          };
        });

        setNodes(flowNodes);
        setEdges(flowEdges);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedUserId, setNodes, setEdges]);

  const onEdgeClick = useCallback((_event: any, edge: Edge) => {
    setSelectedEdge(edge.data);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedEdge(null);
  }, []);

  if (loading) {
    return <div className="h-64 animate-pulse bg-slate-800/50 rounded-xl" />;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)] pb-4">
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-inner">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          fitView
          className="bg-slate-950"
        >
          <Background color="#334155" gap={24} size={2} />
          <Controls className="bg-slate-800 border-slate-700 fill-slate-300" />
        </ReactFlow>
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm border border-slate-800 p-3 rounded-lg max-w-sm">
          <div className="flex gap-2 items-start text-xs text-slate-400">
            <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
            <p>Relationships shown are observed statistical associations from your history, not medical causal relationships.</p>
          </div>
        </div>
      </div>

      <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
        {selectedEdge ? (
          <Card className="h-full">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-slate-100 mb-6 capitalize">{selectedEdge.source.replace('_', ' ')}</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Target</div>
                  <div className="text-sm font-medium text-slate-300 capitalize">{selectedEdge.target.replace('_', ' ')}</div>
                </div>
                
                <div>
                  <div className="text-xs text-slate-500 mb-1">Observed relationship</div>
                  <div className={cn("text-sm font-medium", selectedEdge.direction === 'positive' ? "text-emerald-400" : "text-amber-400")}>
                    {selectedEdge.direction === 'positive' ? 'Positive association' : 'Negative association'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 mb-1">Strength</div>
                  <div className="text-sm font-medium text-slate-300 capitalize">
                    {Math.abs(selectedEdge.strength) > 0.5 ? 'Strong' : Math.abs(selectedEdge.strength) > 0.3 ? 'Moderate' : 'Weak'} 
                    <span className="text-slate-500 font-normal ml-2">({parseFloat(selectedEdge.strength).toFixed(2)})</span>
                  </div>
                </div>

                {evidence && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Evidence</div>
                    <div className="text-sm font-medium text-slate-300">
                      Observed over {evidence.total_days} days
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center bg-slate-900/50 border-dashed border-slate-800">
            <div className="text-center p-6">
              <NetworkIcon className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Click on a relationship line to view details.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function NetworkIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="16" y="16" width="6" height="6" rx="1" />
      <rect x="2" y="16" width="6" height="6" rx="1" />
      <rect x="9" y="2" width="6" height="6" rx="1" />
      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
      <path d="M12 12V8" />
    </svg>
  );
}
