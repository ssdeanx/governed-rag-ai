'use client';

import React from 'react';

import { ChatModeSelector } from '../../cedar/ChatModeSelector';
import { CedarCaptionChat } from '@/cedar/components/chatComponents/CedarCaptionChat';
import { FloatingCedarChat } from '@/cedar/components/chatComponents/FloatingCedarChat';
import { SidePanelCedarChat } from '@/cedar/components/chatComponents/SidePanelCedarChat';

export const experimental_ppr = true

type ChatMode = 'floating' | 'sidepanel' | 'caption';

/**
 * Page-level React component that displays the Cedar chat UI with a mode selector.
 *
 * Renders a full-height container with a ChatModeSelector that toggles between three chat modes:
 * - "caption": embeds CedarCaptionChat inline,
 * - "floating": shows FloatingCedarChat on the right,
 * - "sidepanel": wraps the content with SidePanelCedarChat on the right (includes a collapsed button).
 *
 * The component manages local state (`chatMode`) initialized to `"caption"`; the selector updates that state.
 *
 * @returns The React element for the Cedar chat page.
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
