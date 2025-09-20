import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  BookOpen,
  Code,
  Database,
  Users,
  Lock,
  ExternalLink,
  Terminal,
  Key,
  FileText,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  Github,
  Globe,
  Cpu,
  Layers,
  Eye,
  Settings,
  Play,
  Download,
  Star,
  Crown
} from 'lucide-react';
import Link from 'next/link';

/**
 * Render the static documentation UI for the "Governed RAG" demo site.
 *
 * Renders a hero, system status alert, and a multi-tab documentation layout (Overview,
 * Quick Start, Security, API, Architecture, Examples) composed of Card, Tabs and other
 * UI primitives. All content is static JSX (no data fetching or props); the page
 * demonstrates the product's features, architecture, APIs, security model and example
 * scenarios.
 *
 * @returns The DocsPage React element.
 */
export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Shield className="h-16 w-16 text-primary animate-pulse" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                <Zap className="h-3 w-3 text-accent-foreground" />
              </div>
            </div>
            <div className="ml-6">
              <h1 className="text-5xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
                Governed RAG
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                Enterprise-Grade Secure AI Documentation
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Complete guide to building secure, enterprise-grade RAG applications with role-based access control,
              multi-agent orchestration, and zero-trust security using the Mastra AI framework.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Shield className="h-4 w-4 mr-2" />
              Zero-Trust Security
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Users className="h-4 w-4 mr-2" />
              Role-Based Access
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Zap className="h-4 w-4 mr-2" />
              Multi-Agent AI
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Database className="h-4 w-4 mr-2" />
              Vector Storage
            </Badge>
          </div>

          <div className="flex gap-4 justify-center">
            <Button size="lg" className="px-8">
              <Play className="h-5 w-5 mr-2" />
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="px-8">
              <Github className="h-5 w-5 mr-2" />
              View Source
            </Button>
          </div>
        </div>

        {/* System Status Alert */}
        <Alert className="mb-8 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <Info className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="font-medium">System Status: All Services Operational</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Qdrant</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Mastra</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">API</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="quickstart" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Quick Start
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="architecture" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Architecture
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Examples
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Key Features
                  </CardTitle>
                  <CardDescription>
                    What makes Governed RAG unique
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Zero-Trust Security</h4>
                      <p className="text-sm text-muted-foreground">Every query is authenticated and authorized at multiple pipeline stages</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Multi-Agent Orchestration</h4>
                      <p className="text-sm text-muted-foreground">6 specialized AI agents work together for secure knowledge retrieval</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Hierarchical RBAC</h4>
                      <p className="text-sm text-muted-foreground">Role inheritance system with granular access control</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Document Classification</h4>
                      <p className="text-sm text-muted-foreground">Automatic tagging with Public, Internal, and Confidential levels</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-accent" />
                    Technical Stack
                  </CardTitle>
                  <CardDescription>
                    Built with modern technologies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-primary">Next.js 15</div>
                      <div className="text-xs text-muted-foreground">React Framework</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-primary">TypeScript</div>
                      <div className="text-xs text-muted-foreground">Type Safety</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-primary">Mastra AI</div>
                      <div className="text-xs text-muted-foreground">Agent Framework</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-primary">Qdrant</div>
                      <div className="text-xs text-muted-foreground">Vector Database</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-primary">OpenAI</div>
                      <div className="text-xs text-muted-foreground">LLM Provider</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="font-semibold text-primary">shadcn/ui</div>
                      <div className="text-xs text-muted-foreground">UI Components</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Architecture Diagram */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  System Architecture
                </CardTitle>
                <CardDescription>
                  High-level overview of the Governed RAG pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-6 rounded-lg">
                  <div className="text-center mb-4">
                    <h4 className="font-semibold mb-2">6-Agent Security Pipeline</h4>
                    <div className="flex justify-center items-center space-x-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Identity Agent</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Policy Agent</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Retrieval Agent</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span>Rerank Agent</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Answer Agent</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>Verifier Agent</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <h5 className="font-semibold text-primary mb-2">Frontend Layer</h5>
                      <p className="text-xs text-muted-foreground">Next.js + React + TypeScript</p>
                    </div>
                    <div className="text-center">
                      <h5 className="font-semibold text-accent mb-2">AI Layer</h5>
                      <p className="text-xs text-muted-foreground">Mastra Agents + OpenAI GPT-4</p>
                    </div>
                    <div className="text-center">
                      <h5 className="font-semibold text-primary mb-2">Storage Layer</h5>
                      <p className="text-xs text-muted-foreground">Qdrant Vectors + LibSQL</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Start Tab */}
          <TabsContent value="quickstart" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-2 border-green-500/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <Download className="h-5 w-5" />
                    1. Installation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <code className="text-sm block">
                      git clone https://github.com/ssdeanx/governed-rag-ai.git<br/>
                      cd governed-rag-ai<br/>
                      npm install
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Clone the repository and install all dependencies including Next.js, Mastra, and vector database clients.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-500/20 bg-blue-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Settings className="h-5 w-5" />
                    2. Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <code className="text-sm block">
                      cp .env.example .env<br/>
                      # Edit .env with your keys
                    </code>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><strong>OPENAI_API_KEY:</strong> Your OpenAI API key</div>
                    <div><strong>JWT_SECRET:</strong> Random secret for JWT signing</div>
                    <div><strong>QDRANT_URL:</strong> Vector database endpoint</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-500/20 bg-purple-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                    <Play className="h-5 w-5" />
                    3. Launch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <code className="text-sm block">
                      docker-compose up -d<br/>
                      npm run dev
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Start Qdrant vector database and the Next.js development server. Access at http://localhost:3000
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-orange-500/20 bg-orange-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <Database className="h-5 w-5" />
                  4. Index Documents
                </CardTitle>
                <CardDescription>Load sample documents with security classifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <code className="text-sm block">
                    npm run build-cli<br/>
                    npm run cli index
                  </code>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Sample Documents:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Finance Policy Manual (Internal)</li>
                      <li>• Engineering Handbook (Internal)</li>
                      <li>• HR Guidelines (Confidential)</li>
                      <li>• Company Overview (Public)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Security Classifications:</h4>
                    <div className="space-y-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Public</Badge>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Internal</Badge>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">Confidential</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert className="border-2 border-primary/20">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Success!</strong> Your Governed RAG system is now running. Visit <code>http://localhost:3000</code> to start chatting with your secure knowledge base.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Role-Based Access Control (RBAC)
                </CardTitle>
                <CardDescription>
                  Hierarchical role system with automatic permission inheritance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 border-2 border-green-200 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h4 className="font-semibold text-green-700 dark:text-green-300">Public</h4>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 mb-2">Level 10</p>
                      <p className="text-xs">Base access for all authenticated users</p>
                    </div>

                    <div className="p-4 border-2 border-blue-200 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300">Employee</h4>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">Level 40</p>
                      <p className="text-xs">General company information access</p>
                    </div>

                    <div className="p-4 border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Dept Viewer</h4>
                      </div>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">Level 60</p>
                      <p className="text-xs">Department-specific read access</p>
                    </div>

                    <div className="p-4 border-2 border-red-200 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <h4 className="font-semibold text-red-700 dark:text-red-300">Admin</h4>
                      </div>
                      <p className="text-xs text-red-600 dark:text-red-400 mb-2">Level 100</p>
                      <p className="text-xs">Full access including confidential data</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Role Inheritance Examples:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <code className="bg-background px-2 py-1 rounded">finance.admin</code>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-muted-foreground">inherits finance.viewer, employee, public</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="bg-background px-2 py-1 rounded">hr.viewer</code>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-muted-foreground">inherits employee, public</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="bg-background px-2 py-1 rounded">admin</code>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-muted-foreground">inherits ALL roles</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-accent" />
                    Document Classification
                  </CardTitle>
                  <CardDescription>
                    Three-tier security classification system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-4 w-4 text-green-600" />
                        <h4 className="font-semibold text-green-700 dark:text-green-300">Public Classification</h4>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        General company information accessible to all authenticated users
                      </p>
                      <div className="mt-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Examples: Company overview, public policies</Badge>
                      </div>
                    </div>

                    <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-yellow-600" />
                        <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Internal Classification</h4>
                      </div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Department-specific or sensitive internal documents
                      </p>
                      <div className="mt-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Examples: Department procedures, internal guidelines</Badge>
                      </div>
                    </div>

                    <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4 text-red-600" />
                        <h4 className="font-semibold text-red-700 dark:text-red-300">Confidential Classification</h4>
                      </div>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Highly sensitive information requiring admin access and step-up authentication
                      </p>
                      <div className="mt-2">
                        <Badge variant="secondary" className="bg-red-100 text-red-800">Examples: Executive compensation, legal documents</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    Authentication & Authorization
                  </CardTitle>
                  <CardDescription>
                    JWT-based security with multi-stage validation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">JWT Token Structure:</h4>
                      <div className="bg-background p-3 rounded text-sm">
                        <code>
                          {`{
  "sub": "user-123",
  "roles": ["finance.viewer", "employee"],
  "exp": 1634567890,
  "iat": 1634564290
}`}
                        </code>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <h5 className="font-semibold">Token Validation</h5>
                          <p className="text-sm text-muted-foreground">Every request validates JWT signature and expiration</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <h5 className="font-semibold">Role Extraction</h5>
                          <p className="text-sm text-muted-foreground">Claims are parsed to determine user permissions</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <h5 className="font-semibold">Access Filtering</h5>
                          <p className="text-sm text-muted-foreground">Documents are filtered based on role hierarchy</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Chat API - POST /api/chat
                </CardTitle>
                <CardDescription>
                  Secure streaming query endpoint with role-based filtering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="request" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="request">Request</TabsTrigger>
                    <TabsTrigger value="response">Response</TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                  </TabsList>

                  <TabsContent value="request" className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Request Format:</h4>
                      <div className="bg-background p-3 rounded text-sm overflow-x-auto">
                        <code>
                          {`POST /api/chat
Content-Type: application/json

{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "question": "What is the expense reimbursement policy?"
}`}
                        </code>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Required Headers:</h4>
                        <ul className="text-sm space-y-1">
                          <li><code>Content-Type: application/json</code></li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Required Fields:</h4>
                        <ul className="text-sm space-y-1">
                          <li><code>jwt</code> - Valid JWT token with user roles</li>
                          <li><code>question</code> - Natural language query</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="response" className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Streaming Response Format:</h4>
                      <div className="bg-background p-3 rounded text-sm overflow-x-auto">
                        <code>
                          {`Content-Type: text/event-stream

data: {"content": "The expense reimbursement policy requires..."}\n\n
data: {"content": "submission within 30 days of the expense."}\n\n
...
data: {"done": true, "citations": [
  {"docId": "finance-policy-001", "source": "Finance Department Policy Manual"}
], "contexts": []}\n\n`}
                        </code>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Success Response:</h4>
                        <ul className="text-sm space-y-1">
                          <li><code>200 OK</code> - Streaming response begins</li>
                          <li><code>Content-Type: text/event-stream</code></li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-red-700 dark:text-red-300">Error Responses:</h4>
                        <ul className="text-sm space-y-1">
                          <li><code>400 Bad Request</code> - Missing JWT or question</li>
                          <li><code>401 Unauthorized</code> - Invalid JWT token</li>
                          <li><code>403 Forbidden</code> - Insufficient permissions</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="examples" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Finance Team Query</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted p-3 rounded text-sm mb-3">
                            <code>"What is our travel expense policy?"</code>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Returns finance policy documents with citations
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">HR Confidential Query</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted p-3 rounded text-sm mb-3">
                            <code>"Show me the executive compensation structure"</code>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Requires HR admin role + step-up authentication
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Cross-Department Query</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted p-3 rounded text-sm mb-3">
                            <code>"How do engineering and finance collaborate?"</code>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Returns relevant docs from both departments
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Public Information Query</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted p-3 rounded text-sm mb-3">
                            <code>"What is our company mission?"</code>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Accessible to all authenticated users
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-accent" />
                  Indexing API - POST /api/index
                </CardTitle>
                <CardDescription>
                  Index documents from corpus with automatic security classification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Request Format:</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm">
                        {`POST /api/index
Content-Type: application/json

{
  "jwt": "optional-jwt-token"
}`}
                      </code>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Processing Steps:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">Load documents from ./corpus/</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Chunk documents into segments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Generate embeddings via OpenAI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">Apply security classifications</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Store in Qdrant with metadata</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-6">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  Multi-Agent Orchestration
                </CardTitle>
                <CardDescription>
                  6 specialized AI agents working together for secure knowledge retrieval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 border-2 border-blue-200 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300">Identity Agent</h4>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                        JWT validation and claims extraction
                      </p>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Authentication</Badge>
                    </div>

                    <div className="p-4 border-2 border-green-200 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <h4 className="font-semibold text-green-700 dark:text-green-300">Policy Agent</h4>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                        Convert claims to access filters and permissions
                      </p>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Authorization</Badge>
                    </div>

                    <div className="p-4 border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Retrieval Agent</h4>
                      </div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                        Secure document retrieval with access filtering
                      </p>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Search</Badge>
                    </div>

                    <div className="p-4 border-2 border-purple-200 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        <h4 className="font-semibold text-purple-700 dark:text-purple-300">Rerank Agent</h4>
                      </div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">
                        Relevance-based result ordering and optimization
                      </p>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">Ranking</Badge>
                    </div>

                    <div className="p-4 border-2 border-red-200 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <h4 className="font-semibold text-red-700 dark:text-red-300">Answer Agent</h4>
                      </div>
                      <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                        Generate answers from authorized contexts only
                      </p>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">Generation</Badge>
                    </div>

                    <div className="p-4 border-2 border-orange-200 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                        <h4 className="font-semibold text-orange-700 dark:text-orange-300">Verifier Agent</h4>
                      </div>
                      <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">
                        Final security compliance check and validation
                      </p>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">Validation</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-muted p-6 rounded-lg">
                    <h4 className="font-semibold mb-4 text-center">Agent Workflow Sequence</h4>
                    <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">User Query</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Identity Agent</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Policy Agent</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Retrieval Agent</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Rerank Agent</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      <div className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Answer Agent</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span>Verifier Agent</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="font-medium">Secure Response</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-accent" />
                    Data Flow Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Indexing Pipeline:</h4>
                      <div className="text-sm space-y-1">
                        <div>📄 <strong>Documents</strong> → Load from ./corpus/</div>
                        <div>✂️ <strong>Chunking</strong> → Split into semantic segments</div>
                        <div>🧠 <strong>Embeddings</strong> → OpenAI text-embedding-3-small</div>
                        <div>🔒 <strong>Classification</strong> → Apply security metadata</div>
                        <div>💾 <strong>Storage</strong> → Qdrant vector database</div>
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Query Pipeline:</h4>
                      <div className="text-sm space-y-1">
                        <div>🔐 <strong>Authentication</strong> → JWT validation</div>
                        <div>🎯 <strong>Retrieval</strong> → Filtered vector search</div>
                        <div>📊 <strong>Reranking</strong> → Relevance optimization</div>
                        <div>💬 <strong>Generation</strong> → Context-aware answers</div>
                        <div>✅ <strong>Verification</strong> → Security compliance check</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" />
                    CLI Tools & Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Available Commands:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <code>npm run cli index</code>
                          <span className="text-muted-foreground">Index documents</span>
                        </div>
                        <div className="flex justify-between">
                          <code>npm run cli query</code>
                          <span className="text-muted-foreground">Test queries</span>
                        </div>
                        <div className="flex justify-between">
                          <code>npm run cli demo</code>
                          <span className="text-muted-foreground">Run demo mode</span>
                        </div>
                        <div className="flex justify-between">
                          <code>npm run cli status</code>
                          <span className="text-muted-foreground">System status</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Development Commands:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <code>npm run dev</code>
                          <span className="text-muted-foreground">Start development</span>
                        </div>
                        <div className="flex justify-between">
                          <code>npm run build</code>
                          <span className="text-muted-foreground">Production build</span>
                        </div>
                        <div className="flex justify-between">
                          <code>npm run lint</code>
                          <span className="text-muted-foreground">Code linting</span>
                        </div>
                        <div className="flex justify-between">
                          <code>npm test</code>
                          <span className="text-muted-foreground">Run tests</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-green-500/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <Users className="h-5 w-5" />
                    Finance Team Member
                  </CardTitle>
                  <CardDescription>Role: finance.viewer, employee, public</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <h5 className="font-semibold text-sm mb-2">Sample Query:</h5>
                      <code className="text-sm">"What is our expense reimbursement policy?"</code>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-semibold text-sm">Expected Response:</h5>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>• Accesses finance-policy.md (Internal classification)</div>
                        <div>• Returns policy details with citations</div>
                        <div>• Cannot access HR confidential documents</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Internal Access</Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Finance Docs</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-500/20 bg-blue-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Shield className="h-5 w-5" />
                    HR Administrator
                  </CardTitle>
                  <CardDescription>Role: hr.admin, employee, public</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <h5 className="font-semibold text-sm mb-2">Sample Query:</h5>
                      <code className="text-sm">"Show me the executive compensation structure"</code>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-semibold text-sm">Expected Response:</h5>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>• Requires step-up authentication for confidential data</div>
                        <div>• Accesses compensation-plan-2025.pdf</div>
                        <div>• Returns detailed compensation information</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-red-100 text-red-800">Confidential Access</Badge>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">Step-Up Auth</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-500/20 bg-purple-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                    <Star className="h-5 w-5" />
                    Engineering Admin
                  </CardTitle>
                  <CardDescription>Role: engineering.admin, engineering.viewer, employee, public</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <h5 className="font-semibold text-sm mb-2">Sample Query:</h5>
                      <code className="text-sm">"What are our coding standards and best practices?"</code>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-semibold text-sm">Expected Response:</h5>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>• Accesses engineering-handbook.md</div>
                        <div>• Returns comprehensive coding guidelines</div>
                        <div>• Includes internal development procedures</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Internal Access</Badge>
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">Engineering Docs</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-500/20 bg-orange-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                    <Crown className="h-5 w-5" />
                    System Administrator
                  </CardTitle>
                  <CardDescription>Role: admin (inherits all roles)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <h5 className="font-semibold text-sm mb-2">Sample Query:</h5>
                      <code className="text-sm">"Show me all company policies across departments"</code>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-semibold text-sm">Expected Response:</h5>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>• Accesses ALL documents regardless of classification</div>
                        <div>• Returns cross-department policy overview</div>
                        <div>• No step-up authentication required</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-red-100 text-red-800">Full Access</Badge>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">All Departments</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" />
                  Interactive Demo
                </CardTitle>
                <CardDescription>
                  Try the system with different roles and queries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-6 rounded-lg">
                  <div className="text-center mb-4">
                    <h4 className="font-semibold mb-2">Demo Commands:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-background p-3 rounded">
                        <code>npm run cli demo -- --role finance.viewer</code>
                        <p className="text-xs text-muted-foreground mt-1">Finance team simulation</p>
                      </div>
                      <div className="bg-background p-3 rounded">
                        <code>npm run cli demo -- --role hr.admin</code>
                        <p className="text-xs text-muted-foreground mt-1">HR admin simulation</p>
                      </div>
                      <div className="bg-background p-3 rounded">
                        <code>npm run cli demo -- --role admin</code>
                        <p className="text-xs text-muted-foreground mt-1">Full access simulation</p>
                      </div>
                    </div>
                  </div>

                  <Alert className="border-2 border-accent/20">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Pro Tip:</strong> Use the CLI demo mode to test different user roles and see how the security filtering works in practice.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-primary/20">
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              <div className="text-center">
                <h4 className="font-semibold mb-2">Built With</h4>
                <div className="flex gap-2 justify-center">
                  <Badge variant="outline">Mastra AI</Badge>
                  <Badge variant="outline">Next.js 15</Badge>
                  <Badge variant="outline">Qdrant</Badge>
                </div>
              </div>

              <div className="text-center">
                <h4 className="font-semibold mb-2">Security</h4>
                <div className="flex gap-2 justify-center">
                  <Badge variant="outline">Zero-Trust</Badge>
                  <Badge variant="outline">RBAC</Badge>
                  <Badge variant="outline">JWT Auth</Badge>
                </div>
              </div>

              <div className="text-center">
                <h4 className="font-semibold mb-2">License</h4>
                <Badge variant="outline">MIT</Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mb-6">
              <Button variant="outline" asChild>
                <Link href="https://github.com/ssdeanx/governed-rag-ai" target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://mastra.ai" target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" />
                  Mastra.ai
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://qdrant.tech" target="_blank" rel="noopener noreferrer">
                  <Database className="mr-2 h-4 w-4" />
                  Qdrant
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2025 Governed RAG. Built with ❤️ using cutting-edge AI and security technologies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
