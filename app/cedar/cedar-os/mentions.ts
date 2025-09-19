import React from 'react';
import { Node, Edge } from 'reactflow';
import { getCedarState, useStateBasedMentionProvider } from 'cedar-os';
import { ArrowRight, Box } from 'lucide-react';
import { FeatureNodeData } from '@/components/FeatureNode';

// [STEP 5]: To enable @ mentions, we use the useStateBasedMentionProvider hook.
/**
 * Registers two Cedar state-based @-mention providers for roadmap nodes and edges.
 *
 * The hook adds:
 * - a "nodes" provider (trigger `@`) that labels mentions with each node's `data.title`
 *   and allows searching by `data.description` (described as "Product roadmap features and bugs").
 * - an "edges" provider (trigger `@`) that labels mentions as `SourceTitle → TargetTitle`
 *   by resolving connected node titles from the current `nodes` state (falls back to the
 *   edge's `source`/`target` IDs if a node is not found) and is described as
 *   "Feature relationships, dependencies, and connections".
 *
 * Intended to enable referencing roadmap features and their relationships from chat UIs.
 */
export function useRoadmapMentions() {
  // We use the useStateBasedMentionProvider hook to register a mention provider that references an existing state that we've registered.
  useStateBasedMentionProvider({
    stateKey: 'nodes',
    trigger: '@',
    labelField: (node: Node<FeatureNodeData>) => node.data.title,
    searchFields: ['data.description'], // The field of the state that the user can use to search after the @
    description: 'Product roadmap features and bugs',
    icon: React.createElement(Box, { size: 16 }),
    color: '#3B82F6', // Blue color for features
  });

  const nodes = getCedarState('nodes') as Node<FeatureNodeData>[];

  useStateBasedMentionProvider({
    stateKey: 'edges',
    trigger: '@',
    labelField: (edge: Edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      const sourceTitle = sourceNode?.data.title || edge.source;
      const targetTitle = targetNode?.data.title || edge.target;
      return `${sourceTitle} → ${targetTitle}`;
    },
    description: 'Feature relationships, dependencies, and connections',
    icon: React.createElement(ArrowRight, { size: 16 }),
    color: '#10B981', // Green color for relationships
  });
}
