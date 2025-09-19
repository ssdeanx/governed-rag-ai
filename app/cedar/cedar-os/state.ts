import type React from 'react';
import { useEffect } from 'react';
import type { Node, Edge } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { useCedarState, useRegisterState } from 'cedar-os';
import type { FeatureNodeData } from '@/cedar/components/FeatureNode';

// [STEP 4]: There are a few ways to make your application states visible to your agent.
/**
 * Registers roadmap graph state with Cedar and binds it to the provided React state.
 *
 * Registers a Cedar-managed `currentDate` value and two Cedar states keyed `'nodes'` and `'edges'`.
 * The `'nodes'` state exposes three state setters — `addNode`, `removeNode`, and `changeNode` —
 * which respectively append a new feature/bug node (assigning a UUID and default node data when missing),
 * remove a node (and also removes any connected edges), and merge updates into an existing node's data.
 *
 * @param nodes - The current array of roadmap nodes (Node<FeatureNodeData>).
 * @param setNodes - React state setter for `nodes`.
 * @param edges - The current array of roadmap edges (Edge[]).
 * @param setEdges - React state setter for `edges`.
 */
export function useRoadmapState(
  nodes: Node<FeatureNodeData>[],
  setNodes: React.Dispatch<React.SetStateAction<Node<FeatureNodeData>[]>>,
  edges: Edge[],
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
) {
  // Using the useCedarState hook, we wrap and manage the entire state.
  const [currentDate] = useCedarState({
    key: 'currentDate',
    initialValue: Date.now().toString(),
    description: 'The current date and time',
  });

  useEffect(() => {
    console.log('The current date and time is ' + currentDate);
  }, [currentDate]);

  // We can also register state using the useRegisterState hook, and attach custom setters to it.
  useRegisterState({
    value: nodes,
    setValue: setNodes,
    key: 'nodes',
    description: 'Product roadmap features and bugs that can be managed through conversation',
    stateSetters: {
      addNode: {
        name: 'addNode',
        description: 'Add a new feature or bug to the product roadmap',
        execute: (currentNodes, setValue, args: { node: Node<FeatureNodeData> }) => {
          const nodes = currentNodes as Node<FeatureNodeData>[];
          const nodeData = args.node;

          const newNode: Node<FeatureNodeData> = {
            ...nodeData,
            type: 'featureNode',
            position: {
              x: Math.random() * 400 + 100,
              y: Math.random() * 300 + 100,
            },
            id: nodeData.id || uuidv4(),
            data: {
              ...nodeData.data,
              nodeType: nodeData.data.nodeType || 'feature',
              status: nodeData.data.status || 'planned',
              upvotes: nodeData.data.upvotes || 0,
              comments: nodeData.data.comments || [],
            },
          };

          setValue([...nodes, newNode]);
        },
      },

      removeNode: {
        name: 'removeNode',
        description: 'Remove a feature or bug from the product roadmap',
        execute: (currentNodes, setValue, args: { id: string }) => {
          const nodeId = args.id;
          const nodes = currentNodes as Node<FeatureNodeData>[];

          // Remove the node
          setValue(nodes.filter((node) => node.id !== nodeId));

          // Clean up any connected edges
          setEdges((edges) =>
            edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
          );
        },
      },

      changeNode: {
        name: 'changeNode',
        description: 'Update an existing feature or bug in the roadmap',
        execute: (currentNodes, setValue, args: { newNode: Node<FeatureNodeData> }) => {
          const nodes = currentNodes as Node<FeatureNodeData>[];
          const updatedNode = args.newNode;

          setValue(
            nodes.map((node) =>
              node.id === updatedNode.id
                ? { ...node, data: { ...node.data, ...updatedNode.data } }
                : node,
            ),
          );
        },
      },
    },
  });

  useRegisterState({
    key: 'edges',
    value: edges,
    setValue: setEdges,
    description:
      'Connections between roadmap features showing dependencies, relationships, and workflow order',
  });
}
