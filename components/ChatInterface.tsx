'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, Loader2, Shield, FileText, Bot, User, Copy, ThumbsUp, ThumbsDown, MessageSquare, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Array<{ docId: string; source?: string }>;
  contexts?: Array<{
    docId: string;
    classification: string;
    score: number;
  }>;
  timestamp: Date;
}

interface ChatInterfaceProps {
  jwt: string;
  role: string;
}

/**
 * Chat UI component that manages a conversation, sends user queries to the server, and streams assistant responses into the chat.
 *
 * Renders a full-featured chat interface (messages list, input, metadata badges, contexts and citations UI). On send, posts { message } to /api/chat with an `Authorization: Bearer ${jwt}` header and incrementally updates the assistant message as the response body is streamed (appending content, contexts, and citations). Initializes with a system welcome message that reflects the provided role and auto-scrolls as messages arrive.
 *
 * @param jwt - Bearer token used to authenticate requests to the chat API.
 * @param role - Displayed user role used in the initial system message and UI badges.
 * @returns A React element containing the governed chat interface.
 */
export default function ChatInterface({ jwt, role }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([{
      id: '0',
      role: 'system',
      content: `Welcome! You're authenticated as **${role}**. Ask me anything and I'll retrieve information based on your access level.`,
      timestamp: new Date()
    }]);
  }, [role]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ message: input })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          const chunk: string = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (typeof data.content === 'string' && Boolean(data.content)) {
                  assistantMessage.content += data.content;
                  setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: assistantMessage.content }
                      : msg
                  ));
                }

                if (Array.isArray(data.citations)) {
                  assistantMessage.citations = data.citations;
                }

                if (Array.isArray(data.contexts)) {
                  assistantMessage.contexts = data.contexts;
                }

                if (data.done === true) {
                  setMessages(prev => prev.map(msg =>
                    msg.id === assistantMessage.id
                      ? assistantMessage
                      : msg
                  ));
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: 'Failed to get response. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, jwt]);

  return (
    <Card className="h-full flex flex-col border-4 border-primary/20 bg-gradient-mocha backdrop-blur-xl brutalist-card shadow-2xl">
      {/* Header */}
      <CardHeader className="relative border-b-2 border-primary/10 bg-gradient-mocha/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 border-2 border-accent/30">
            <AvatarFallback className="bg-accent/10 text-accent font-bold">
              <Shield className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle className="text-bold-serif text-primary font-black text-shadow-lg">
              Governed Chat
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="font-bold">
                {role}
              </Badge>
              <Badge variant="outline" className="text-accent border-accent/30">
                <Shield className="h-3 w-3 mr-1" />
                Secure
              </Badge>
            </div>
          </div>
        </div>

        {/* Security Alert */}
        <Alert className="mt-4 border-2 border-accent/30 bg-accent/5">
          <Shield className="h-4 w-4 text-accent" />
          <AlertDescription className="text-accent/80 font-bold">
            All conversations are logged and monitored for compliance with access policies.
          </AlertDescription>
        </Alert>
      </CardHeader>

      {/* Messages Container */}
      <ScrollArea className="relative flex-1 p-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <ContextMenu key={message.id}>
              <ContextMenuTrigger>
                <div className={cn(
                  "flex items-start space-x-4 group animate-in slide-in-from-bottom-4 duration-500",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}>
                  {/* Avatar */}
                  <Avatar className={cn(
                    "h-10 w-10 border-2 transition-all duration-300",
                    message.role === 'user'
                      ? 'border-primary/30 group-hover:border-accent/50'
                      : message.role === 'system'
                      ? 'border-secondary group-hover:border-accent/40'
                      : 'border-accent/30 group-hover:border-accent/50'
                  )}>
                    <AvatarFallback className={cn(
                      "font-bold text-sm",
                      message.role === 'user'
                        ? 'bg-primary/10 text-primary'
                        : message.role === 'system'
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-accent/10 text-accent'
                    )}>
                      {message.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>

                  {/* Message Bubble */}
                  <div className={cn(
                    "group relative max-w-[85%] transition-all duration-300 ease-spring",
                    "border-2 rounded-xl p-5 hover-scale",
                    "hover-lift hover-glow hover:shadow-xl",
                    message.role === 'user'
                      ? 'bg-primary/10 border-primary/30 hover:border-accent/50'
                      : message.role === 'system'
                      ? 'bg-secondary border-primary/20 hover:border-accent/40'
                      : 'bg-gradient-mocha border-primary/20 hover:border-accent/40'
                  )}>
                    {/* Message Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant={message.role === 'user' ? 'default' : 'secondary'} className="font-bold">
                          {message.role === 'user' ? 'You' : message.role === 'system' ? 'System' : 'Assistant'}
                        </Badge>
                        {message.role === 'assistant' && (
                          <Badge variant="outline" className="text-accent border-accent/30">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Context Tags */}
                    {message.role === 'assistant' && message.contexts && message.contexts.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="h-4 w-4 text-accent" />
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Knowledge Sources
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {message.contexts.map((ctx, idx) => (
                            <HoverCard key={idx}>
                              <HoverCardTrigger>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "cursor-pointer transition-all duration-300 hover-scale",
                                    ctx.classification === 'confidential'
                                      ? 'border-destructive/40 text-destructive hover:border-destructive/60'
                                      : ctx.classification === 'internal'
                                      ? 'border-primary/40 text-primary hover:border-primary/60'
                                      : 'border-accent/40 text-accent hover:border-accent/60'
                                  )}
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  {ctx.docId}
                                </Badge>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80">
                                <div className="space-y-2">
                                  <h4 className="font-bold">{ctx.docId}</h4>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant={ctx.classification === 'confidential' ? 'destructive' : 'secondary'}>
                                      {ctx.classification}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      Relevance: {Math.round(ctx.score * 100)}%
                                    </span>
                                  </div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message Content */}
                    <div className="prose prose-sm max-w-none dark:prose-invert message-content
                                  prose-headings:text-foreground prose-p:text-foreground prose-p:leading-relaxed
                                  prose-strong:text-foreground prose-code:text-primary prose-code:bg-muted
                                  prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                                  prose-pre:bg-muted prose-pre:border-2 prose-pre:border-primary/20
                                  prose-blockquote:border-l-accent prose-blockquote:text-muted-foreground">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-3 last:mb-0 break-words">{children}</p>,
                          code: ({ children, className }) => {
                            const isInline = !className || (className?.length === 0);
                            return isInline ? (
                              <code className="break-all bg-primary/10 px-1.5 py-0.5 rounded">{children}</code>
                            ) : (
                              <code className={className}>{children}</code>
                            );
                          }
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>

                    {/* Citations Section */}
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-4">
                        <Separator className="mb-3" />
                        <Collapsible>
                          <CollapsibleTrigger className="flex items-center space-x-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
                            <Shield className="h-4 w-4 text-accent" />
                            <span className="uppercase tracking-wider">
                              {message.citations.length} Verified Source{message.citations.length > 1 ? 's' : ''}
                            </span>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-3 space-y-2">
                            {message.citations.map((citation, idx) => (
                              <HoverCard key={idx}>
                                <HoverCardTrigger>
                                  <div className="text-xs text-muted-foreground flex items-start space-x-2 p-3 rounded-lg bg-accent/5 border border-accent/20 hover:border-accent/40 transition-all duration-300 cursor-pointer">
                                    <span className="text-accent font-black">•</span>
                                    <span className="break-all font-medium">{citation.source ?? citation.docId}</span>
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent>
                                  <p className="font-bold">{citation.docId}</p>
                                  <p className="text-sm text-muted-foreground">Click to view source details</p>
                                </HoverCardContent>
                              </HoverCard>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    )}

                    {/* Message decoration */}
                    <div className="absolute -bottom-1 left-4 w-4 h-1 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Message
                </ContextMenuItem>
                {message.role === 'assistant' && (
                  <>
                    <ContextMenuItem>
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Helpful
                    </ContextMenuItem>
                    <ContextMenuItem>
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Not Helpful
                    </ContextMenuItem>
                  </>
                )}
              </ContextMenuContent>
            </ContextMenu>
          ))}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-start animate-in slide-in-from-bottom-4 duration-300">
              <div className={cn(
                "bg-gradient-mocha border-2 border-primary/20 rounded-xl p-5",
                "max-w-[85%] shadow-xl"
              )}>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8 border-2 border-accent/30">
                    <AvatarFallback className="bg-accent/10 text-accent">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    <span className="text-sm font-bold text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input Section */}
      <CardContent className="relative border-t-2 border-primary/10 bg-gradient-mocha/50 backdrop-blur-sm">
        <div className="flex space-x-4 pt-4">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask me anything about your organization's knowledge base..."
              disabled={loading}
              className={cn(
                "pr-12 h-14 text-lg border-4 border-primary/20 bg-background/80 backdrop-blur-sm",
                "focus:border-accent/50 focus:ring-2 focus:ring-accent/20",
                "hover-lift hover-glow transition-all duration-300 ease-spring",
                "placeholder:text-muted-foreground/60"
              )}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 group",
                  "border-2 border-primary/30 hover:border-accent/50",
                  "bg-gradient-mocha backdrop-blur-sm",
                  "hover-lift hover-glow hover-scale",
                  "transition-all duration-300 ease-spring",
                  "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative bottom elements */}
        <div className="absolute bottom-2 left-8 w-6 h-6 bg-accent/20 rounded-full blur-lg animate-pulse" />
        <div className="absolute bottom-2 right-8 w-4 h-4 bg-primary/20 rounded-full blur-md animate-pulse" />
      </CardContent>
    </Card>
  );
}
