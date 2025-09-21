'use client';

import React from 'react';
import {
  Shield,
  MessageSquare,
  Database,
  FileText,
  Settings,
  Home,
  User,
  Activity,
  Zap
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  active?: boolean;
  badge?: string;
}

interface AppSidebarProps {
  currentRole?: string;
  onNavigate?: (itemId: string) => void;
}

/**
 * Sidebar component that renders application navigation, progress indicators, and role info.
 *
 * Renders a collapsible sidebar with navigation items (Home, Chat Interface, Document Indexing, Documentation),
 * a navigation progress alert (percentage of items marked active), a footer showing the current role with an
 * access progress bar, and a Settings entry. Clicking a navigation item calls `onNavigate` with that item's `id`
 * if the callback is provided.
 *
 * currentRole is used to display an avatar initial and compute a role-based access percentage:
 * - empty/undefined -> 0%
 * - contains "admin" -> 100%
 * - contains "viewer" -> 25%
 * - any other non-empty role -> 75%
 *
 * @param currentRole - Optional role string displayed in the footer (dots replaced with spaces when shown).
 * @param onNavigate - Optional callback invoked with the selected navigation item's `id` when an item is clicked.
 * @returns The sidebar JSX element.
 */
export function AppSidebar({
  currentRole,
  onNavigate
}: AppSidebarProps) {
  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      href: '#home',
      active: true,
    },
    {
      id: 'chat',
      label: 'Chat Interface',
      icon: MessageSquare,
      href: '#chat',
      active: false,
    },
    {
      id: 'indexing',
      label: 'Document Indexing',
      icon: Database,
      href: '#indexing',
      active: false,
    },
    {
      id: 'docs',
      label: 'Documentation',
      icon: FileText,
      href: '#docs',
      active: false,
    },
  ];

  const handleItemClick = (item: NavigationItem) => {
    if (onNavigate) {
      onNavigate(item.id);
    }
  };

  const getNavigationProgress = () => {
    const activeCount = navigationItems.filter(item => item.active).length;
    return (activeCount / navigationItems.length) * 100;
  };

  const getRoleProgress = (role?: string) => {
    if (!role) {
      return 0;
    }
    if (role.includes('admin')) {
      return 100;
    }
    if (role.includes('viewer')) {
      return 25;
    }
    return 75;
  };

  return (
    <TooltipProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex-center space-x-2 px-2">
            <Shield className="h-4 w-4 text-primary size-fit" />
            <div className="flex flex-col">
              <span className="text-sm font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Governed RAG
              </span>
              <span className="text-xs text-muted-foreground">
                Secure AI Platform
              </span>
            </div>
          </div>

          {/* Navigation Progress Alert */}
          <Alert className="mt-3 border border-primary/20 bg-gradient-mocha/30 backdrop-blur-sm">
            <Activity className="h-3 w-3" />
            <AlertDescription className="text-xs">
              <div className="flex justify-between mb-1">
                <span>Navigation</span>
                <span>{Math.round(getNavigationProgress())}%</span>
              </div>
              <Progress value={getNavigationProgress()} className="h-1" />
            </AlertDescription>
          </Alert>
        </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger asChild>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => handleItemClick(item)}
                          isActive={item.active}
                          tooltip={item.label}
                        >
                          <Icon />
                          <span>{item.label}</span>
                          {item.active && (
                            <Badge variant="secondary" className="ml-auto bg-accent/20 text-accent text-xs">
                              Active
                            </Badge>
                          )}
                          {item.badge && item.badge.length > 0 && (
                            <Badge variant="outline" className="ml-auto text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.active ? `Currently on ${item.label}` : `Navigate to ${item.label}`}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {currentRole && currentRole.trim().length > 0 && (
          <div className="mb-3 p-2 rounded-md bg-muted">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                  {currentRole.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1">
                <span className="text-xs font-medium">Current Role</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {currentRole.replace('.', ' ')}
                </span>
                <div className="mt-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Access</span>
                    <span>{getRoleProgress(currentRole)}%</span>
                  </div>
                  <Progress value={getRoleProgress(currentRole)} className="h-1" />
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator className="bg-primary/20 mb-2" />

        <SidebarMenu>
          <SidebarMenuItem>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton tooltip="Settings">
                  <Settings />
                  <span>Settings</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    <Zap className="h-3 w-3" />
                  </Badge>
                </SidebarMenuButton>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Access application settings</p>
              </TooltipContent>
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
    </TooltipProvider>
  );
}
