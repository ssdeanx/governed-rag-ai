import React from 'react';
import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Badge } from './badge';
import { Heart, MessageCircle, Bug, Lightbulb } from 'lucide-react';
import type { FeatureNodeData } from './FeatureNode';

/**
 * React Flow node component that renders a roadmap item (feature or bug) with editable title/description.
 *
 * Renders a compact card showing node type, status, title, description, upvotes and comment count.
 * Double-clicking the title or description enables inline edit mode; edits are saved on blur or on Enter.
 *
 * @param data - FeatureNodeData backing this node. Expected fields used: `title`, `description`, `status` (one of "done" | "in progress" | "planned" | "backlog"), `nodeType` (e.g. "feature" | "bug"), `upvotes`, and optional `comments` array.
 * @param selected - Whether the node is selected in the React Flow canvas; when true a focus ring is shown.
 * @returns A JSX element representing the roadmap node suitable for use as a React Flow node component.
 */
export function RoadmapNode({ data, selected }: NodeProps<FeatureNodeData>) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(data.title);
  const [description, setDescription] = React.useState(data.description);

  const statusColors = {
    done: 'bg-green-100 border-green-300 text-green-800',
    'in progress': 'bg-blue-100 border-blue-300 text-blue-800',
    planned: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    backlog: 'bg-gray-100 border-gray-300 text-gray-600',
  };

  const typeIcons = {
    feature: <Lightbulb className="w-4 h-4" />,
    bug: <Bug className="w-4 h-4" />,
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // In a real app, you'd update the node data here
    // For this example, we keep it simple
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div
      className={`
      min-w-[250px] max-w-[300px] rounded-lg border-2 p-4 shadow-md
      ${statusColors[data.status]}
      ${selected ? 'ring-2 ring-blue-500' : ''}
      transition-all duration-200 hover:shadow-lg
    `}
    >
      {/* Connection handles for linking features */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* Node type and status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          {typeIcons[data.nodeType as keyof typeof typeIcons]}
          <Badge variant="outline" className="text-xs">
            {data.nodeType}
          </Badge>
        </div>
        <Badge className="text-xs">{data.status}</Badge>
      </div>

      {/* Title & Description - editable on double click */}
      {isEditing ? (
        <>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyPress={handleKeyPress}
            className="w-full font-semibold text-sm bg-transparent border-none outline-none mb-2"
            placeholder="Title"
            title="Edit title"
            aria-label="Edit title"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleSave}
            onKeyPress={handleKeyPress}
            className="w-full text-xs bg-transparent border-none outline-none resize-none"
            placeholder="Short description"
            title="Edit description"
            aria-label="Edit description"
            rows={2}
          />
        </>
      ) : (
        <>
          <h3
            className="font-semibold text-sm mb-2 cursor-pointer hover:opacity-70"
            onDoubleClick={handleDoubleClick}
          >
            {data.title}
          </h3>
          <p
            className="text-xs opacity-75 mb-3 cursor-pointer hover:opacity-90"
            onDoubleClick={handleDoubleClick}
          >
            {data.description}
          </p>
        </>
      )}

      {/* Engagement metrics */}
      <div className="flex items-center justify-between text-xs opacity-60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span>{data.upvotes}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>{data.comments?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export as the node type for React Flow
export const roadmapNodeTypes = {
  featureNode: RoadmapNode,
};
