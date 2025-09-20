'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationLinks = [
    { href: '#chat', label: 'Chat', active: true },
    { href: '#indexing', label: 'Indexing', active: false },
    { href: '/docs', label: 'Documentation', active: true },
  ];

  const handleNavigation = (href: string) => {
    // Handle navigation logic here
    window.location.href = href;
    setMobileMenuOpen(false);
  };

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b-4 border-primary/20 bg-gradient-mocha backdrop-blur-xl supports-[backdrop-filter]:bg-gradient-mocha/90 shadow-2xl">
        <div className="app-container">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Title - Desktop */}
            <div className="hidden md:flex items-center space-x-4 group hover-lift">
              <div className="brutalist-card p-2 hover-scale">
                <GovernedRAGLogo className="text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-maximalist text-primary brutalist-text text-shadow-xl">
                  Governed RAG
                </span>
                <span className="text-bold-serif text-muted-foreground -mt-2 text-sm">
                  Secure AI with Mastra
                </span>
              </div>
            </div>

            {/* Navigation Status Alert */}
            <Alert className="hidden lg:flex border-2 border-accent/20 bg-gradient-mocha/50 backdrop-blur-sm max-w-xs">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                  NAV
                </AvatarFallback>
              </Avatar>
              <AlertDescription className="text-sm">
                <span className="font-medium">Active:</span>
                <Badge variant="secondary" className="ml-2 bg-accent/20 text-accent">
                  {navigationLinks.find(link => link.active)?.label || 'Home'}
                </Badge>
              </AlertDescription>
            </Alert>

          {/* Mobile Logo */}
          <div className="flex md:hidden items-center space-x-3 group hover-lift">
            <div className="brutalist-card p-1.5 hover-scale">
              <GovernedRAGLogo size="sm" className="text-primary" />
            </div>
            <span className="text-xl font-black text-primary brutalist-text text-shadow-lg">
              Governed RAG
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigationLinks.map((link) => (
              <Tooltip key={link.href}>
                <TooltipTrigger asChild>
                  <Button
                    variant={link.active ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleNavigation(link.href)}
                    className={cn(
                      "relative px-6 py-3 h-12 text-sm font-bold uppercase tracking-wider",
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

          {/* Right side content and Mobile Menu */}
          <div className="flex items-center space-x-3">
            {children}

            {/* Mobile Menu Button - Only show on mobile */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden h-12 w-12 btn-brutalist hover-scale"
                      aria-label="Toggle mobile menu"
                    >
                      <Menu className="h-6 w-6 transition-transform duration-300 hover:rotate-90" />
                      <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-accent text-accent-foreground text-xs">
                        {navigationLinks.filter(link => link.active).length}
                      </Badge>
                    </Button>
                  </SheetTrigger>

                  <SheetContent side="right" className="w-[320px] sm:w-[400px] bg-gradient-mocha border-l-4 border-primary">
                    <div className="flex items-center space-x-4 mb-8 group hover-lift">
                      <div className="brutalist-card p-2 hover-scale">
                        <GovernedRAGLogo className="text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-2xl font-black brutalist-text text-primary text-shadow-xl">
                          Governed RAG
                        </span>
                        <span className="text-bold-serif text-muted-foreground text-sm">
                          Secure AI with Mastra
                        </span>
                      </div>
                    </div>

                    <Separator className="bg-primary/20 mb-6" />

                    <nav className="flex flex-col space-y-4">
                      {navigationLinks.map((link) => (
                        <Tooltip key={link.href}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={link.active ? "default" : "ghost"}
                              onClick={() => handleNavigation(link.href)}
                              className={cn(
                                "justify-start h-14 px-6 text-left",
                                "transition-all duration-300 ease-spring",
                                "hover-lift hover-glow hover-scale",
                                link.active && "btn-brutalist bg-primary text-primary-foreground shadow-xl",
                                !link.active && "btn-gradient hover:bg-accent/20"
                              )}
                            >
                              <span className={cn(
                                "font-bold uppercase tracking-wider",
                                link.active && "text-shadow-lg",
                                !link.active && "text-foreground"
                              )}>
                                {link.label}
                              </span>
                              {link.active && (
                                <Badge variant="secondary" className="ml-2 bg-accent/20 text-accent text-xs">
                                  Active
                                </Badge>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p>Go to {link.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </nav>

                    {/* Mobile decorative element */}
                    <div className="absolute bottom-8 right-8 w-16 h-16 bg-accent/10 rounded-full blur-xl animate-pulse" />
                  </SheetContent>
                </Sheet>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open navigation menu</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="h-1 bg-gradient-accent" />
    </header>
    </TooltipProvider>
  );
}
