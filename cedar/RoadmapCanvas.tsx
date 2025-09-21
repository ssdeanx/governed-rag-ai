import React from 'react';
import type {
  Connection,
  NodeChange,
  Node} from 'reactflow';
import ReactFlow, {
  addEdge,
  Background,
  ConnectionLineType,
  Controls,
  MarkerType,
  useEdgesState,
  useNodesState,
  useOnSelectionChange
} from 'reactflow';
import 'reactflow/dist/style.css';

import { roadmapNodeTypes } from './RoadmapNode';
import { useCedarRoadmap } from '../app/cedar-os/hooks';
import { useRoadmapData } from './useRoadmapData';
import { useCedarState } from 'cedar-os';
import type { FeatureNodeData } from './FeatureNode';

/**
 * Interactive roadmap canvas rendered with React Flow.
 *
 * Renders nodes and edges from roadmap data, synchronizes changes with Cedar-backed state,
 * and provides interactive behaviors: selection tracking, automatic edge cleanup when nodes
 * are deleted, and creation of animated bezier edges with closed-arrow markers on connect.
 *
 * The component also displays a compact overlay listing currently selected features (title and status).
 *
 * @returns A React element containing the interactive roadmap flow and selection overlay.
 */
export function RoadmapCanvas() {
  const { nodes: initialNodes, edges: initialEdges } = useRoadmapData();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodes, setSelectedNodes] = useCedarState<Node<FeatureNodeData>[]>({
    key: 'selectedNodes',
    initialValue: [],
    description: 'Selected features in the roadmap',
  });

  useCedarRoadmap(nodes, setNodes, edges, setEdges);

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      setSelectedNodes(nodes);
    },
  });

  // Custom handler for node changes (with cleanup for deletions)
  const handleNodesChange = React.useCallback(
    (changes: NodeChange[]) => {
      // Clean up edges when nodes are deleted
      const deletions = changes.filter((change) => change.type === 'remove');
      if (deletions.length > 0) {
        setEdges((edges) => {
          const deletedIds = deletions.map((d) => d.id);
          return edges.filter(
            (edge) => !deletedIds.includes(edge.source) && !deletedIds.includes(edge.target),
          );
        });
      }
      onNodesChange(changes);
    },
    [onNodesChange, setEdges],
  );

  // Handle new connections between features
  const onConnect = React.useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'simplebezier',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={roadmapNodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{
          type: 'simplebezier',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Background gap={16} size={1} />
        <Controls />
      </ReactFlow>

      {selectedNodes.length > 0 && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg border">
          <h4 className="text-sm font-semibold mb-2">Selected Features</h4>
          <div className="space-y-1">
            {selectedNodes.map((node) => (
              <div key={node.id} className="text-xs">
                <span className="font-medium">{node.data.title}</span>
                <span className="ml-2 text-gray-500">({node.data.status})</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">💡 Ask Cedar about these selected features!</p>
        </div>
      )}
    </div>
  );
}
