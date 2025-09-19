'use client';

import React from 'react';

import { ChatModeSelector } from '@/components/ChatModeSelector';
import { CedarCaptionChat } from '@/cedar/components/chatComponents/CedarCaptionChat';
import { FloatingCedarChat } from '@/cedar/components/chatComponents/FloatingCedarChat';
import { SidePanelCedarChat } from '@/cedar/components/chatComponents/SidePanelCedarChat';

type ChatMode = 'floating' | 'sidepanel' | 'caption';

/**
 * Page component that renders a multi-mode Cedar chat UI and a mode selector.
 *
 * Renders a full-height container with a ChatModeSelector and one of three chat
 * interfaces depending on the selected mode:
 * - "caption": inline caption-style chat (default).
 * - "floating": floating chat anchored to the right.
 * - "sidepanel": content wrapped in a right-side panel with a collapsed button.
 *
 * The component manages its own `chatMode` state (initial value: `"caption"`)
 * and returns the appropriate JSX for the currently selected mode.
 *
 * @returns The page's React element containing the chat UI for the active mode.
 */
export default function HomePage() {
  // Cedar-OS chat components with mode selector
  // Choose between caption, floating, or side panel chat modes
  const [chatMode, setChatMode] = React.useState<ChatMode>('caption');

  const renderContent = () => (
    <div className="relative h-screen w-full">
      <ChatModeSelector currentMode={chatMode} onModeChange={setChatMode} />

      {chatMode === 'caption' && <CedarCaptionChat />}

      {chatMode === 'floating' && (
        <FloatingCedarChat side="right" title="Cedarling Chat" collapsedLabel="Chat with Cedar" />
      )}
    </div>
  );

  if (chatMode === 'sidepanel') {
    return (
      <SidePanelCedarChat
        side="right"
        title="Cedarling Chat"
        collapsedLabel="Chat with Cedar"
        showCollapsedButton={true}
      >
        {renderContent()}
      </SidePanelCedarChat>
    );
  }

  return renderContent();
}
