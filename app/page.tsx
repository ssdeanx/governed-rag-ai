'use client';

import AuthPanel from '@/components/AuthPanel';
import ChatInterface from '@/components/ChatInterface';
import IndexingPanel from '@/components/IndexingPanel';
import SecurityIndicator from '@/components/SecurityIndicator';
import { ThemeToggle } from '@/components/ThemeToggle';
import FeatureCard from '@/components/FeatureCard';
import LoggedInAlert from '@/components/LoggedInAlert';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

/**
 * Home page component that provides a role-aware, multi-view application shell.
 *
 * Renders a sidebar-driven layout with top navigation and a two-column content area.
 * Manages local UI/auth state: `jwt` (token), `currentRole` (user role), and `currentView`
 * ('home' | 'indexing' | 'chat'). Exposes internal handlers to sign out (clears `jwt` and
 * `currentRole`) and to change the active view.
 *
 * Behavior summary:
 * - Wrapped in SidebarProvider and includes TopNavigation (SidebarTrigger, SecurityIndicator,
 *   ThemeToggle, UserMenu) and AppSidebar.
 * - currentView === 'indexing': renders IndexingPanel with `jwt || 'anonymous'`.
 * - currentView === 'home' && no jwt: shows a secure-access landing, an AuthPanel (on success
 *   sets `jwt` and `currentRole`), and three access-level Cards (Public, Internal, Confidential).
 * - (currentView === 'home' || currentView === 'chat') && jwt: shows a signed-in Alert
 *   (displaying `currentRole` and a Sign Out button) and the ChatInterface with `jwt` and `role`.
 *
 * @returns The Home React component's JSX element.
 */
export default function Home() {
  const [jwt, setJwt] = useState<string>('');
  const [currentRole, setCurrentRole] = useState<string>('');
  const [currentView, setCurrentView] = useState('home');

  const handleSignOut = () => {
    setJwt('');
    setCurrentRole('');
  };

  const handleNavigation = (itemId: string) => {
    setCurrentView(itemId);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="app-container py-6">
          <div className="w-full space-y-6 sm:space-y-8">
        {currentView === 'indexing' && (
          <IndexingPanel jwt={jwt || 'anonymous'} />
        )}

        {currentView === 'home' && !jwt && (
          <div className="space-y-8">
            <div className="text-center py-8 sm:py-12 lg:py-16">
              <Lock className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4 sm:mb-6" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-foreground">Secure Access Required</h2>
              <p className="text-muted-foreground max-w-2xl mb-6 sm:mb-8 text-sm sm:text-base">
                This system demonstrates enterprise-grade security for RAG applications.
                Select a role below to see how different users access different information.
              </p>
            </div>

            <div className="flex items-center justify-center">
              <AuthPanel onAuth={(token, role) => {
                setJwt(token);
                setCurrentRole(role);
              }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8 sm:mt-12 grid-center animated-gradient-subtle p-4 rounded-lg">
              <FeatureCard
                title="Public Access"
                badgeVariant="default"
                badgeText="Basic"
                icon={<Shield className="h-6 w-6 text-[var(--color-security-public)]" />}
                className="neon-glow-cyan"
              >
                Basic information available to all authenticated users
              </FeatureCard>

              <FeatureCard
                title="Internal Access"
                badgeVariant="default"
                badgeText="Department"
                icon={<Shield className="h-6 w-6 text-[var(--color-security-internal)]" />}
                className="neon-glow-green"
              >
                Department-specific information for authorized roles
              </FeatureCard>

              <FeatureCard
                title="Confidential Access"
                badgeVariant="destructive"
                badgeText="Admin"
                icon={<Shield className="h-6 w-6 text-[var(--color-security-confidential)]" />}
                className="neon-glow-purple"
              >
                Sensitive data requiring admin privileges and step-up auth
              </FeatureCard>
            </div>
          </div>
        )}

        {(currentView === 'home' || currentView === 'chat') && jwt && (
          <div className="space-y-6">
            <LoggedInAlert currentRole={currentRole} onSignOut={handleSignOut} />
            <ChatInterface jwt={jwt} role={currentRole} />
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
