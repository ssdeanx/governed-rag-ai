import { Inter } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import { Toaster } from '../components/ui/toaster';
import { TopNavigation } from '../components/TopNavigation';
import { Footer } from '../components/Footer';

import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Governed RAG - Secure AI with Mastra',
  description: 'Enterprise-grade secure RAG with role-based access control',
  applicationName: 'Governed RAG',
  authors: [{ name: 'ssdeanx', url: 'https://github.com/ssdeanx/governed-rag-ai' }],
  keywords: [
    'AI',
    'RAG',
    'Retrieval-Augmented Generation',
    'Next.js',
    'TypeScript',
    'Mastra',
    'Enterprise AI',
    'Secure AI',
    'Role-Based Access Control',
    'RBAC'
  ],
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  generator: 'Next.js',
};

/**
 * Root application layout that wraps pages with global providers and UI chrome.
 *
 * Renders the HTML document structure with language set to English and disables hydration warnings.
 * The body applies the global Inter font and wraps content with ThemeProvider (class-based theming,
 * system default, system sync enabled, and theme-change transitions disabled). Also mounts the
 * Toaster for application-wide toast notifications.
 *
 * @param children - Page content to be rendered inside the layout
 * @returns The root HTML/Body structure containing the themed application and Toaster
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
