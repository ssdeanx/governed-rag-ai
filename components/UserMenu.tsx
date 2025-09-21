'use client';

import React from 'react';
import { User, LogOut, Settings, Shield, Crown, Eye, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { GovernedRAGLogo } from './GovernedRAGLogo';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  currentRole?: string;
  onSignOut?: () => void;
}

/**
 * Render a role-aware user menu with an access-level alert and dropdown actions.
 *
 * The component returns null when `currentRole` is falsy. When provided, `currentRole`
 * drives the displayed icon, label, color, progress bar, and access-status badge.
 * The dropdown includes a settings entry and a Sign Out action that calls `onSignOut`.
 *
 * @param currentRole - Role identifier (e.g., "tenant.admin" or "project.viewer"). Used to derive visual state (icon, label text, color classes), the numeric access progress, and the access-status badge.
 * @param onSignOut - Optional callback invoked when the user selects "Sign Out" from the menu.
 * @returns A JSX element containing the user status alert and dropdown menu, or `null` if `currentRole` is not provided.
 */
export function UserMenu({ currentRole, onSignOut }: UserMenuProps) {
  if (!currentRole) {
    return null;
  }

  const getRoleIcon = (role: string) => {
    if (role.includes('admin')) {
      return <Crown className="h-5 w-5 text-accent animate-pulse" />;
    }
    if (role.includes('viewer')) {
      return <Eye className="h-5 w-5 text-primary" />;
    }
    return <Shield className="h-5 w-5 text-accent" />;
  };

  const getRoleLabel = (role: string) => {
    return role.split('.').map(part =>
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

  const getRoleColor = (role: string) => {
    if (role.includes('admin')) {
      return 'text-accent';
    }
    if (role.includes('viewer')) {
      return 'text-primary';
    }
    return 'text-accent';
  };

  const getRoleProgress = (role: string) => {
    if (role.includes('admin')) {
      return 100;
    }
    if (role.includes('viewer')) {
      return 25;
    }
    return 75; // standard user
  };

  const getRoleStatus = (role: string) => {
    if (role.includes('admin')) {
      return 'Full Access';
    }
    if (role.includes('viewer')) {
      return 'Read Only';
    }
    return 'Standard Access';
  };

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* User Status Alert */}
        <Alert className="border-2 border-primary/20 bg-gradient-mocha/50 backdrop-blur-sm">
          <Activity className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                  {currentRole.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">Access Level:</span>
            </div>
            <Badge variant="secondary" className="bg-accent/20 text-accent">
              {getRoleStatus(currentRole)}
            </Badge>
          </AlertDescription>
        </Alert>

        <Separator className="bg-primary/20" />

        <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "group relative h-12 px-4 gap-3",
            "border-2 border-primary/30 hover:border-accent/50",
            "bg-gradient-mocha backdrop-blur-sm",
            "hover-lift hover-glow hover-scale",
            "transition-all duration-300 ease-spring",
            "btn-brutalist shadow-lg",
            "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          )}
          aria-label="User menu"
        >
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded-md bg-accent/10 group-hover:bg-accent/20 transition-colors duration-300">
              {getRoleIcon(currentRole)}
            </div>
            <span className={cn(
              "hidden sm:inline-block text-sm font-bold uppercase tracking-wider",
              getRoleColor(currentRole),
              "text-shadow-sm"
            )}>
              {getRoleLabel(currentRole)}
            </span>
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        sideOffset={8}
        align="end"
        className={cn(
          "min-w-[16rem] p-0",
          "border-4 border-primary/20",
          "bg-gradient-mocha backdrop-blur-xl",
          "shadow-2xl"
        )}
      >
        {/* Header Section */}
        <div className="px-6 py-4 border-b-2 border-primary/20 bg-accent/5">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
              {getRoleIcon(currentRole)}
            </div>
            <div className="flex flex-col flex-1">
              <span className={cn(
                "text-sm font-black brutalist-text",
                getRoleColor(currentRole),
                "text-shadow-lg"
              )}>
                {getRoleLabel(currentRole)}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Authenticated User
              </span>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Access Level</span>
                  <span>{getRoleProgress(currentRole)}%</span>
                </div>
                <Progress value={getRoleProgress(currentRole)} className="h-2" />
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-primary/20" />

        {/* Menu Items */}
        <div className="p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem className={cn(
                "group/item cursor-pointer px-4 py-3 rounded-lg",
                "hover-lift hover-glow hover-scale",
                "transition-all duration-300 ease-spring",
                "hover:bg-accent/20 border border-transparent hover:border-accent/30",
                "focus:bg-accent/20 focus:border-accent/30"
              )}>
                <Settings className="mr-3 h-5 w-5 transition-all duration-300 group-hover/item:rotate-90 group-hover/item:scale-110 text-foreground" />
                <span className="font-bold text-foreground group-hover/item:text-accent transition-colors duration-300">
                  Settings
                </span>
                <Badge variant="outline" className="ml-auto text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Config
                </Badge>
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>Access user settings and preferences</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuSeparator className="bg-primary/20 my-2" />

          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuItem
                onClick={onSignOut}
                className={cn(
                  "group/item cursor-pointer px-4 py-3 rounded-lg",
                  "text-destructive hover:text-destructive-foreground",
                  "hover-lift hover-glow hover-scale",
                  "transition-all duration-300 ease-spring",
                  "hover:bg-destructive/20 border border-transparent hover:border-destructive/30",
                  "focus:bg-destructive/20 focus:border-destructive/30"
                )}
              >
                <LogOut className="mr-3 h-5 w-5 transition-all duration-300 group-hover/item:scale-110 group-hover/item:-rotate-12 text-destructive" />
                <span className="font-bold">
                  Sign Out
                </span>
                <Badge variant="destructive" className="ml-auto text-xs">
                  Exit
                </Badge>
              </DropdownMenuItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign out of your account securely</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Decorative bottom element */}
        <div className="absolute bottom-2 right-2 w-4 h-4 bg-accent/20 rounded-full blur-sm animate-pulse" />
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
    </TooltipProvider>
  );
}
