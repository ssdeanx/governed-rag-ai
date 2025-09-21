import React from 'react';
import { Inter } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import { Toaster } from '../components/ui/toaster';
import { TopNavigation } from '../components/TopNavigation';
import { Footer } from '../components/Footer';

import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Deanmachines - AI Solutions',
  description: 'Advanced AI solutions and machine learning tools',
  applicationName: 'Deanmachines',
  authors: [{ name: 'ssdeanx', url: 'https://github.com/ssdeanx/governed-rag-ai' }],
  keywords: [
    'AI',
    'Machine Learning',
    'AI Solutions',
    'Next.js',
    'TypeScript',
    'Mastra',
    'Enterprise AI',
    'AI Tools'
  ],
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  generator: 'Next.js',
};

/**
 * Root layout component that wraps page content with global HTML, theming, navigation, footer, and toast UI.
 *
 * Renders the top-level <html> and <body> structure, applies the Inter font class, provides a ThemeProvider
 * (system-default theme, with transitions disabled on change), and composes the page with TopNavigation,
 * a main content container for `children`, Footer, and a global Toaster.
 *
 * @param children - The page content to be rendered inside the main content container.
 * @returns The top-level HTML structure for the application.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="site-wrapper">
            <TopNavigation />

            <main className="main-content app-container">
              {children}
            </main>

            <Footer />
          </div>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
