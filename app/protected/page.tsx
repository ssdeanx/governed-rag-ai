'use client';

import React from 'react';
import AuthPanel from '@/components/AuthPanel';
import ChatInterface from '@/components/ChatInterface';
import IndexingPanel from '@/components/IndexingPanel';
import FeatureCard from '@/components/FeatureCard';
import LoggedInAlert from '@/components/LoggedInAlert';
import { Lock } from 'lucide-react';
import { useState } from 'react';

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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="w-full space-y-6 sm:space-y-8">
            {currentView === 'indexing' && (
              <IndexingPanel jwt={jwt || 'anonymous'} />
            )}

            {currentView === 'home' && !jwt && (
              <div className="space-y-8">
                <div className="text-center py-8 sm:py-12 lg:py-16">
                  <Lock className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4 sm:mb-6 mx-auto" />
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-foreground">
                    Secure Access Required
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mb-6 sm:mb-8 text-sm sm:text-base mx-auto">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mt-8 sm:mt-12 grid-center animated-gradient-subtle p-4 rounded-lg">
                  <FeatureCard
                    title="Public Access"
                    badgeVariant="default"
                    badgeText="Basic"
                    className="neon-glow-cyan"
                  >
                    Basic information available to all authenticated users
                  </FeatureCard>

                  <FeatureCard
                    title="Internal Access"
                    badgeVariant="default"
                    badgeText="Department"
                    className="neon-glow-green"
                  >
                    Department-specific information for authorized roles
                  </FeatureCard>

                  <FeatureCard
                    title="Confidential Access"
                    badgeVariant="destructive"
                    badgeText="Admin"
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
