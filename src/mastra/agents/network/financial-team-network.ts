/**
 * Financial Team Network
 *
 * A multi-agent network that orchestrates specialized financial analysis agents
 * for comprehensive stock and cryptocurrency analysis, market insights, and
 * investment education.
 *
 * Network Agents:
 * - Stock Analysis Agent: Deep stock market analysis with technical and fundamental insights
 * - Crypto Analysis Agent: Cryptocurrency market analysis with sentiment and trend data
 * - Market Education Agent: Investment strategies, concepts, and risk management education
 *
 * Key Features:
 * - Non-deterministic LLM-based routing between specialized agents
 * - Single task execution for simple queries
 * - Complex task decomposition for multi-step financial analysis
 * - Memory-backed decision making and personalized recommendations
 *
 * Use Cases:
 * - Analyze stocks or cryptocurrencies for investment decisions
 * - Learn about market concepts and investment strategies
 * - Get personalized financial insights based on risk tolerance
 * - Compare different investment opportunities
 * - Understand market trends and their implications
 */

import { Agent } from '@mastra/core/agent'
import { google } from '@ai-sdk/google'
import { stockAnalysisAgent } from '../stockAnalysisAgent'
import { cryptoAnalysisAgent } from '../cryptoAnalysisAgent'
import { marketEducationAgent } from '../marketEducationAgent'
import { financialAnalysisWorkflow } from '../../workflows/financialAnalysisWorkflow'
import { pgMemory } from '../../config/pg-storage'
import { log } from '../../config/logger'
import { createAnswerRelevancyScorer, createToxicityScorer } from '@mastra/evals/scorers/llm'
import { googleAIFlashLite } from '../../config/google'
import { researchCompletenessScorer, sourceDiversityScorer, summaryQualityScorer, taskCompletionScorer } from '../custom-scorers'

log.info('Initializing Financial Team Network...')

/**
 * Financial Team Network
 *
 * A multi-agent network for comprehensive financial analysis, market insights, and investment education.
 * Uses LLM-based routing to automatically select appropriate agents and workflows for user queries.
 *
 * Key Features:
 * - Non-deterministic LLM-based routing between agents and workflows
 * - Single task execution with .generate() for simple, one-off queries
 * - Complex task execution for multi-step financial analysis
 * - Memory-backed task history and decision making
 *
 * Use Cases:
 * - Research a stock or cryptocurrency and get a buy/sell/hold recommendation
 * - Learn about technical analysis, fundamental analysis, or investing concepts
 * - Get personalized financial insights based on your risk tolerance
 * - Compare multiple assets and get relative recommendations
 * - Understand market trends and their investment implications
 */
export const financialTeamNetwork = new Agent({
    id: 'financial-team-network',
    name: 'Financial Team Network',
    description:
        'Multi-agent network for comprehensive financial analysis, market insights, and investment education',
    instructions: `
    A multi-agent financial analysis and education network.

    Capabilities:
    - Comprehensive stock market analysis with technical and fundamental insights
    - Cryptocurrency market analysis with sentiment and trend data
    - Investment education and strategy guidance
    - Portfolio analysis and risk assessment
    - Market news and trend analysis

    Specialized Agents:
    1. Stock Analysis Agent - Expert stock market analyst
        - Real-time stock price quotes and market data
        - Technical indicator analysis (RSI, MACD, moving averages)
        - Fundamental analysis (P/E ratios, earnings, dividends)
        - Analyst recommendations and price targets
        - Use when: User asks about stocks, stock analysis, technical analysis of equities

    2. Crypto Analysis Agent - Expert cryptocurrency analyst
        - Real-time cryptocurrency prices and market data
        - Technical analysis of crypto assets
        - Market sentiment analysis from news and social media
        - On-chain metrics and blockchain analysis
        - Use when: User asks about Bitcoin, Ethereum, crypto, blockchain, digital assets

    3. Market Education Agent - Financial educator
        - Teaching investment strategies and market concepts
        - Explaining technical and fundamental analysis
        - Risk management and portfolio management education
        - Market cycle and economic indicator education
        - Use when: User asks to learn about, explain, or educate on market concepts

    Available Workflows:
    1. Financial Analysis Workflow - Structured multi-step financial analysis
        - Step 1: Validate financial request (symbol, asset type, analysis type)
        - Step 2: Analyze asset (gather data, technical analysis, recommendations)
        - Step 3: Finalize analysis report (compile comprehensive report)
        - Use for: Comprehensive, structured analysis of stocks or cryptocurrencies

    Routing Guidelines:
    - If query mentions specific stocks (AAPL, GOOGL, TSLA) → Stock Analysis Agent
    - If query mentions specific cryptos (BTC, ETH, DOGE) → Crypto Analysis Agent
    - If query asks to "learn", "explain", "teach", "what is", "how do" → Market Education Agent
    - If query is complex/multi-step → Financial Analysis Workflow
    - If user mentions risk tolerance → Route to appropriate agent with context
    - If user compares stocks vs crypto → Route to both agents or education agent

    Response Guidelines:
    - Always include risk disclaimers for financial recommendations
    - Cite data sources and timestamps
    - Provide clear reasoning for recommendations
    - Suggest next steps or related topics for learning
    - Respect user's knowledge level (beginner/intermediate/advanced)
    `,
    model: google('gemini-2.5-flash-preview-09-2025'),

    // Specialized agents for different financial tasks
    agents: {
        'stock-analysis': stockAnalysisAgent,
        'crypto-analysis': cryptoAnalysisAgent,
        'market-education': marketEducationAgent,
    },

    // Workflows for complex, multi-step financial analysis
    workflows: {
        'financial-analysis': financialAnalysisWorkflow,
    },

    // Memory is REQUIRED for network to store task history and enable decision-making
    memory: pgMemory,
    scorers: {
        relevancy: {
          scorer: createAnswerRelevancyScorer({ model: googleAIFlashLite }),
          sampling: { type: "ratio", rate: 0.5 }
        },
        safety: {
          scorer: createToxicityScorer({ model: googleAIFlashLite }),
          sampling: { type: "ratio", rate: 0.3 }
        },
        sourceDiversity: {
          scorer: sourceDiversityScorer,
          sampling: { type: "ratio", rate: 0.5 }
        },
        researchCompleteness: {
          scorer: researchCompletenessScorer,
          sampling: { type: "ratio", rate: 0.4 }
        },
        summaryQuality: {
          scorer: summaryQualityScorer,
          sampling: { type: "ratio", rate: 0.6 }
        },
        taskCompletion: {
            scorer: taskCompletionScorer,
            sampling: { type: 'ratio', rate: 0.7 },
        },
      },
})

/**
 * Example Usage:
 *
 * 1. Single Task Execution (Simple, one-off tasks)
 *
 * ```typescript
 * const network = financialTeamNetwork;
 *
 * // Simple stock query
 * const result = await network.generate([
 *   {
 *     role: 'user',
 *     content: 'Should I buy Apple stock? Current price is $150.'
 *   }
 * ]);
 *
 * // Cryptocurrency analysis
 * const btcAnalysis = await network.generate([
 *   {
 *     role: 'user',
 *     content: 'Analyze Bitcoin for me. What do you think about BTC as a long-term investment?'
 *   }
 * ]);
 *
 * // Educational query
 * const education = await network.generate([
 *   {
 *     role: 'user',
 *     content: 'Teach me about technical analysis. What does RSI mean?'
 *   }
 * ]);
 * ```
 *
 * 2. Complex Task Execution (Multi-step reasoning)
 *
 * ```typescript
 * const network = financialTeamNetwork;
 *
 * // Complex multi-step query
 * const complexResult = await network.generate([
 *   {
 *     role: 'user',
 *     content: 'I have $10,000 to invest. Should I put it in AAPL stock or Bitcoin? I have medium risk tolerance.'
 *   }
 * ], {
 *   maxSteps: 20  // Allow multiple agent calls
 * });
 *
 * // Multi-query conversation
 * const history = [
 *   { role: 'user', content: 'Analyze Tesla stock for me' },
 *   { role: 'assistant', content: 'Tesla analysis...' },
 *   { role: 'user', content: 'Now compare it with Ford stock' }
 * ];
 *
 * const comparison = await network.generate(history, {
 *   maxSteps: 25
 * });
 * ```
 *
 * 3. Streaming Results (For real-time user feedback)
 *
 * ```typescript
 * import { streamText } from 'ai';
 *
 * const stream = await streamText({
 *   model: financialTeamNetwork,
 *   messages: [
 *     {
 *       role: 'user',
 *       content: 'Give me a comprehensive analysis of Nvidia stock'
 *     }
 *   ]
 * });
 *
 * for await (const chunk of stream.textStream) {
 *   console.log(chunk);
 * }
 * ```
 *
 * 4. Client-Side Usage (Next.js API Route)
 *
 * ```typescript
 * // app/api/financial-analysis/route.ts
 * import { MastraClient } from '@mastra/client-js';
 *
 * const mastraClient = new MastraClient({
 *   apiKey: process.env.MASTRA_API_KEY
 * });
 *
 * export async function POST(req: Request) {
 *   const { query, riskTolerance } = await req.json();
 *
 *   const result = await mastraClient.agents.network('financial-team-network').network(query, {
 *     runtimeContext: {
 *       userId: req.user.id,
 *       tier: req.user.tier,
 *       riskTolerance
 *     }
 *   });
 *
 *   return Response.json(result);
 * }
 * ```
 *
 * 5. Workflow Execution (Structured multi-step analysis)
 *
 * ```typescript
 * import { financialAnalysisWorkflow } from '@mastra/core';
 *
 * const analysis = await financialAnalysisWorkflow.execute({
 *   assetType: 'stock',
 *   symbol: 'AAPL',
 *   analysisType: 'comprehensive',
 *   riskTolerance: 'medium'
 * });
 * ```
 *
 * Network Behavior:
 * - LLM automatically routes queries to appropriate agents based on task description
 * - Complex queries are decomposed into sub-tasks across multiple agents
 * - Agent outputs are combined for comprehensive analysis
 * - Memory tracks conversation history for context-aware responses
 * - Recommendations are personalized based on user tier and risk tolerance
 *
 * When to Use This Network:
 * ✓ User queries about stocks or cryptocurrencies
 * ✓ User wants financial education or explanations
 * ✓ Need to compare different assets or strategies
 * ✓ Multi-step financial analysis required
 * ✓ Personalized recommendations based on risk tolerance
 * ✓ Streaming analysis to frontend applications
 *
 * When to Use Individual Agents:
 * ✓ Specific, focused stock analysis → stockAnalysisAgent
 * ✓ Specific, focused crypto analysis → cryptoAnalysisAgent
 * ✓ Financial education → marketEducationAgent
 * ✓ Direct tool calls without LLM routing
 */
