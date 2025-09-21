'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { GovernedRAGLogo } from './GovernedRAGLogo';

interface TopNavigationProps {
  children?: React.ReactNode;
  currentRole?: string;
  onSignOut?: () => void;
}

/**
 * Responsive top navigation header for the app with branding, status, and navigation controls.
 *
 * Renders a desktop-oriented header with logo, app title, an active-route alert, and a horizontal
 * navigation bar with tooltips. On small screens it shows a compact branding block and a mobile
 * menu button that opens a right-side sheet containing the same navigation items. Navigation items
 * call `handleNavigation` which updates `window.location.href` and closes the mobile menu.
 *
 * @param children - Optional content rendered on the right side of the header (e.g., user menu or actions).
 * @returns The top navigation JSX element.
 */
export function TopNavigation({ children }: TopNavigationProps) {
  const navigationLinks = [
    { href: '#chat', label: 'Chat', active: true },
    { href: '#indexing', label: 'Indexing', active: false },
    { href: '/docs', label: 'Documentation', active: true },
  ];

  const handleNavigation = (href: string) => {
    if (href.startsWith('/')) {
      window.location.href = href;
    } else if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <TooltipProvider>
      {/* Single layer navbar */}
      <header className="sticky top-0 z-50 w-full h-16 border-b-4 border-primary/20 bg-gradient-mocha backdrop-blur-xl flex items-center justify-between px-4 shadow-2xl">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <GovernedRAGLogo className="text-primary" />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">Deamachines</span>
            <span className="text-xs text-muted-foreground -mt-1">AI Solutions</span>
          </div>
        </div>

        {/* Navigation Status Alert */}
        <Alert className="border border-accent/30 bg-card/50 backdrop-blur-sm max-w-xs">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="bg-accent text-accent-foreground text-xs">NAV</AvatarFallback>
          </Avatar>
          <AlertDescription className="text-sm">
            <span className="font-medium">Active:</span>
            <Badge variant="secondary" className="ml-2 bg-accent/20 text-accent">
              {navigationLinks.find(link => link.active)?.label || 'Home'}
            </Badge>
          </AlertDescription>
        </Alert>

        {/* Navigation */}
        <nav className="flex items-center space-x-2">
          {navigationLinks.map((link) => (
            <Tooltip key={link.href}>
              <TooltipTrigger asChild>
                <Button
                  variant={link.active ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation(link.href)}
                  className={cn(
                    "relative px-3 py-2 h-8 text-xs font-bold uppercase tracking-wider",
                    "transition-all duration-300 ease-spring",
                    "hover-lift hover-glow hover-scale",
                    link.active && "btn-brutalist bg-primary text-primary-foreground shadow-xl",
                    !link.active && "btn-gradient hover:bg-accent/20"
                  )}
                >
                  <span className={cn(
                    "relative z-10",
                    link.active && "text-shadow-lg",
                    !link.active && "text-foreground"
                  )}>
                    {link.label}
                  </span>
                  {link.active && (
                    <>
                      <Badge variant="secondary" className="ml-2 bg-accent/20 text-accent text-xs">
                        Active
                      </Badge>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-accent rounded-full animate-pulse" />
                    </>
                  )}
                  {!link.active && (
                    <div className="absolute inset-0 bg-gradient-accent opacity-0 hover:opacity-10 transition-opacity duration-300 rounded-md" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Navigate to {link.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>

        {/* Right side content */}
        <div className="flex items-center space-x-3">
          {children}
        </div>
      </header>
    </TooltipProvider>
  );
}
