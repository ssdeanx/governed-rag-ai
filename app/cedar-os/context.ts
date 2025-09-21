import React from 'react';
import type { Node } from 'reactflow';
import { useSubscribeStateToAgentContext } from 'cedar-os';
import { Box } from 'lucide-react';
import type { FeatureNodeData } from '../../cedar/FeatureNode';

// [STEP 6]: To automatically make any part of your application state available to AI agents as context,
// We use the subscribeInputContext function. In this example, we subscribe to the selected nodes and specify how we want them to appear in the chat as "selected context".
/**
 * Subscribes roadmap node state to the AI agent context so the agent can see selected nodes and all nodes in a simplified shape.
 *
 * Exposes two contexts via useSubscribeStateToAgentContext:
 * - "selectedNodes": provides `selectedFeatures`, an array of selected nodes mapped to { id, title, description, status, type, upvotes, commentCount } and includes UI metadata (icon and color).
 * - "nodes": provides `features`, an array of all nodes mapped to the same simplified shape.
 *
 * Fields are derived from Node<FeatureNodeData>. `commentCount` defaults to 0 when `comments` is undefined.
 */

export function useRoadmapContext() {
  useSubscribeStateToAgentContext(
    'selectedNodes',
    (nodes: Node<FeatureNodeData>[]) => ({
      selectedFeatures: nodes.map((node) => ({
        id: node.id,
        title: node.data.title,
        description: node.data.description,
        status: node.data.status,
        type: node.data.nodeType,
        upvotes: node.data.upvotes,
        commentCount: node.data.comments?.length ?? 0,
      })),
    }),
    {
      icon: React.createElement(Box, { size: 16 }),
      color: '#C06520', // Blue color for selected nodes
    },
  );

  useSubscribeStateToAgentContext('nodes', (nodes: Node<FeatureNodeData>[]) => ({
    features: nodes.map((node) => ({
      id: node.id,
      title: node.data.title,
      description: node.data.description,
      status: node.data.status,
      type: node.data.nodeType,
      upvotes: node.data.upvotes,
      commentCount: node.data.comments?.length ?? 0,
    })),
  }));
}
