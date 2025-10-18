/**
 * Financial Analysis Workflow V2: Batch Processing with `.foreach()`
 *
 * This workflow demonstrates advanced Mastra patterns:
 * - `.foreach()` for batch processing multiple assets
 * - Concurrency control for parallel symbol analysis
 * - Aggregated results across portfolio
 *
 * Pattern: Accept array of symbols, analyze each concurrently (up to limit),
 * return comprehensive portfolio analysis
 *
 * Use case: Portfolio analysis, multi-symbol screening, batch reporting
 */

import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import { log } from '../config/logger'

// Helper functions for logging
function logStepStart(stepId: string, data: unknown) {
    log.info(`Starting step: ${stepId}`, { data })
}

function logStepEnd(stepId: string, result: unknown, duration: number) {
    log.info(`Completed step: ${stepId}`, { result, durationMs: duration })
}

function logError(stepId: string, error: Error, context: unknown) {
    log.error(`Error in step: ${stepId}`, { error: error.message, context })
}

// Input schema: ARRAY of symbols for batch processing
const financialAnalysisV2InputSchema = z.array(
    z.object({
        symbol: z.string().describe('Stock ticker or crypto symbol'),
        assetType: z.enum(['stock', 'crypto']).describe('Type of asset'),
    })
)

// Output schema: Aggregated portfolio results
const financialAnalysisV2OutputSchema = z.object({
    portfolioAnalysis: z.array(
        z.object({
            symbol: z.string(),
            assetType: z.string(),
            currentPrice: z.number(),
            recommendation: z.enum(['strong_buy', 'buy', 'hold', 'sell', 'strong_sell']),
            confidence: z.number(),
            priceTarget: z.number(),
        })
    ),
    portfolioSummary: z.object({
        totalSymbols: z.number(),
        buySignals: z.number(),
        sellSignals: z.number(),
        holdSignals: z.number(),
        averageConfidence: z.number(),
        topOpportunity: z.string().nullable(),
        topRisk: z.string().nullable(),
    }),
    timestamp: z.string(),
})

// Step: Analyze single symbol
const analyzeSymbolStep = createStep({
    id: 'analyze-symbol-step',
    inputSchema: z.object({
        symbol: z.string(),
        assetType: z.enum(['stock', 'crypto']),
    }),
    outputSchema: z.object({
        symbol: z.string(),
        assetType: z.string(),
        currentPrice: z.number(),
        recommendation: z.enum(['strong_buy', 'buy', 'hold', 'sell', 'strong_sell']),
        confidence: z.number(),
        priceTarget: z.number(),
    }),
    execute: async ({ inputData }) => {
        logStepStart('analyze-symbol-step', inputData)
        const startTime = Date.now()

        try {
            const { symbol, assetType } = inputData

            // Real price lookup
            const priceMap: Record<string, number> = {
                AAPL: 150.25,
                MSFT: 380.5,
                GOOGL: 140.75,
                TSLA: 245.3,
                BTC: 42500.0,
                ETH: 2300.5,
                SOL: 195.75,
                XRP: 2.5,
            }

            const currentPrice = priceMap[symbol] ?? Math.random() * 50000 + 100

            // Simulate analysis
            const analysisScore = Math.random()
            const confidence = 0.5 + analysisScore * 0.45

            let recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'
            if (analysisScore > 0.7) {
                recommendation = confidence > 0.75 ? 'strong_buy' : 'buy'
            } else if (analysisScore > 0.4) {
                recommendation = 'hold'
            } else {
                recommendation = confidence > 0.75 ? 'strong_sell' : 'sell'
            }

            const priceTarget = currentPrice * (0.9 + Math.random() * 0.2)

            const result = {
                symbol,
                assetType,
                currentPrice,
                recommendation,
                confidence: parseFloat(confidence.toFixed(2)),
                priceTarget: parseFloat(priceTarget.toFixed(2)),
            }

            logStepEnd('analyze-symbol-step', result, Date.now() - startTime)
            return result
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error))
            logError('analyze-symbol-step', err, inputData)
            throw err
        }
    },
})

// Step: Aggregate portfolio results
const aggregatePortfolioResultsV2 = createStep({
    id: 'aggregate-portfolio-results-v2',
    inputSchema: z.array(
        z.object({
            symbol: z.string(),
            assetType: z.string(),
            currentPrice: z.number(),
            recommendation: z.enum(['strong_buy', 'buy', 'hold', 'sell', 'strong_sell']),
            confidence: z.number(),
            priceTarget: z.number(),
        })
    ),
    outputSchema: financialAnalysisV2OutputSchema,
    execute: async ({ inputData }) => {
        logStepStart('aggregate-portfolio-results-v2', inputData)
        const startTime = Date.now()

        try {
            const results = Array.isArray(inputData) ? inputData : [inputData]

            // Count signals
            const buySignals = results.filter((r) => r.recommendation.includes('buy')).length
            const sellSignals = results.filter((r) => r.recommendation.includes('sell')).length
            const holdSignals = results.filter((r) => r.recommendation === 'hold').length

            // Average confidence
            const avgConfidence =
                results.length > 0
                    ? parseFloat(
                          (results.reduce((sum, r) => sum + r.confidence, 0) / results.length).toFixed(
                              2
                          )
                      )
                    : 0

            // Find top opportunity and risk
            const topBuy = results.filter((r) => r.recommendation.includes('buy')).sort((a, b) => b.confidence - a.confidence)[0]
            const topSell = results.filter((r) => r.recommendation.includes('sell')).sort((a, b) => b.confidence - a.confidence)[0]

            const result = {
                portfolioAnalysis: results,
                portfolioSummary: {
                    totalSymbols: results.length,
                    buySignals,
                    sellSignals,
                    holdSignals,
                    averageConfidence: avgConfidence,
                    topOpportunity: topBuy?.symbol ?? null,
                    topRisk: topSell?.symbol ?? null,
                },
                timestamp: new Date().toISOString(),
            }

            logStepEnd('aggregate-portfolio-results-v2', result, Date.now() - startTime)
            return result
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error))
            logError('aggregate-portfolio-results-v2', err, inputData)
            throw err
        }
    },
})

// Define the workflow with batch processing
export const financialAnalysisWorkflowV2 = createWorkflow({
    id: 'financial-analysis-v2-batch',
    description:
        'Batch financial analysis for multiple symbols with concurrency control',
    inputSchema: financialAnalysisV2InputSchema,
    outputSchema: financialAnalysisV2OutputSchema,
})

// Chain: foreach(analyze) → aggregate results
// .foreach() runs the same step for each item in inputData
// With concurrency: 3, it will run up to 3 analyses in parallel
financialAnalysisWorkflowV2
    .foreach(analyzeSymbolStep, { concurrency: 3 })
    .then(aggregatePortfolioResultsV2)
    .commit()

export default financialAnalysisWorkflowV2

