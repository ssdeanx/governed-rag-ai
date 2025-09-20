'use client';

import React from 'react';
import { CheckCircle, LogOut, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface LoggedInAlertProps {
  currentRole: string;
  onSignOut: () => void;
}

/**
 * Renders a stylized "logged in" alert showing the user's role and a sign-out action.
 *
 * The component displays an avatar fallback, a badge containing `currentRole`, an
 * "Authenticated Session" status, and a Sign Out button wrapped in a tooltip.
 * Clicking the Sign Out button invokes the provided `onSignOut` callback.
 *
 * @param currentRole - Label for the user's current role shown in the badge.
 * @param onSignOut - Callback invoked when the Sign Out button is clicked.
 * @returns A JSX element representing the logged-in alert UI.
 */
export function LoggedInAlert({ currentRole, onSignOut }: LoggedInAlertProps) {
  return (
    <TooltipProvider>
      <Alert className={cn(
        "relative border-2 border-accent/30",
        "bg-gradient-mocha backdrop-blur-sm",
        "hover-lift hover-glow hover-scale",
        "transition-all duration-300 ease-spring",
        "shadow-xl overflow-hidden"
      )}>
        <CheckCircle className="h-5 w-5 text-accent" />
        <AlertDescription className="flex items-center justify-between w-full">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-accent/10 rounded-full blur-lg animate-pulse" />
          <div className="absolute bottom-0 left-0 w-8 h-8 bg-primary/10 rounded-full blur-md animate-pulse" />

          <div className="relative flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 border-2 border-accent/30">
                <AvatarFallback className="bg-accent/10 text-accent font-bold">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-foreground">Logged in as</span>
                  <Badge variant="secondary" className="font-bold px-3 py-1">
                    <User className="h-4 w-4 mr-1" />
                    {currentRole}
                  </Badge>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center space-x-2">
                  <Shield className="h-3 w-3 text-accent" />
                  <span className="text-xs text-muted-foreground font-medium">Authenticated Session</span>
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                </div>
              </div>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onSignOut}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "group h-10 px-4 border-2 border-destructive/30 hover:border-destructive/50",
                    "bg-destructive/10 hover:bg-destructive/20",
                    "hover-lift hover-glow hover-scale",
                    "transition-all duration-300 ease-spring",
                    "btn-brutalist",
                    "focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                  )}
                >
                  <LogOut className="h-4 w-4 mr-2 group-hover:rotate-12 transition-all duration-300" />
                  <span className="font-bold text-destructive">Sign Out</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>End your current session</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-accent w-0 group-hover:w-full transition-all duration-500 ease-spring" />
        </AlertDescription>
      </Alert>
    </TooltipProvider>
  );
}

export default LoggedInAlert;
