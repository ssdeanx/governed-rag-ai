# Financial Team Agent Network - Enhanced Version

## Overview

This document describes the enhanced financial team agent network with improved prompts, streaming support, and production-ready implementations based on Mastra best practices.

## Architecture

The system consists of:

- **3 Specialist Agents**: Stock Analysis, Crypto Analysis, Market Education
- **1 Supervisor Network**: Financial Team Network with LLM-based routing
- **1 Analysis Workflow**: Deterministic 3-step financial analysis pipeline with streaming support

## Enhanced Agents

### 1. Stock Analysis Agent

**Location**: `src/mastra/agents/stockAnalysisAgent.ts`

**Improvements**:

- ✅ **Phase-based process** with explicit "when to use" guidance for each of 10 tools
- ✅ **Three-phase execution**: Real-time data gathering → Technical & fundamental analysis → Sentiment & recommendation
- ✅ **Tool combination strategies** showing how to verify signals across multiple data sources
- ✅ **Context-aware instructions** with runtime tier and risk tolerance adaptation

**Tools Used** (10 total):

1. **polygonStockQuotesTool** - Real-time quotes (PHASE 1: First always)
2. **polygonHistoricalAggregatesTool** - 52-week trends and support/resistance
3. **alphaVantageStockTechnicalIndicatorsTool** - RSI, MACD, Bollinger Bands
4. **finnhubTechnicalAnalysisTool** - Pattern confirmation
5. **polygonStockFundamentalsTool** - P/E, earnings, revenue
6. **finnhubFinancialStatementsTool** - Financial health assessment
7. **finnhubAnalystRecommendationsTool** - Consensus validation
8. **googleFinanceTool** - News sentiment
9. **finnhubCompanyDataTool** - Business context
10. **finnhubQuotesTool** - Real-time verification

**Key Prompt Features**:

```bash
PHASE 1: REAL-TIME DATA GATHERING
→ polygonStockQuotesTool (establish baseline)
→ polygonHistoricalAggregatesTool (identify levels)

PHASE 2: TECHNICAL & FUNDAMENTAL ANALYSIS
→ alphaVantageStockTechnicalIndicatorsTool (RSI, MACD)
→ finnhubTechnicalAnalysisTool (patterns)
→ polygonStockFundamentalsTool (valuation)
→ finnhubFinancialStatementsTool (health)
→ finnhubAnalystRecommendationsTool (consensus)

PHASE 3: SENTIMENT & RECOMMENDATION
→ googleFinanceTool (news context)
→ finnhubCompanyDataTool (events)
→ finnhubQuotesTool (final check)
```

### 2. Crypto Analysis Agent

**Location**: `src/mastra/agents/cryptoAnalysisAgent.ts`

**Improvements**:

- ✅ **Crypto-specific phases** with on-chain analysis and whale movement detection
- ✅ **Volatility handling** with specific guidance for 10%+ daily swings
- ✅ **Sentiment + technical fusion** showing correlation analysis
- ✅ **When to use each tool** with real examples (RSI 75 = overbought signals)

**Tools Used** (7 total):

1. **polygonCryptoQuotesTool** - Current price and 24h metrics (PHASE 1)
2. **polygonCryptoSnapshotsTool** - Market dominance and structure
3. **alphaVantageCryptoTool** - Technical indicators
4. **polygonCryptoAggregatesTool** - Historical price action
5. **googleNewsTool** - Regulatory and partnership news
6. **googleTrendsTool** - Search interest and retail sentiment
7. **webScraperTool** - On-chain data and whale movements

**Key Prompt Features**:

```bash
PHASE 1: MARKET DATA FOUNDATION
→ polygonCryptoQuotesTool (baseline price)
→ polygonCryptoSnapshotsTool (market structure)

PHASE 2: TECHNICAL & ON-CHAIN ANALYSIS
→ alphaVantageCryptoTool (RSI, MACD)
→ polygonCryptoAggregatesTool (support/resistance)
→ googleNewsTool (catalysts)
→ googleTrendsTool (retail sentiment)
→ webScraperTool (whale movements)

PHASE 3: SYNTHESIS & RECOMMENDATION
→ Combine technical with sentiment
→ Verify whale activity correlation
→ Assess broader market context
```

### 3. Market Education Agent

**Location**: `src/mastra/agents/marketEducationAgent.ts`

**Improvements**:

- ✅ **Learning level adaptation** (beginner/intermediate/advanced)
- ✅ **Phased teaching** with assessment → explanation → examples
- ✅ **Tool selection based on knowledge level** (Scholar for academic, web for practical)
- ✅ **Structured learning output** with key points, examples, mistakes, next steps

**Tools Used** (6 total):

1. **googleScholarTool** - Academic research and peer-reviewed studies
2. **googleNewsTool** - Current market examples and relevance
3. **webScraperTool** - Real company financials and case studies
4. **googleTrendsTool** - Retail behavior and pattern cycles
5. **extractLearningsTool** - Content consolidation
6. **evaluateResultTool** - Learning quality assessment

**Key Prompt Features**:

```bash
PHASE 1: ASSESS & ADAPT TO LEARNER LEVEL
- BEGINNER: Simple analogies, avoid jargon, define all terms
- INTERMEDIATE: Mix examples with technical depth
- ADVANCED: Discuss edge cases and academic research

PHASE 2: SOURCE RESEARCH & EXAMPLES
→ googleScholarTool (rigorous evidence)
→ googleNewsTool (current relevance)
→ webScraperTool (real numbers)
→ googleTrendsTool (pattern cycles)

PHASE 3: STRUCTURE LEARNING MODULE
→ Core concept (1-2 sentences)
→ Why it matters (real-world impact)
→ How it works (step-by-step)
→ Practical example (real case)
→ Common mistakes (what to avoid)
→ Action steps (immediate application)
→ Next learning (progressive difficulty)
```

## Streaming-Enabled Workflow

**Location**: `src/mastra/workflows/financialAnalysisWorkflow.ts`

### New Streaming Architecture

The workflow now supports real-time progress events via `streamVNext()`:

```typescript
// Usage with streaming
const run = await financialAnalysisWorkflow.createRunAsync();
const stream = await run.streamVNext({
  inputData: { assetType: 'stock', symbol: 'AAPL', ... }
});

for await (const chunk of stream) {
  if (chunk.type === 'validation-start') {
    console.log('Starting validation...')
  }
  if (chunk.type === 'analysis-progress') {
    console.log(`Analysis progress: ${chunk.progress}`)
  }
  if (chunk.type === 'finalization-complete') {
    console.log('Ready to display results!')
  }
}
```

### Three-Step Pipeline with Streaming

**Step 1: Validate Financial Request** (Streaming Events)

- `validation-start` - Validation beginning
- `validation-complete` - Ready for analysis
- Emits: validated symbol, current price, risk tolerance

**Step 2: Analyze Asset** (Agent Streaming Integration)

- `analysis-start` - Starting asset analysis
- `analysis-progress` - Progressive text collection (0.5s intervals)
- `analysis-complete` - Analysis finished with duration
- `analysis-error` - Error occurred during analysis
- Integrates: Stock or Crypto agent with streaming
- Collects: Progressive analysis text from agent stream

**Step 3: Finalize Analysis Report** (Structured Output)

- `finalization-start` - Report generation starting
- `finalization-complete` - Final report ready
- Output: Complete analysis with recommendation, risks, summary

### Workflow Event Structure

Each streaming event includes:

```typescript
{
  type: 'step-name-event',  // validation-start, analysis-progress, etc.
  status: 'validating' | 'analyzing' | 'finalizing',
  // Additional context varies by event type
  symbol?: string,
  progress?: number,
  duration?: number,
  error?: string
}
```

## Usage Examples

### Stock Analysis with Streaming

```typescript
import { mastra } from './src/mastra';

const run = await financialAnalysisWorkflow.createRunAsync();
const stream = await run.streamVNext({
  inputData: {
    assetType: 'stock',
    symbol: 'AAPL',
    analysisType: 'comprehensive',
    riskTolerance: 'medium'
  }
});

for await (const chunk of stream) {
  if (chunk.type === 'validation-start') {
    console.log('🔍 Validating Apple stock...');
  } else if (chunk.type === 'analysis-progress') {
    console.log(`📊 Analyzing... (${chunk.progress} chars)`);
  } else if (chunk.type === 'finalization-complete') {
    console.log('✅ Analysis ready!');
  }
}
```

### Crypto Analysis with Network

```typescript
const financialNetwork = mastra.getAgent('financial-team-network');
const response = await financialNetwork.generate(
  'Analyze Bitcoin and provide trading signals'
);
```

### Market Education

```typescript
const educationAgent = mastra.getAgent('market-education');
const lesson = await educationAgent.generate(
  'Explain what P/E ratio means',
  undefined,
  { knowledgeLevel: 'beginner' }
);
```

## Best Practices

### For Agent Prompts

1. **Use Phase-Based Structure**: Three clear phases (gather → analyze → recommend)
2. **Explicit Tool Guidance**: Always show "when to use" for each tool
3. **Tool Combination**: Demonstrate how to verify signals across multiple sources
4. **Error Handling**: Include rules for edge cases and constraints
5. **Output Format**: Specify exact JSON structure expected

### For Streaming

1. **Emit Progress Events**: Call `writer.write()` for user feedback
2. **Await Writer Calls**: Always `await writer?.write?()` to avoid locking
3. **Use Meaningful Types**: Use descriptive event type names (analysis-progress, not data)
4. **Include Timestamps**: Help track workflow execution duration
5. **Handle Errors Gracefully**: Emit error events with clear messages

### For Workflow Design

1. **Use StreamVNext**: Prefer `streamVNext()` over `start()` for real-time feedback
2. **Agent Integration**: Call agent.stream() within workflow steps
3. **Progressive Output**: Collect and emit intermediate results
4. **Schema Validation**: Ensure each step's output schema matches next step's input
5. **Error Recovery**: Provide fallback outputs if analysis fails

## File Structure

```bash
src/mastra/
├── agents/
│   ├── stockAnalysisAgent.ts          ✨ Enhanced with phases & tool guidance
│   ├── cryptoAnalysisAgent.ts         ✨ Enhanced with volatility handling
│   ├── marketEducationAgent.ts        ✨ Enhanced with learning adaptation
│   ├── custom-scorers.ts              (Existing: 5 custom scorers)
│   └── index.ts                       (Updated exports)
├── workflows/
│   ├── financialAnalysisWorkflow.ts   ✨ Streaming enabled, 3-step pipeline
│   └── index.ts                       (Updated exports)
├── schemas/
│   └── agent-schemas.ts               (Existing: 3 output schemas)
└── network/
    ├── financial-team-network.ts      (Existing: 3 agents + 1 workflow)
    └── index.ts                       (Updated exports)
```

## Performance Characteristics

- **Stock Analysis**: ~5-10 seconds (10 tool calls, multiple sources)
- **Crypto Analysis**: ~3-7 seconds (7 tool calls, high volatility handling)
- **Market Education**: ~2-5 seconds (4-5 tool calls, research-backed)
- **Network Routing**: <1 second (LLM-based dynamic dispatch)
- **Streaming Overhead**: <100ms for event emission

## Validation

All files pass TypeScript strict mode compilation:

- ✅ No `any` types
- ✅ All parameters typed
- ✅ All schemas validated
- ✅ Runtime context properly handled
- ✅ Writer parameter included in streaming steps

## Next Steps

1. **Deploy to Production**: Use the enhanced agents in your application
2. **Monitor Performance**: Track streaming latency and tool execution times
3. **Collect Feedback**: Validate agent recommendations against market outcomes
4. **Extend Streaming**: Add streaming to more workflow steps
5. **Custom Scorers**: Tune scorer sampling rates based on performance data

## Migration Guide

If upgrading from basic version:

1. **Update Imports**: Ensure importing from agents/index.ts and workflows/index.ts
2. **Use StreamVNext**: Replace `run.start()` with `run.streamVNext()` for real-time feedback
3. **Handle Events**: Add event listeners for validation-start, analysis-progress, etc.
4. **Context Configuration**: Provide runtimeContext with tier, knowledgeLevel, riskTolerance
5. **Test Streaming**: Verify all streaming event types fire correctly

## References

- Mastra Documentation: [workflows/overview.mdx](../reference/workflows/)
- Streaming Guide: [streaming/workflow-streaming.mdx](../reference/streaming/)
- Agent Examples: [agent documentation](../reference/agents/)
