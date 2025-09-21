'use client';

import React from 'react';
import { ExternalLink, Github, BookOpen, Shield, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { GovernedRAGLogo } from './GovernedRAGLogo';

/**
 * Site footer React component used across the app.
 *
 * Renders a styled, responsive footer containing the brand block (logo, title, description, badges),
 * three configurable link sections (Documentation, Resources, Legal) with tooltip-enhanced link items,
 * and a bottom action row with copyright and quick-action icon links (GitHub, Documentation).
 *
 * External links in the sections open in a new tab and display an "Opens in new tab" tooltip;
 * internal/anchor links show "Navigate to section". The displayed year is derived from the system clock.
 *
 * @returns The footer as a JSX element.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Documentation',
      links: [
        { label: 'Getting Started', href: '#docs/getting-started' },
        { label: 'API Reference', href: '#docs/api' },
        { label: 'Examples', href: '#docs/examples' },
        { label: 'Security Guide', href: '#docs/security' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Mastra Framework', href: 'https://mastra.ai', external: true },
        { label: 'GitHub Repository', href: 'https://github.com/mastra-ai', external: true },
        { label: 'Community', href: 'https://discord.gg/mastra', external: true },
        { label: 'Support', href: '#support' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#privacy' },
        { label: 'Terms of Service', href: '#terms' },
        { label: 'Security Policy', href: '#security-policy' },
        { label: 'Compliance', href: '#compliance' },
      ]
    }
  ];

  return (
    <TooltipProvider>
      <footer className="relative w-full border-t-4 border-primary/20 bg-gradient-mocha backdrop-blur-xl supports-[backdrop-filter]:bg-gradient-mocha/95 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-accent opacity-5" />
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse" />

        <div className="relative app-container py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="space-y-6 group hover-lift">
              <div className="flex items-center space-x-4 group hover-lift">
                <Avatar className="h-14 w-14 border-2 border-accent/30">
                  <AvatarFallback className="bg-accent/10 text-accent font-bold">
                    <GovernedRAGLogo className="h-7 w-7" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-maximalist text-primary brutalist-text text-shadow-xl">
                    Governed RAG
                  </span>
                  <span className="text-bold-serif text-muted-foreground -mt-2 text-sm">
                    Secure AI with Mastra
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Enterprise-grade secure RAG with role-based access control, powered by Mastra multi-agent framework.
              </p>

              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="font-bold">
                  <Shield className="h-4 w-4 mr-1" />
                  Version 1.0.0
                </Badge>
                <Separator orientation="vertical" className="h-6" />
                <Badge variant="outline" className="font-bold">
                  <Zap className="h-4 w-4 mr-1" />
                  Built with Mastra
                </Badge>
              </div>
            </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-6 group">
              <h3 className="text-bold-serif text-foreground font-black text-lg brutalist-text text-shadow-lg">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={link.href}
                          className={cn(
                            "group/link flex items-center space-x-3",
                            "text-sm text-muted-foreground hover:text-foreground",
                            "transition-all duration-300 ease-spring",
                            "rounded-lg px-4 py-3 hover:bg-accent/20",
                            "hover-lift hover-glow hover-scale",
                            "border border-transparent hover:border-accent/30",
                            "relative overflow-hidden"
                          )}
                          target={link.external === true ? '_blank' : undefined}
                          rel={link.external === true ? 'noopener noreferrer' : undefined}
                        >
                          <span className="font-medium relative z-10">{link.label}</span>
                          {link.external === true && (
                            <ExternalLink className="h-4 w-4 opacity-0 group-hover/link:opacity-100 transition-all duration-300 text-accent hover-scale" />
                          )}
                          <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover/link:opacity-5 transition-opacity duration-300 rounded-lg" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{link.external ? 'Opens in new tab' : 'Navigate to section'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t-2 border-primary/20 flex flex-col sm:flex-row justify-between items-center space-y-6 sm:space-y-0">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            <span className="font-semibold">© {currentYear} Governed RAG.</span> Built with{' '}
            <a
              href="https://mastra.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 transition-all duration-300 font-bold hover-glow hover-lift inline-flex items-center space-x-1"
            >
              <span>Mastra</span>
              <Zap className="h-3 w-3" />
            </a>
            <span className="text-accent">.</span>
          </div>

          <div className="flex items-center space-x-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://github.com/mastra-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group btn-brutalist inline-flex items-center justify-center",
                    "h-12 w-12 bg-background border-2 border-primary/30",
                    "hover:border-accent hover:bg-accent/10",
                    "transition-all duration-300 ease-spring",
                    "hover-lift hover-glow hover-scale",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  )}
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 text-foreground" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>View source code on GitHub</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="#docs"
                  className={cn(
                    "group btn-brutalist inline-flex items-center justify-center",
                    "h-12 w-12 bg-background border-2 border-primary/30",
                    "hover:border-primary hover:bg-primary/10",
                    "transition-all duration-300 ease-spring",
                    "hover-lift hover-glow hover-scale",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  )}
                  aria-label="Documentation"
                >
                  <BookOpen className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12 text-foreground" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Read the documentation</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Decorative bottom elements */}
        <div className="absolute bottom-4 left-8 w-8 h-8 bg-accent/20 rounded-full blur-lg animate-pulse" />
        <div className="absolute bottom-4 right-8 w-6 h-6 bg-primary/20 rounded-full blur-md animate-pulse" />
      </div>
    </footer>
    </TooltipProvider>
  );
}
