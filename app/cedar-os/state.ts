import type React from 'react';
import { useEffect } from 'react';
import type { Node, Edge } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { useCedarState, useRegisterState } from 'cedar-os';
import type { FeatureNodeData } from '../../cedar/FeatureNode';

// [STEP 4]: There are a few ways to make your application states visible to your agent.
/**
 * Exposes and registers the roadmap's React Flow nodes and edges with Cedar state so they can be inspected and manipulated by agents.
 *
 * Registers three Cedar-managed states:
 * - 'currentDate' (read-only timestamp string),
 * - 'nodes' (with state setters: `addNode`, `removeNode`, `changeNode`),
 * - 'edges' (roadmap connections).
 *
 * The registered node setters accept untyped payloads and perform runtime guards:
 * - addNode: expects `{ node: Node<FeatureNodeData> }`, augments the node (id, type, defaults, random position) and appends it.
 * - removeNode: expects `{ id: string }`, removes the node and any connected edges.
 * - changeNode: expects `{ newNode: Node<FeatureNodeData> }`, merges `newNode.data` into the existing node with the same id.
 *
 * @param nodes - Current array of React Flow nodes for the roadmap.
 * @param setNodes - React state setter for `nodes`.
 * @param edges - Current array of React Flow edges for the roadmap.
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
        execute: (currentNodes, setValue, args: unknown) => {
          const nodeArg = (args as { node?: Node<FeatureNodeData> } | undefined)?.node;
          if (!nodeArg) {
            return;
          }

          const nodes = currentNodes as Node<FeatureNodeData>[];
          const nodeData = nodeArg;

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
        execute: (currentNodes, setValue, args: unknown) => {
          const nodeId = (args as { id?: string } | undefined)?.id;
          if (!nodeId) {
            return;
          }

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
        execute: (currentNodes, setValue, args: unknown) => {
          const updatedNode = (args as { newNode?: Node<FeatureNodeData> } | undefined)?.newNode;
          if (!updatedNode) {
            return;
          }

          const nodes = currentNodes as Node<FeatureNodeData>[];

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
