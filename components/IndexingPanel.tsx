'use client';

import React from 'react';
import { Database, Loader, CheckCircle, XCircle, AlertTriangle, FileText, Zap, Shield } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';

interface IndexingPanelProps {
  jwt: string;
}

interface IndexingResult {
  success: boolean;
  indexed: number;
  failed: number;
  totalDocuments?: number;
  progress?: number;
  documents: Array<{
    docId: string;
    status: string;
    chunks?: number;
    error?: string;
    classification?: string;
    size?: number;
  }>;
}

/**
 * Panel UI for triggering and displaying the progress/results of indexing corpus documents.
 *
 * Renders a card with a control to start indexing, a progress indicator, summary alerts for success or error,
 * and collapsible sections showing per-document results and security information.
 *
 * The Start Indexing button issues a POST to `/api/index` with the provided JWT and visualizes progress
 * (including a simulated progress animation) while the request completes.
 *
 * @param jwt - JSON Web Token used to authenticate the indexing request sent to `/api/index`.
 * @returns A React element containing the indexing control and result UI.
 */
export default function IndexingPanel({ jwt }: IndexingPanelProps) {
  const [isIndexing, setIsIndexing] = useState(false);
  const [result, setResult] = useState<IndexingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const handleIndex = useCallback(async () => {
    setIsIndexing(true);
    setResult(null);
    setError(null);
    setProgress(0);

    try {
      const response: Response = await fetch('/api/index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jwt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to start indexing');
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // Complete progress when done
      setTimeout(() => {
        setProgress(100);
        clearInterval(progressInterval);
      }, 2000);

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProgress(0);
    } finally {
      setIsIndexing(false);
    }
  }, [jwt]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  return (
    <TooltipProvider>
      <Card className={cn(
        "relative overflow-hidden",
        "border-4 border-primary/20 bg-gradient-mocha backdrop-blur-xl",
        "brutalist-card shadow-2xl"
      )}>
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse" />

        <CardHeader className="relative pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 group hover-lift">
              <Avatar className="h-14 w-14 border-2 border-accent/30">
                <AvatarFallback className="bg-accent/10 text-accent font-bold">
                  <Database className="h-7 w-7" />
                </AvatarFallback>
              </Avatar>
              <div className="p-3 rounded-xl bg-accent/10 border-2 border-accent/20 group-hover:bg-accent/20 transition-all duration-300 hover-scale">
                <Database className="h-7 w-7 text-accent" />
              </div>
              <div>
                <CardTitle className="text-maximalist text-primary brutalist-text text-shadow-xl">
                  Document Indexing
                </CardTitle>
                <CardDescription className="text-bold-serif text-muted-foreground text-base">
                  Index corpus documents for RAG
                </CardDescription>
              </div>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleIndex}
                  disabled={isIndexing}
                  size="lg"
                  className={cn(
                    "group h-12 px-6 border-2 border-primary/30 hover:border-accent/50",
                    "bg-gradient-mocha backdrop-blur-sm",
                    "hover-lift hover-glow hover-scale",
                    "transition-all duration-300 ease-spring",
                    "btn-brutalist shadow-lg",
                    "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isIndexing ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin mr-2" />
                      <span className="font-bold text-shadow-sm">Indexing...</span>
                    </>
                  ) : (
                    <>
                      <Database className="h-5 w-5 mr-2 group-hover:rotate-12 transition-all duration-300" />
                      <span className="font-bold text-shadow-sm">Start Indexing</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Index all documents in the corpus with security classifications</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Progress Bar */}
          {(isIndexing || progress > 0) && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-muted-foreground">Indexing Progress</span>
                <Badge variant="secondary" className="font-bold">
                  {Math.round(progress)}%
                </Badge>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          )}
        </CardHeader>

      <CardContent className="relative">
        {/* Error State */}
        {error && (
          <Alert className="mb-6 border-2 border-destructive/30 bg-destructive/10">
            <XCircle className="h-5 w-5 text-destructive" />
            <AlertDescription className="text-destructive font-bold">
              <div className="flex items-center justify-between">
                <span>Error: {error}</span>
                <Badge variant="destructive" className="ml-2">
                  Failed
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Result */}
        {result && (
          <div className="space-y-6">
            <Alert className="border-2 border-accent/30 bg-accent/10">
              <CheckCircle className="h-5 w-5 text-accent" />
              <AlertDescription className="text-accent font-bold">
                <div className="flex items-center justify-between">
                  <span>Indexing completed successfully</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="font-bold">
                      {result.indexed} indexed
                    </Badge>
                    {result.failed > 0 && (
                      <Badge variant="destructive" className="font-bold">
                        {result.failed} failed
                      </Badge>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Document Results */}
            {result.documents.length > 0 && (
              <div className="space-y-4">
                <Separator className="my-4" />
                <Collapsible
                  open={expandedSections.has('documents')}
                  onOpenChange={() => toggleSection('documents')}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border-2 border-primary/20 rounded-lg hover:border-accent/40 transition-all duration-300">
                    <h4 className="text-bold-serif text-foreground font-black text-lg brutalist-text text-shadow-lg">
                      Document Results ({result.documents.length})
                    </h4>
                    <Badge variant="outline" className="font-bold">
                      {expandedSections.has('documents') ? 'Collapse' : 'Expand'}
                    </Badge>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {result.documents.map((doc, index) => (
                        <HoverCard key={index}>
                          <HoverCardTrigger asChild>
                            <div
                              className={cn(
                                "flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer",
                                "hover-lift hover-scale transition-all duration-300",
                                "bg-gradient-mocha backdrop-blur-sm",
                                doc.status === 'success'
                                  ? 'border-accent/30 hover:border-accent/50'
                                  : 'border-destructive/30 hover:border-destructive/50'
                              )}
                            >
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className={cn(
                                    "text-xs font-bold",
                                    doc.status === 'success'
                                      ? 'bg-accent/10 text-accent'
                                      : 'bg-destructive/10 text-destructive'
                                  )}>
                                    {doc.status === 'success' ? (
                                      <CheckCircle className="h-4 w-4" />
                                    ) : (
                                      <XCircle className="h-4 w-4" />
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="text-foreground font-bold break-all block">{doc.docId}</span>
                                  {doc.classification && (
                                    <Badge
                                      variant={doc.classification === 'confidential' ? 'destructive' : 'secondary'}
                                      className="text-xs mt-1"
                                    >
                                      {doc.classification}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-muted-foreground font-medium text-right">
                                {doc.status === 'success' && doc.chunks ? (
                                  <div className="flex items-center text-accent">
                                    <FileText className="h-4 w-4 mr-1" />
                                    <span className="font-bold">{doc.chunks} chunks</span>
                                  </div>
                                ) : doc.error ? (
                                  <span className="text-destructive text-xs font-bold">
                                    Failed
                                  </span>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    {doc.status}
                                  </Badge>
                                )}
                                {doc.size && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {doc.size} KB
                                  </div>
                                )}
                              </div>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-bold">{doc.docId}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant={doc.status === 'success' ? 'secondary' : 'destructive'}>
                                  {doc.status}
                                </Badge>
                                {doc.classification && (
                                  <Badge variant={doc.classification === 'confidential' ? 'destructive' : 'secondary'}>
                                    {doc.classification}
                                  </Badge>
                                )}
                              </div>
                              {doc.chunks && (
                                <p className="text-sm text-muted-foreground">
                                  Indexed into {doc.chunks} chunks
                                </p>
                              )}
                              {doc.error && (
                                <p className="text-sm text-destructive">
                                  Error: {doc.error}
                                </p>
                              )}
                              {doc.size && (
                                <p className="text-sm text-muted-foreground">
                                  Size: {doc.size} KB
                                </p>
                              )}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </div>
        )}

        {/* Information Section */}
        <Separator className="my-6" />
        <Collapsible
          open={expandedSections.has('info')}
          onOpenChange={() => toggleSection('info')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border-2 border-primary/20 rounded-lg hover:border-accent/40 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-accent" />
              <span className="font-bold text-foreground">Security Information</span>
            </div>
            <Badge variant="outline" className="font-bold">
              {expandedSections.has('info') ? 'Hide' : 'Show'}
            </Badge>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <Alert className="border-2 border-primary/20 bg-primary/5">
              <Shield className="h-5 w-5 text-primary" />
              <AlertDescription className="text-muted-foreground leading-relaxed">
                <p className="font-bold text-foreground mb-3">This will index all documents in the corpus folder with appropriate security classifications:</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <Shield className="h-4 w-4 text-destructive" />
                    <div>
                      <Badge variant="destructive" className="mb-1">HR/Confidential files</Badge>
                      <p className="text-sm text-muted-foreground">Admin access only</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <Shield className="h-4 w-4 text-primary" />
                    <div>
                      <Badge variant="secondary" className="mb-1">Finance/Policy files</Badge>
                      <p className="text-sm text-muted-foreground">Manager+ access</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/5 border border-accent/20">
                    <Shield className="h-4 w-4 text-accent" />
                    <div>
                      <Badge variant="outline" className="mb-1">Other files</Badge>
                      <p className="text-sm text-muted-foreground">All employee access</p>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </CollapsibleContent>
        </Collapsible>

        {/* Decorative bottom elements */}
        <div className="absolute bottom-4 left-8 w-6 h-6 bg-accent/20 rounded-full blur-lg animate-pulse" />
        <div className="absolute bottom-4 right-8 w-4 h-4 bg-primary/20 rounded-full blur-md animate-pulse" />
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}
