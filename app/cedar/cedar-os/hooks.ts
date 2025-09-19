import React from 'react';
import { Node, Edge } from 'reactflow';
import { FeatureNodeData } from '@/components/FeatureNode';

import { useRoadmapState } from './state';
import { useRoadmapMentions } from './mentions';
import { useRoadmapContext } from './context';

// [STEP 3]: For sake of example, we've encapsulated all the Cedar-OS functionality in a single hook.
/**
 * Composes Cedar roadmap functionality by initializing roadmap state, mentions, and context.
 *
 * Calls useRoadmapState with the provided graph state and setters, and then initializes
 * roadmap mentions and context. This hook has no return value and is intended to be used
 * inside React components to wire Cedar-OS behavior for a roadmap graph.
 *
 * @param nodes - Current array of roadmap nodes (feature nodes).
 * @param setNodes - State setter for updating the `nodes` array.
 * @param edges - Current array of roadmap edges.
 * @param setEdges - State setter for updating the `edges` array.
 */
export function useCedarRoadmap(
  nodes: Node<FeatureNodeData>[],
  setNodes: React.Dispatch<React.SetStateAction<Node<FeatureNodeData>[]>>,
  edges: Edge[],
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
) {
  useRoadmapState(nodes, setNodes, edges, setEdges);

  useRoadmapMentions();

  useRoadmapContext();
}
