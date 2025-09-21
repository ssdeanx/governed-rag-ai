'use client';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import React from 'react';

interface FeatureCardProps {
  title: string;
  badgeVariant?: 'secondary' | 'destructive' | 'default';
  badgeText?: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  status?: 'success' | 'warning' | 'error' | 'info';
  statusMessage?: string;
  progress?: number;
  showAvatar?: boolean;
  avatarFallback?: string;
  tooltip?: string;
  hoverContent?: React.ReactNode;
}

/**
 * A richly styled, interactive card for presenting a feature with optional badge, status, progress, avatar, tooltip, and hover-preview content.
 *
 * Renders a clickable card with decorative backgrounds, a title, optional icon/avatar, an optional badge, an optional status alert, an optional progress bar (with percentage), and body content. If `hoverContent` is provided a compact preview panel is shown on hover.
 *
 * @param title - The card title (displayed prominently).
 * @param badgeVariant - Visual variant for the badge; 'secondary' | 'destructive' | 'default'. When 'default' the Badge receives no explicit variant prop.
 * @param badgeText - Optional badge label displayed under the title.
 * @param icon - Optional leading icon node rendered beside the title.
 * @param className - Additional CSS class names applied to the card container.
 * @param children - Card body content rendered below the separator.
 * @param status - Optional status type; one of 'success' | 'warning' | 'error' | 'info'. Requires `statusMessage` to render.
 * @param statusMessage - Message shown inside the status Alert when `status` is provided.
 * @param progress - Optional progress value (number). Treated as a percentage (e.g., 0–100); renders a progress bar and a textual "N% complete".
 * @param showAvatar - When true, renders an Avatar to the left of the title.
 * @param avatarFallback - Fallback text shown inside the Avatar (defaults to the first character of `title` when omitted).
 * @param tooltip - (Present but not used) Intended tooltip text for the card.
 * @param hoverContent - Optional React node displayed inside a HoverCardContent panel on hover.
 * @returns The rendered FeatureCard JSX element.
 */
export function FeatureCard({
  title,
  badgeVariant = 'secondary',
  badgeText,
  icon,
  className,
  children,
  status,
  statusMessage,
  progress,
  showAvatar,
  avatarFallback,
  tooltip,
  hoverContent
}: FeatureCardProps) {
  return (
    <TooltipProvider>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card className={cn(
            "group relative overflow-hidden",
            "border-4 border-primary/20 hover:border-accent/40",
            "bg-gradient-mocha backdrop-blur-sm",
            "hover-lift hover-glow hover-scale",
            "transition-all duration-500 ease-spring",
            "shadow-2xl hover:shadow-accent/20",
            "animated-gradient brutalist-card",
            className
          )}>
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-accent/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-primary/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />

            <CardContent className="relative p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4 group/icon">
                  {showAvatar && (
                    <Avatar className="h-12 w-12 border-2 border-accent/30">
                      <AvatarFallback className="bg-accent/10 text-accent font-bold">
                        {avatarFallback || title.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="p-3 rounded-xl bg-accent/10 border-2 border-accent/20 group-hover/icon:bg-accent/20 group-hover/icon:border-accent/40 transition-all duration-300 hover-scale">
                    {icon}
                  </div>
                  <div className="flex flex-col">
                    <CardTitle className="text-xl font-black brutalist-text text-shadow-lg text-foreground group-hover:text-primary transition-colors duration-300">
                      {title}
                    </CardTitle>
                    {badgeText && (
                      <Badge
                        variant={badgeVariant === 'default' ? undefined : badgeVariant}
                        className={cn(
                          "mt-2 w-fit font-bold uppercase tracking-wider text-xs",
                          "btn-brutalist hover-scale",
                          badgeVariant === 'default' && "bg-primary text-primary-foreground",
                          badgeVariant === 'secondary' && "bg-accent text-accent-foreground",
                          badgeVariant === 'destructive' && "bg-destructive text-destructive-foreground"
                        )}
                      >
                        {badgeText}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Alert */}
              {status && statusMessage && (
                <Alert className={cn(
                  "mb-4 border-2",
                  status === 'success' && "border-accent/30 bg-accent/5",
                  status === 'warning' && "border-yellow-500/30 bg-yellow-500/5",
                  status === 'error' && "border-destructive/30 bg-destructive/5",
                  status === 'info' && "border-primary/30 bg-primary/5"
                )}>
                  <AlertDescription className={cn(
                    "font-bold",
                    status === 'success' && "text-accent",
                    status === 'warning' && "text-yellow-600",
                    status === 'error' && "text-destructive",
                    status === 'info' && "text-primary"
                  )}>
                    {statusMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* Progress Bar */}
              {progress !== undefined && (
                <div className="mb-4">
                  <Progress value={progress} className="h-2" />
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {progress}% complete
                  </span>
                </div>
              )}

              <Separator className="mb-4" />

              <div className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/90 transition-colors duration-300">
                {children}
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-accent w-0 group-hover:w-full transition-all duration-500 ease-spring" />
            </CardContent>
          </Card>
        </HoverCardTrigger>

        {/* Hover Card Content */}
        {hoverContent && (
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-bold">{title}</h4>
              {hoverContent}
            </div>
          </HoverCardContent>
        )}
      </HoverCard>
    </TooltipProvider>
  );
}

export default FeatureCard;
