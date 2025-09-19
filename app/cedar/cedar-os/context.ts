import React from 'react';
import type { Node } from 'reactflow';
import { useSubscribeStateToAgentContext } from 'cedar-os';
import { Box } from 'lucide-react';
import { FeatureNodeData } from '../components/FeatureNode';

// [STEP 6]: To automatically make any part of your application state available to AI agents as context,
// We use the subscribeInputContext function. In this example, we subscribe to the selected nodes and specify how we want them to appear in the chat as "selected context".
/**
 * Registers roadmap-related state with the agent context so AI agents can access node data.
 *
 * Subscribes two context keys:
 * - `selectedNodes`: exposes `selectedFeatures`, an array of selected feature summaries (id, title, description, status, type, upvotes, commentCount). This subscription includes a purple Box icon (size 16) in the agent UI.
 * - `nodes`: exposes `features`, an array of feature summaries with the same shape.
 *
 * Each summary's `commentCount` is derived from `node.data.comments?.length ?? 0`. Calling this hook registers the subscriptions as a side effect; it does not return a value.
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
      color: '#8B5CF6', // Purple color for selected nodes
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
