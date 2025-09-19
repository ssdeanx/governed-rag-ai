import React from 'react';
import { MessageCircle, PanelRight, Type } from 'lucide-react';

type ChatMode = 'floating' | 'sidepanel' | 'caption';

interface ChatModeSelectorProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

/**
 * Renders a compact chat mode selector with three options: Caption, Floating, and Side Panel.
 *
 * Shows an icon and label for each mode, visually highlights the currently selected mode, and invokes
 * `onModeChange` with the selected mode id when a button is clicked.
 *
 * @param currentMode - The currently selected chat mode (`'floating' | 'sidepanel' | 'caption'`).
 * @param onModeChange - Callback invoked with the new mode id when the user selects a mode.
 * @returns A JSX element containing the mode selector UI.
 */
export function ChatModeSelector({ currentMode, onModeChange }: ChatModeSelectorProps) {
  const modes = [
    {
      id: 'caption' as const,
      label: 'Caption',
      icon: <Type className="w-4 h-4" />,
      description: 'Bottom caption style chat',
    },
    {
      id: 'floating' as const,
      label: 'Floating',
      icon: <MessageCircle className="w-4 h-4" />,
      description: 'Resizable floating chat window',
    },
    {
      id: 'sidepanel' as const,
      label: 'Side Panel',
      icon: <PanelRight className="w-4 h-4" />,
      description: 'Dedicated side panel layout',
    },
  ];

  return (
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg p-2 shadow-lg border z-10">
      <div className="text-xs font-semibold mb-2 text-gray-600">Chat Modes</div>
      <div className="flex gap-1">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`
              flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors
              ${
                currentMode === mode.id
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }
            `}
            title={mode.description}
          >
            {mode.icon}
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
