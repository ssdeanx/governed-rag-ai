'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  BookOpen,
  Play,
  Shield,
  Code,
  Layers,
  Users,
  Home,
  ChevronRight,
  Github,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocsLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Overview', href: '/docs', icon: Home },
      { title: 'Quick Start', href: '/docs/quick-start', icon: Play },
    ]
  },
  {
    title: 'Core Concepts',
    items: [
      { title: 'Security Model', href: '/docs/security', icon: Shield },
      { title: 'Architecture', href: '/docs/architecture', icon: Layers },
      { title: 'API Reference', href: '/docs/api-reference', icon: Code },
    ]
  },
  {
    title: 'Examples & Guides',
    items: [
      { title: 'Demo Roles', href: '/docs/demo-roles', icon: Users },
      { title: 'Advanced Usage', href: '/docs/advanced', icon: BookOpen },
    ]
  }
]

/**
 * Layout component that renders the documentation page chrome: header, sticky sidebar navigation, and main content area.
 *
 * Renders a branded header with badges, a left sidebar built from the `navigation` data (section headings, link items with icons,
 * active-link highlighting based on the current pathname, and external resource links), and a right/main content pane that displays `children`.
 *
 * @param children - Page content to render inside the main documentation pane.
 * @returns A React element containing the full documentation layout.
 */
export function DocsLayout({ children }: DocsLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <Link href="/docs" className="flex items-center space-x-4 group">
              <div className="relative">
                <Shield className="h-12 w-12 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-ping" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Governed RAG Docs
                </h1>
                <p className="text-muted-foreground">Enterprise-grade AI with zero-trust security</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Shield className="h-3 w-3 mr-1" />
              Zero-Trust
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Users className="h-3 w-3 mr-1" />
              Role-Based
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Layers className="h-3 w-3 mr-1" />
              Multi-Agent
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Documentation</CardTitle>
                <CardDescription>Navigate through our guides</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {navigation.map((section) => (
                  <div key={section.title}>
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                          <Link key={item.href} href={item.href}>
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-start h-9 px-3 text-sm",
                                isActive && "bg-primary/10 text-primary font-medium"
                              )}
                            >
                              <Icon className="h-4 w-4 mr-2" />
                              {item.title}
                              {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                            </Button>
                          </Link>
                        )
                      })}
                    </div>
                    <Separator className="mt-4" />
                  </div>
                ))}

                {/* External Links */}
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                    Resources
                  </h3>
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start h-9 px-3 text-sm" asChild>
                      <Link href="https://github.com/ssdeanx/governed-rag-ai" target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start h-9 px-3 text-sm" asChild>
                      <Link href="https://mastra.ai" target="_blank" rel="noopener noreferrer">
                        <Shield className="h-4 w-4 mr-2" />
                        Mastra.ai
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="min-h-[600px]">
              <CardContent className="p-8">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  {children}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}