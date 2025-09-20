'use client';

import React, { useCallback } from 'react';
import { Lock, Shield, Eye, Crown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface SecurityIndicatorProps {
  role?: string;
}

/**
 * Renders a visual security/access indicator for the current user role.
 *
 * Displays a "Not Authenticated" alert when `role` is strictly `null`. For any non-null `role`
 * the component derives a coarse access level ("internal", "internal-plus", "confidential")
 * from the role string and renders:
 * - a compact Access Level indicator with tooltips for Public / Internal / Confidential, and
 * - a styled Security Badge showing the level label, description, icon, and the provided role.
 *
 * The derived level rules:
 * - role containing "HR Admin" → "confidential"
 * - role containing "Admin" or "Executive" → "internal-plus"
 * - otherwise → "internal"
 *
 * @param role - The user's role string; pass `null` to render the unauthenticated state.
 * @returns A JSX element representing the security indicator UI.
 */
export default function SecurityIndicator({ role }: SecurityIndicatorProps) {
  if (role === null) {
    return (
      <TooltipProvider>
        <Alert className={cn(
          "group relative border-2 border-destructive/30",
          "bg-gradient-mocha backdrop-blur-sm",
          "hover-lift hover-glow hover-scale",
          "transition-all duration-300 ease-spring",
          "shadow-xl overflow-hidden"
        )}>
          <Lock className="h-5 w-5 text-destructive" />
          <AlertDescription>
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/10 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-destructive/5 rounded-full blur-lg animate-pulse" />

            <div className="relative flex items-center space-x-3">
              <Avatar className="h-10 w-10 border-2 border-destructive/30">
                <AvatarFallback className="bg-destructive/10 text-destructive font-bold">
                  <Lock className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-destructive brutalist-text">Not Authenticated</span>
                  <Badge variant="destructive" className="text-xs">Access Required</Badge>
                </div>
                <span className="text-xs text-muted-foreground font-medium">Please sign in to continue</span>
              </div>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 h-1 bg-destructive w-0 group-hover:w-full transition-all duration-500 ease-spring" />
          </AlertDescription>
        </Alert>
      </TooltipProvider>
    );
  }

  const getSecurityLevel = useCallback((): "internal" | "confidential" | "internal-plus" => {
    if (role?.includes('HR Admin')) {
      return 'confidential';
    }
    if (role && (role.includes('Admin') || role.includes('Executive'))) {
      return 'internal-plus';
    }
    return 'internal';
  }, [role]);

  const level = getSecurityLevel();

  const getLevelConfig = useCallback(() => {
    switch (level) {
      case 'confidential':
        return {
          label: 'Confidential Access',
          description: 'Full system access with step-up authentication',
          bgClass: 'bg-destructive/10 border-destructive/30',
          textClass: 'text-destructive',
          icon: Crown,
          pulseClass: 'bg-destructive',
          shadowClass: 'hover:shadow-destructive/20'
        };
      case 'internal-plus':
        return {
          label: 'Enhanced Access',
          description: 'Cross-department administrative privileges',
          bgClass: 'bg-primary/10 border-primary/30',
          textClass: 'text-primary',
          icon: Shield,
          pulseClass: 'bg-primary',
          shadowClass: 'hover:shadow-primary/20'
        };
      case 'internal':
        return {
          label: 'Internal Access',
          description: 'Department-level document access',
          bgClass: 'bg-accent/10 border-accent/30',
          textClass: 'text-accent',
          icon: Eye,
          pulseClass: 'bg-accent',
          shadowClass: 'hover:shadow-accent/20'
        };
      default:
        return {
          label: 'Internal Access',
          description: 'Department-level document access',
          bgClass: 'bg-accent/10 border-accent/30',
          textClass: 'text-accent',
          icon: Eye,
          pulseClass: 'bg-accent',
          shadowClass: 'hover:shadow-accent/20'
        };
    }
  }, [level]);

  const config = getLevelConfig();
  const IconComponent = config.icon;

  return (
    <TooltipProvider>
      <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Access Level Indicator */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-bold text-foreground brutalist-text">Access Level:</span>
          <div className="flex space-x-2">
            {/* Public Level */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative group/level cursor-pointer">
                  <div className={cn(
                    "h-4 w-12 rounded-lg border-2 transition-all duration-500",
                    level === 'confidential' || level === 'internal-plus' || level === 'internal'
                      ? 'bg-accent border-accent/50 shadow-lg shadow-accent/30'
                      : 'bg-muted border-muted-foreground/30'
                  )} />
                  {(level === 'confidential' || level === 'internal-plus' || level === 'internal') && (
                    <div className="absolute inset-0 bg-accent rounded-lg animate-pulse opacity-30" />
                  )}
                  <Badge variant="outline" className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold opacity-0 group-hover/level:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    Public
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Basic document access level</p>
              </TooltipContent>
            </Tooltip>

            {/* Internal Level */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative group/level cursor-pointer">
                  <div className={cn(
                    "h-4 w-12 rounded-lg border-2 transition-all duration-500",
                    level === 'confidential' || level === 'internal-plus'
                      ? 'bg-primary border-primary/50 shadow-lg shadow-primary/30'
                      : 'bg-muted border-muted-foreground/30'
                  )} />
                  {(level === 'confidential' || level === 'internal-plus') && (
                    <div className="absolute inset-0 bg-primary rounded-lg animate-pulse opacity-30" />
                  )}
                  <Badge variant="outline" className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold opacity-0 group-hover/level:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    Internal
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Department-level access</p>
              </TooltipContent>
            </Tooltip>

            {/* Confidential Level */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative group/level cursor-pointer">
                  <div className={cn(
                    "h-4 w-12 rounded-lg border-2 transition-all duration-500",
                    level === 'confidential'
                      ? 'bg-destructive border-destructive/50 shadow-lg shadow-destructive/30'
                      : 'bg-muted border-muted-foreground/30'
                  )} />
                  {level === 'confidential' && (
                    <div className="absolute inset-0 bg-destructive rounded-lg animate-pulse opacity-30" />
                  )}
                  <Badge variant="outline" className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold opacity-0 group-hover/level:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    Confidential
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Full system access with step-up authentication</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Separator orientation="vertical" className="hidden sm:block h-12" />

        {/* Security Badge */}
        <Alert className={cn(
          "group relative border-2",
          "bg-gradient-mocha backdrop-blur-sm",
          config.bgClass,
          "hover-lift hover-glow hover-scale",
          "transition-all duration-300 ease-spring",
          "shadow-xl overflow-hidden",
          config.shadowClass
        )}>
          <IconComponent className={cn("h-5 w-5", config.textClass)} />
          <AlertDescription>
            {/* Animated background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div className="relative z-10 flex items-center space-x-4">
              <Avatar className="h-10 w-10 border-2 border-accent/30">
                <AvatarFallback className={cn("bg-accent/10 font-bold", config.textClass)}>
                  <IconComponent className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "text-sm font-black brutalist-text text-shadow-lg",
                    config.textClass
                  )}>
                    {config.label}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {config.description}
                </span>
              </div>
            </div>

            {/* Role indicator */}
            <div className="ml-auto">
              <Badge variant="outline" className="text-xs font-mono">
                {role}
              </Badge>
            </div>

            {/* Bottom accent line */}
            <div className={cn(
              "absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ease-spring",
              level === 'confidential' ? 'bg-destructive' :
              level === 'internal-plus' ? 'bg-primary' : 'bg-accent'
            )} />
          </AlertDescription>
        </Alert>
      </div>
    </TooltipProvider>
  );
}
