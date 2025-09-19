import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, BookOpen, Code, Database, Users, Lock, ExternalLink, Terminal, Key, FileText } from 'lucide-react';
import Link from 'next/link';

/**
 * Renders the static Governed RAG documentation page used by the app.
 *
 * This default-export React component returns a full-page, card-based documentation UI
 * describing installation, security/access control, API reference, system architecture,
 * demo roles, and footer links. Content is static (no data fetching or runtime state)
 * and uses semantic section IDs (quick-start, security, api, architecture, demo-roles)
 * for in-page navigation and linking.
 *
 * @returns A JSX element containing the rendered documentation page.
 */
export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Governed RAG Documentation
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Complete guide to building secure, enterprise-grade RAG applications with role-based access control
          </p>
        </div>

        {/* Quick Start */}
        <section id="quick-start" className="mb-16">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <BookOpen className="mr-3 h-8 w-8 text-primary" />
            Quick Start Guide
          </h2>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>1. Installation & Setup</CardTitle>
              <CardDescription>Get your Governed RAG system up and running</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg mb-4">
                <code className="text-sm">
                  git clone https://github.com/mastra-ai/governed-rag<br/>
                  cd governed-rag<br/>
                  npm install<br/>
                  cp .env.example .env
                </code>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure your environment variables in .env file with your OpenAI API key and JWT secret.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>2. Start the Services</CardTitle>
              <CardDescription>Launch Qdrant vector database and the application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg mb-4">
                <code className="text-sm">
                  docker-compose up -d  # Start Qdrant<br/>
                  npm run dev          # Start the application
                </code>
              </div>
              <p className="text-sm text-muted-foreground">
                The application will be available at http://localhost:3000
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Index Sample Documents</CardTitle>
              <CardDescription>Load the sample corpus with security classifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg mb-4">
                <code className="text-sm">
                  npm run build-cli<br/>
                  npm run cli index
                </code>
              </div>
              <p className="text-sm text-muted-foreground">
                This indexes documents from the corpus/ folder with appropriate security tags.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Security & Access Control */}
        <section id="security" className="mb-16">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Shield className="mr-3 h-8 w-8 text-primary" />
            Security & Access Control
          </h2>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Role Hierarchy System</CardTitle>
              <CardDescription>Understanding the built-in role inheritance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Role Inheritance:</h4>
                  <ul className="text-sm space-y-1">
                    <li><code>admin</code> → inherits all roles (hr.admin, finance.admin, engineering.admin, employee, public)</li>
                    <li><code>finance.admin</code> → inherits finance.viewer, employee, public</li>
                    <li><code>finance.viewer</code> → inherits employee, public</li>
                    <li><code>employee</code> → inherits public</li>
                    <li><code>public</code> → base level access</li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground">
                  Higher privilege roles automatically inherit permissions from lower privilege roles.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Document Classification</CardTitle>
              <CardDescription>Three-tier security classification system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 border border-green-200 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h4 className="font-semibold text-green-700 dark:text-green-300">Public</h4>
                    <p className="text-xs text-green-600 dark:text-green-400">All authenticated users</p>
                  </div>
                  <div className="p-3 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Internal</h4>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">Role-based access</p>
                  </div>
                  <div className="p-3 border border-red-200 bg-red-50 dark:bg-red-950 rounded-lg">
                    <h4 className="font-semibold text-red-700 dark:text-red-300">Confidential</h4>
                    <p className="text-xs text-red-600 dark:text-red-400">Admin + Step-up auth</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* API Reference */}
        <section id="api" className="mb-16">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Code className="mr-3 h-8 w-8 text-primary" />
            API Reference
          </h2>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Chat API</CardTitle>
              <CardDescription>POST /api/chat - Query the RAG system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg mb-4">
                <code className="text-sm">
                  {`{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "question": "What is the expense policy?"
}`}
                </code>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Returns a streaming response with answer and citations based on user's access level.
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Headers:</strong> Content-Type: application/json<br/>
                <strong>Response:</strong> Server-Sent Events (text/event-stream)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Indexing API</CardTitle>
              <CardDescription>POST /api/index - Index documents with security tags</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg mb-4">
                <code className="text-sm">
                  {`{
  "jwt": "optional-jwt-token"
}`}
                </code>
              </div>
              <p className="text-sm text-muted-foreground">
                Indexes all documents from the corpus/ folder with automatic security classification.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Architecture */}
        <section id="architecture" className="mb-16">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Database className="mr-3 h-8 w-8 text-primary" />
            System Architecture
          </h2>

          <Card>
            <CardHeader>
              <CardTitle>Multi-Agent Pipeline</CardTitle>
              <CardDescription>6-agent security-first processing pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Processing Flow:</h4>
                  <div className="text-sm space-y-1">
                    <div>1. <strong>Identity Agent</strong> → JWT validation and claims extraction</div>
                    <div>2. <strong>Policy Agent</strong> → Convert claims to access filters</div>
                    <div>3. <strong>Retrieve Agent</strong> → Secure document retrieval</div>
                    <div>4. <strong>Rerank Agent</strong> → Relevance-based ordering</div>
                    <div>5. <strong>Answerer Agent</strong> → Generate answers from authorized contexts only</div>
                    <div>6. <strong>Verifier Agent</strong> → Final security compliance check</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Each agent has specific security constraints and never uses external knowledge.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Demo Roles */}
        <section id="demo-roles" className="mb-16">
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Users className="mr-3 h-8 w-8 text-primary" />
            Demo Roles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  💰 Finance Viewer
                </CardTitle>
                <CardDescription>Access to finance policies and procedures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Roles:</strong> finance.viewer, employee, public</div>
                  <div><strong>Max Classification:</strong> Internal</div>
                  <div><strong>Can Access:</strong> Finance policies, general company info</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  ⚙️ Engineering Admin
                </CardTitle>
                <CardDescription>Full access to engineering documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Roles:</strong> engineering.admin, engineering.viewer, employee, public</div>
                  <div><strong>Max Classification:</strong> Internal</div>
                  <div><strong>Can Access:</strong> Engineering docs, general company info</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  👥 HR Admin (Step-Up)
                </CardTitle>
                <CardDescription>Access to confidential HR information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Roles:</strong> hr.admin, employee, public</div>
                  <div><strong>Max Classification:</strong> Confidential (with step-up)</div>
                  <div><strong>Can Access:</strong> All HR data, salary info, confidential docs</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  👔 Executive
                </CardTitle>
                <CardDescription>Cross-department access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><strong>Roles:</strong> finance.admin, engineering.viewer, hr.viewer, employee, public</div>
                  <div><strong>Max Classification:</strong> Internal</div>
                  <div><strong>Can Access:</strong> Cross-department information</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-16 text-center">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p className="text-muted-foreground mb-4">
                This is a demo application showcasing secure RAG with Mastra. Check out the resources below.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link href="https://mastra.ai" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Mastra.ai
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="https://github.com/mastra-ai" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    GitHub
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="https://discord.gg/mastra" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Discord
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
