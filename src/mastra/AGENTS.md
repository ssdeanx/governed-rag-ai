<!-- AGENTS-META {"title":"Mastra Core Orchestration","version":"1.2.0","last_updated":"2025-10-18T00:00:00Z","applies_to":"/src/mastra","tags":["layer:backend","domain:rag","type:ai-core","status":"stable"],"status":"stable"} -->

# Mastra Core (`/src/mastra`)

## Persona

**Name:** Lead AI Architect  
**Role Objective:** Ensure modular, observable, and policy-governed orchestration of agents, workflows, tools, services, and schemas.

## Purpose

Central nervous system that binds AI reasoning units (agents) with operational processes (workflows), callable functions (tools), domain logic (services), structural data contracts (schemas), and security policy (policy) into a single governed runtime.

## Structure Overview

| Path             | Responsibility                             | Key Components | Notes                         |
| ---------------- | ------------------------------------------ | -------------- | ----------------------------- |
| `index.ts`       | Create & export configured Mastra instance | 22 agents, 8 workflows, 3 networks | Registration hub with observability |
| `apiRegistry.ts` | Expose workflow HTTP endpoints             | REST API routes | Bridges to App Router         |
| `ai-tracing.ts`  | Observability / Langfuse exporter setup    | LangfuseExporter, SensitiveDataFilter | Conditional on env vars       |
| `agents/`        | Single-responsibility reasoning entities   | 22 agents + 3 networks | One tool call policy, custom scorers |
| `agents/network/`| LLM-based multi-agent orchestration        | financial-team, governed-rag, research-content | Non-deterministic routing |
| `workflows/`     | Multi-step orchestration logic             | 13 workflows | Use createStep pattern, parallel execution |
| `tools/`         | Safe, side-effectful operations            | 25+ tools | Input/output schemas enforced |
| `services/`      | Reusable domain logic (pure/impure)        | Business logic modules | Called by tools & workflows   |
| `schemas/`       | Zod data contracts                         | Type validation | Mirror TypeScript interfaces  |
| `config/`        | External service & model configuration     | PostgreSQL, PgVector, Google AI | Database, embeddings, models  |
| `policy/`        | ACL / security rules                       | Role & classification gating | Access control enforcement    |

## Registered Components

### Agents (22 total)
**Core RAG Pipeline:** identity, policy, retrieve, rerank, answerer, verifier  
**Research & Content:** research, evaluation, learning, copywriter, editor, report  
**UI & Application:** starter, assistant, productRoadmap, mcp, ssAgent  
**Financial Analysis:** cryptoAnalysis, stockAnalysis, marketEducation  
**Advanced:** selfReferencing, template-reviewer  
**Networks:** research-content-network, governed-rag-network, financial-team-network

### Workflows (8 total)
**RAG Operations:** governed-rag-index, governed-rag-answer  
**Research & Content:** research-workflow, generate-report-workflow, content-generation  
**Chat & Analysis:** chat-workflow, financial-analysis-workflow (V1,V2,V3)  
**Additional:** template-reviewer-workflow

### Networks (3 total)
**research-content-network:** Research and content generation orchestration  
**governed-rag-network:** RAG pipeline with identity/policy/retrieval agents  
**financial-team-network:** Stock/crypto analysis and market education

## Execution Flow (Typical Chat Request)

1. API route invokes workflow (e.g., `governed-rag-answer`).
2. Workflow steps: auth/identity → retrieval → synthesis → answer assembly.
3. Agents invoked sequentially; each issues exactly one tool call.
4. Tools call services (vector search, filtering, citation building).
5. Schemas validate intermediate artifacts.
6. Tracing exporter records spans & timing.

## Change Log

| Version | Date (UTC) | Change                                                  |
| ------- | ---------- | ------------------------------------------------------- |
| 1.2.0   | 2025-10-18 | Added comprehensive component inventory with all 22 agents, 8 workflows, and 3 networks |
| 1.1.0   | 2025-10-08 | Verified content accuracy and updated metadata.         |
| 1.0.0   | 2025-09-24 | Standardized template applied; legacy content preserved |
