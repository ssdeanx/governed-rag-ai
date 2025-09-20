'use client';

import React from 'react';
import { Moon, Sun, Monitor, Palette, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/**
 * Theme toggle UI component that displays the current theme and lets the user switch between
 * system, light, and dark modes.
 *
 * Renders a status Alert showing an avatar and badge for the active theme, and a themed icon
 * button that opens a dropdown with "System", "Light", and "Dark" options. Uses `useTheme()`
 * to read and update the app theme and tracks a mounted flag to avoid hydration mismatches
 * (renders a disabled placeholder before mount).
 *
 * Accessibility:
 * - The toggle button has an `aria-label="Toggle theme"`.
 *
 * Side effects:
 * - Calls `setTheme('system' | 'light' | 'dark')` when a menu item is selected.
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled className="h-12 w-12">
        <Monitor className="h-5 w-5" />
      </Button>
    );
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon className="h-5 w-5 transition-all duration-700 ease-out rotate-0 scale-100 hover:scale-115 hover:rotate-15 text-shadow-lg" />;
      case 'light':
        return <Sun className="h-5 w-5 transition-all duration-700 ease-out rotate-0 scale-100 hover:scale-115 hover:rotate-180 text-shadow-lg" />;
      case 'system':
        return <Monitor className="h-5 w-5 transition-all duration-700 ease-out rotate-0 scale-100 hover:scale-115 text-shadow-lg" />;
      case undefined:
        return <Monitor className="h-5 w-5 transition-all duration-700 ease-out rotate-0 scale-100 hover:scale-115 text-shadow-lg" />;
      default:
        return <Monitor className="h-5 w-5 transition-all duration-700 ease-out rotate-0 scale-100 hover:scale-115 text-shadow-lg" />;
    }
  };

  const getThemeAvatar = () => {
    switch (theme) {
      case 'dark':
        return <Avatar className="h-8 w-8 bg-slate-900 border-2 border-accent"><AvatarFallback className="bg-slate-900 text-accent"><Moon className="h-4 w-4" /></AvatarFallback></Avatar>;
      case 'light':
        return <Avatar className="h-8 w-8 bg-yellow-100 border-2 border-primary"><AvatarFallback className="bg-yellow-100 text-primary"><Sun className="h-4 w-4" /></AvatarFallback></Avatar>;
      case 'system':
        return <Avatar className="h-8 w-8 bg-gradient-to-br from-slate-900 to-yellow-100 border-2 border-accent"><AvatarFallback className="bg-gradient-to-br from-slate-900 to-yellow-100 text-accent"><Monitor className="h-4 w-4" /></AvatarFallback></Avatar>;
      default:
        return <Avatar className="h-8 w-8 bg-gradient-to-br from-slate-900 to-yellow-100 border-2 border-accent"><AvatarFallback className="bg-gradient-to-br from-slate-900 to-yellow-100 text-accent"><Monitor className="h-4 w-4" /></AvatarFallback></Avatar>;
    }
  };

  const getThemeBadge = () => {
    switch (theme) {
      case 'dark':
        return <Badge variant="secondary" className="bg-slate-900 text-accent border-accent">Dark Mode</Badge>;
      case 'light':
        return <Badge variant="secondary" className="bg-yellow-100 text-primary border-primary">Light Mode</Badge>;
      case 'system':
        return <Badge variant="secondary" className="bg-gradient-to-r from-slate-900 to-yellow-100 text-accent border-accent">System</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gradient-to-r from-slate-900 to-yellow-100 text-accent border-accent">Auto</Badge>;
    }
  };

  return (
    <TooltipProvider>
      <div className="app-container space-y-3">
        {/* Theme Status Alert */}
        <Alert className="border-2 border-primary/20 bg-gradient-mocha/50 backdrop-blur-sm">
          <Palette className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="font-medium">Current Theme:</span>
            <div className="flex items-center space-x-2">
              {getThemeAvatar()}
              {getThemeBadge()}
            </div>
          </AlertDescription>
        </Alert>

        <Separator className="bg-primary/20" />

        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "group relative h-12 w-12 border-2 border-primary/30 hover:border-accent/50",
                    "bg-gradient-mocha backdrop-blur-sm",
                    "hover-lift hover-glow hover-scale",
                    "transition-all duration-500 ease-spring",
                    "btn-brutalist shadow-lg",
                    "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  )}
                  aria-label="Toggle theme"
                >
                  {getThemeIcon()}
                  <span className="sr-only">Toggle theme</span>
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                sideOffset={8}
                align="end"
                className={cn(
                  "min-w-[180px] p-2 border-4 border-primary/20",
                  "bg-gradient-mocha backdrop-blur-xl",
                  "shadow-2xl"
                )}
              >
                <DropdownMenuItem
                  onClick={() => setTheme('system')}
                  className={cn(
                    "group/item cursor-pointer px-4 py-3 rounded-lg",
                    "hover-lift hover-glow hover-scale",
                    "transition-all duration-300 ease-spring",
                    "hover:bg-accent/20 border border-transparent hover:border-accent/30",
                    "focus:bg-accent/20 focus:border-accent/30"
                  )}
                >
                  <Monitor className="mr-3 h-5 w-5 transition-all duration-300 group-hover/item:rotate-6 group-hover/item:scale-110 text-foreground" />
                  <span className="font-bold text-foreground group-hover/item:text-accent transition-colors duration-300">
                    System
                  </span>
                  {theme === 'system' && <span className="ml-auto text-xs opacity-60 font-black">•</span>}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setTheme('light')}
                  className={cn(
                    "group/item cursor-pointer px-4 py-3 rounded-lg",
                    "hover-lift hover-glow hover-scale",
                    "transition-all duration-300 ease-spring",
                    "hover:bg-primary/20 border border-transparent hover:border-primary/30",
                    "focus:bg-primary/20 focus:border-primary/30"
                  )}
                >
                  <Sun className="mr-3 h-5 w-5 transition-all duration-300 group-hover/item:rotate-180 group-hover/item:scale-110 text-foreground" />
                  <span className="font-bold text-foreground group-hover/item:text-primary transition-colors duration-300">
                    Light
                  </span>
                  {theme === 'light' && <span className="ml-auto text-xs opacity-60 font-black">•</span>}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "group/item cursor-pointer px-4 py-3 rounded-lg",
                    "hover-lift hover-glow hover-scale",
                    "transition-all duration-300 ease-spring",
                    "hover:bg-accent/20 border border-transparent hover:border-accent/30",
                    "focus:bg-accent/20 focus:border-accent/30"
                  )}
                >
                  <Moon className="mr-3 h-5 w-5 transition-all duration-300 group-hover/item:rotate-12 group-hover/item:scale-110 text-foreground" />
                  <span className="font-bold text-foreground group-hover/item:text-accent transition-colors duration-300">
                    Dark
                  </span>
                  {theme === 'dark' && <span className="ml-auto text-xs opacity-60 font-black">•</span>}
                </DropdownMenuItem>

                {/* Decorative bottom element */}
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-accent/20 rounded-full blur-sm animate-pulse" />
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to change theme</p>
          </TooltipContent>
        </Tooltip>
    </div>
  </TooltipProvider>
  );
}
