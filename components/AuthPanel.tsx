'use client';

import React from 'react';
import { SignJWT } from 'jose';
import { Key, Lock, Shield, Crown, Eye, Zap, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AuthPanelProps {
  onAuth: (jwt: string, role: string) => void;
}

const DEMO_ROLES = [
  {
    id: 'finance',
    name: 'Finance Viewer',
    description: 'Access to finance policies and procedures',
    roles: ['finance.viewer'],
    classification: 'internal',
    icon: '💰',
    color: 'blue'
  },
  {
    id: 'engineering',
    name: 'Engineering Admin',
    description: 'Full access to engineering documentation',
    roles: ['engineering.admin'],
    classification: 'internal',
    icon: '⚙️',
    color: 'green'
  },
  {
    id: 'hr',
    name: 'HR Admin (Step-Up)',
    description: 'Access to confidential HR information',
    roles: ['hr.admin'],
    classification: 'confidential',
    stepUp: true,
    icon: '👥',
    color: 'red'
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Cross-department access',
    roles: ['finance.admin', 'engineering.viewer', 'hr.viewer'],
    classification: 'internal',
    icon: '👔',
    color: 'purple'
  }
];

/**
 * Role-based authentication UI component that lets a user pick a demo role, simulates an authentication progress,
 * generates a signed JWT for that role, and invokes `onAuth` with the resulting token and role name.
 *
 * The component displays a card-based selection UI with role metadata, shows a progress bar while "authenticating",
 * and creates a JWT (HS256) with a 2-hour expiration using `NEXT_PUBLIC_JWT_SECRET` (falls back to `"dev-secret"`).
 * Errors during token generation are swallowed and do not surface in the UI.
 *
 * @param onAuth - Callback invoked after successful JWT generation with signature `(jwt: string, roleName: string)`.
 * @returns A React element rendering the authentication panel.
 */
export default function AuthPanel({ onAuth }: AuthPanelProps) {
  const [selectedRole, setSelectedRole] = useState<typeof DEMO_ROLES[0] | null>(null);
  const [loading, setLoading] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);

  const generateJWT = useCallback(async (role: typeof DEMO_ROLES[0]) => {
    setLoading(true);
    setAuthProgress(0);

    // Simulate progress steps
    const progressSteps = [25, 50, 75, 100];
    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setAuthProgress(step);
    }

    try {
      const secret: Uint8Array = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET ?? 'dev-secret');

      const jwt = await new SignJWT({
        sub: `demo-user-${role.id}@example.com`,
        roles: ["employee", ...role.roles], // Add base employee role for all users
        tenant: 'acme',
        stepUp: role.stepUp ?? false,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(secret);

      onAuth(jwt, role.name);
    } catch {
      // Just handle the error silently - no need to log in UI component
    } finally {
      setLoading(false);
      setAuthProgress(0);
    }
  }, [onAuth]);

  const getRoleIcon = (role: typeof DEMO_ROLES[0]) => {
    switch (role.id) {
      case 'hr':
        return <Crown className="h-6 w-6 text-accent animate-pulse" />;
      case 'executive':
        return <Shield className="h-6 w-6 text-primary" />;
      case 'engineering':
        return <Zap className="h-6 w-6 text-accent" />;
      case 'finance':
        return <Eye className="h-6 w-6 text-primary" />;
      default:
        return <Lock className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <TooltipProvider>
      <div className="app-container">
        <Card className="relative overflow-hidden border-4 border-primary/20 bg-gradient-mocha backdrop-blur-xl brutalist-card shadow-2xl">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl animate-pulse" />

          <CardHeader className="relative text-center pb-8">
            <div className="flex items-center justify-center space-x-4 mb-6 group hover-lift">
              <div className="p-3 rounded-xl bg-accent/10 border-2 border-accent/20 group-hover:bg-accent/20 transition-all duration-300 hover-scale">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-maximalist text-primary brutalist-text text-shadow-xl">
                  Governed RAG Authentication
                </CardTitle>
                <CardDescription className="text-bold-serif text-muted-foreground text-lg">
                  Secure role-based access to enterprise knowledge
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative">
            {/* Security Alert */}
            <Alert className="mb-6 border-2 border-accent/30 bg-accent/5">
              <AlertTriangle className="h-4 w-4 text-accent" />
              <AlertTitle className="text-accent font-bold">Security Notice</AlertTitle>
              <AlertDescription className="text-accent/80">
                This demo showcases role-based access control. Select a role to see how information access is governed based on your permissions.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="roles" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="roles" className="font-bold">Role Selection</TabsTrigger>
                <TabsTrigger value="info" className="font-bold">Access Levels</TabsTrigger>
              </TabsList>

              <TabsContent value="roles" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {DEMO_ROLES.map((role) => (
                    <TooltipProvider key={role.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Card
                            className={cn(
                              "group relative overflow-hidden cursor-pointer",
                              "border-4 transition-all duration-500 ease-spring",
                              "hover-lift hover-glow hover-scale",
                              "shadow-xl hover:shadow-accent/20",
                              "brutalist-card animated-gradient",
                              selectedRole?.id === role.id
                                ? "border-accent bg-accent/10 shadow-accent/30"
                                : "border-primary/20 bg-gradient-mocha hover:border-accent/40"
                            )}
                            onClick={() => setSelectedRole(role)}
                          >
                            {/* Card background elements */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute bottom-0 left-0 w-12 h-12 bg-primary/5 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />

                            <CardContent className="relative p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-12 w-12 border-2 border-accent/20">
                                    <AvatarFallback className="bg-accent/10 text-accent font-bold text-lg">
                                      {role.icon}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-all duration-300 hover-scale">
                                    {getRoleIcon(role)}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                  {role.stepUp && (
                                    <Badge variant="destructive" className="font-bold animate-pulse">
                                      Step-Up Auth
                                    </Badge>
                                  )}
                                  <Badge
                                    variant={role.classification === 'confidential' ? 'destructive' : 'secondary'}
                                    className="font-bold"
                                  >
                                    {role.classification}
                                  </Badge>
                                </div>
                              </div>

                              <CardTitle className="text-xl font-black brutalist-text text-shadow-lg text-foreground group-hover:text-accent transition-colors duration-300 mb-3">
                                {role.name}
                              </CardTitle>

                              <CardDescription className="text-sm text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300 mb-4 leading-relaxed">
                                {role.description}
                              </CardDescription>

                              <div className="flex flex-wrap gap-2 mb-4">
                                {role.roles.map((r) => (
                                  <Badge
                                    key={r}
                                    variant="outline"
                                    className="font-bold hover-scale transition-all duration-300"
                                  >
                                    {r}
                                  </Badge>
                                ))}
                              </div>

                              <Separator className="my-4" />

                              <div className="flex items-center justify-between">
                                <div className={cn(
                                  "inline-flex items-center text-xs font-black uppercase tracking-wider px-3 py-2 rounded-lg border-2 transition-all duration-300",
                                  role.classification === 'confidential'
                                    ? 'bg-destructive/20 text-destructive border-destructive/40'
                                    : role.classification === 'internal'
                                    ? 'bg-primary/20 text-primary border-primary/40'
                                    : 'bg-accent/20 text-accent border-accent/40'
                                )}>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Max: {role.classification}
                                </div>

                                {selectedRole?.id === role.id && (
                                  <CheckCircle className="h-5 w-5 text-accent animate-pulse" />
                                )}
                              </div>

                              {/* Bottom accent line */}
                              <div className="absolute bottom-0 left-0 h-1 bg-gradient-accent w-0 group-hover:w-full transition-all duration-500 ease-spring" />
                            </CardContent>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="font-bold mb-2">{role.name}</p>
                          <p className="text-sm">{role.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {role.roles.map((r) => (
                              <Badge key={r} variant="secondary" className="text-xs">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="info" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-2 border-primary/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <Eye className="h-5 w-5 mr-2 text-primary" />
                        Internal Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Standard employee access to department-specific information and procedures.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-accent/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-accent" />
                        Admin Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Elevated permissions for managing department resources and sensitive data.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-destructive/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center">
                        <Crown className="h-5 w-5 mr-2 text-destructive" />
                        Confidential Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Restricted access requiring step-up authentication for highly sensitive information.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {selectedRole && (
              <div className="mt-8 space-y-4">
                {loading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">Authenticating...</span>
                      <span className="font-bold">{authProgress}%</span>
                    </div>
                    <Progress value={authProgress} className="h-3" />
                  </div>
                )}

                <div className="flex justify-center">
                  <Button
                    onClick={() => generateJWT(selectedRole)}
                    disabled={loading}
                    size="lg"
                    className={cn(
                      "group relative h-14 px-8 text-lg font-black uppercase tracking-wider",
                      "border-4 border-primary/30 hover:border-accent/50",
                      "bg-gradient-mocha backdrop-blur-sm",
                      "hover-lift hover-glow hover-scale",
                      "transition-all duration-300 ease-spring",
                      "btn-brutalist shadow-2xl",
                      "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent mr-3"></div>
                        <span className="text-shadow-lg">Generating...</span>
                      </>
                    ) : (
                      <>
                        <Key className="h-6 w-6 mr-3 group-hover:rotate-12 transition-all duration-300" />
                        <span className="text-shadow-lg">Authenticate as {selectedRole.name}</span>
                      </>
                    )}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </div>
              </div>
            )}

            {/* Decorative bottom elements */}
            <div className="absolute bottom-4 left-8 w-8 h-8 bg-accent/20 rounded-full blur-lg animate-pulse" />
            <div className="absolute bottom-4 right-8 w-6 h-6 bg-primary/20 rounded-full blur-md animate-pulse" />
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
