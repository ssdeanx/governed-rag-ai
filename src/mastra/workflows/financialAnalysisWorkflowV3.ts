/**
 * Financial Analysis Workflow V3: Parallel Concurrent Analysis
 *
 * This workflow demonstrates advanced Mastra patterns:
 * - `.parallel()` for concurrent step execution
 * - Multi-stream analysis (technical + fundamental simultaneously)
 * - Result aggregation and merge
 *
 * Pattern: Run technical and fundamental analysis in parallel, then merge
 * Benefits: Faster overall analysis time, comprehensive signal gathering
 */

import { createStep, createWorkflow } from '@mastra/core'
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

// Input schema
const financialAnalysisV3InputSchema = z.object({
    symbol: z.string().describe('Stock ticker or crypto symbol'),
    assetType: z.enum(['stock', 'crypto']).describe('Type of asset'),
})

// Output schema
const financialAnalysisV3OutputSchema = z.object({
    symbol: z.string(),
    assetType: z.string(),
    technicalAnalysis: z.object({
        trend: z.string(),
        signal: z.enum(['bullish', 'bearish', 'neutral']),
        strength: z.number().min(0).max(1),
    }),
    fundamentalAnalysis: z.object({
        health: z.string(),
        signal: z.enum(['bullish', 'bearish', 'neutral']),
        strength: z.number().min(0).max(1),
    }),
    mergedRecommendation: z.enum(['strong_buy', 'buy', 'hold', 'sell', 'strong_sell']),
    mergedConfidence: z.number().min(0).max(1),
    timestamp: z.string(),
})

// Step 1: Validate input
const validateInputV3 = createStep({
    id: 'validate-input-v3',
    inputSchema: financialAnalysisV3InputSchema,
    outputSchema: z.object({
        validatedSymbol: z.string(),
        assetType: z.enum(['stock', 'crypto']),
    }),
    execute: async ({ inputData }) => {
        logStepStart('validate-input-v3', inputData)
        const startTime = Date.now()

        try {
            const validAssetTypes = ['stock', 'crypto']

            if (!inputData.symbol || inputData.symbol.length < 1 || inputData.symbol.length > 5) {
                throw new Error('Invalid symbol format')
            }

            if (!validAssetTypes.includes(inputData.assetType)) {
                throw new Error('Invalid asset type')
            }

            const result = {
                validatedSymbol: inputData.symbol.toUpperCase(),
                assetType: inputData.assetType,
            }

            logStepEnd('validate-input-v3', result, Date.now() - startTime)
            return result
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error))
            logError('validate-input-v3', err, inputData)
            throw err
        }
    },
})

// Step 2a: Technical Analysis (Parallel Path A)
const technicalAnalysisStep = createStep({
    id: 'technical-analysis-step',
    inputSchema: validateInputV3.outputSchema,
    outputSchema: z.object({
        trend: z.string(),
        signal: z.enum(['bullish', 'bearish', 'neutral']),
        strength: z.number().min(0).max(1),
        indicators: z.array(z.string()),
    }),
    execute: async ({ inputData }) => {
        logStepStart('technical-analysis-step', inputData)
        const startTime = Date.now()

        try {
            // Simulate technical analysis with various indicators
            const indicators = ['RSI', 'MACD', 'Bollinger Bands', 'Moving Averages', 'Volume Profile']
            const rand = Math.random()

            let signal: 'bullish' | 'bearish' | 'neutral'
            let strength = Math.random()

            if (rand < 0.35) {
                signal = 'bullish'
                strength = 0.6 + Math.random() * 0.35
            } else if (rand < 0.65) {
                signal = 'neutral'
                strength = 0.4 + Math.random() * 0.2
            } else {
                signal = 'bearish'
                strength = 0.6 + Math.random() * 0.35
            }

            const result = {
                trend: `${signal.toUpperCase()} TREND identified via ${indicators.slice(0, 3).join(', ')}`,
                signal,
                strength: parseFloat(strength.toFixed(2)),
                indicators,
            }

            logStepEnd('technical-analysis-step', result, Date.now() - startTime)
            return result
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error))
            logError('technical-analysis-step', err, inputData)
            throw err
        }
    },
})

// Step 2b: Fundamental Analysis (Parallel Path B)
const fundamentalAnalysisStep = createStep({
    id: 'fundamental-analysis-step',
    inputSchema: validateInputV3.outputSchema,
    outputSchema: z.object({
        health: z.string(),
        signal: z.enum(['bullish', 'bearish', 'neutral']),
        strength: z.number().min(0).max(1),
        metrics: z.array(z.string()),
    }),
    execute: async ({ inputData }) => {
        logStepStart('fundamental-analysis-step', inputData)
        const startTime = Date.now()

        try {
            // Simulate fundamental analysis with various metrics
            const metrics =
                inputData.assetType === 'crypto'
                    ? ['Market Cap', 'On-Chain Metrics', 'Developer Activity', 'Adoption Rate']
                    : ['P/E Ratio', 'Revenue Growth', 'Profit Margin', 'Debt/Equity']

            const rand = Math.random()

            let signal: 'bullish' | 'bearish' | 'neutral'
            let strength = Math.random()

            if (rand < 0.33) {
                signal = 'bullish'
                strength = 0.65 + Math.random() * 0.3
            } else if (rand < 0.67) {
                signal = 'neutral'
                strength = 0.35 + Math.random() * 0.3
            } else {
                signal = 'bearish'
                strength = 0.65 + Math.random() * 0.3
            }

            const result = {
                health: `${inputData.assetType === 'crypto' ? 'On-Chain' : 'Company'} health is ${signal}. Metrics: ${metrics.slice(0, 2).join(', ')}`,
                signal,
                strength: parseFloat(strength.toFixed(2)),
                metrics,
            }

            logStepEnd('fundamental-analysis-step', result, Date.now() - startTime)
            return result
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error))
            logError('fundamental-analysis-step', err, inputData)
            throw err
        }
    },
})

// Step 3: Merge parallel results
const mergeParallelAnalysisV3 = createStep({
    id: 'merge-parallel-analysis-v3',
    inputSchema: z.union([
        technicalAnalysisStep.outputSchema,
        fundamentalAnalysisStep.outputSchema,
    ]),
    outputSchema: financialAnalysisV3OutputSchema,
    execute: async ({ inputData, getStepResult }) => {
        logStepStart('merge-parallel-analysis-v3', inputData)
        const startTime = Date.now()

        try {
            // Get both technical and fundamental analysis results
            const technicalResult = await getStepResult?.(technicalAnalysisStep)
            const fundamentalResult = await getStepResult?.(fundamentalAnalysisStep)
            const validationResult = await getStepResult?.(validateInputV3)

            const tech = technicalResult as {
                signal: 'bullish' | 'bearish' | 'neutral'
                strength: number
            } | null
            const fund = fundamentalResult as {
                signal: 'bullish' | 'bearish' | 'neutral'
                strength: number
            } | null

            // Calculate merged recommendation and confidence
            const techScore = tech ? (tech.signal === 'bullish' ? 1 : tech.signal === 'bearish' ? -1 : 0) * tech.strength : 0
            const fundScore = fund ? (fund.signal === 'bullish' ? 1 : fund.signal === 'bearish' ? -1 : 0) * fund.strength : 0

            const combinedScore = (techScore + fundScore) / 2
            const mergedConfidence = Math.abs(combinedScore)

            let mergedRecommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'
            if (combinedScore > 0.6) {
                mergedRecommendation = 'strong_buy'
            } else if (combinedScore > 0.2) {
                mergedRecommendation = 'buy'
            } else if (combinedScore > -0.2) {
                mergedRecommendation = 'hold'
            } else if (combinedScore > -0.6) {
                mergedRecommendation = 'sell'
            } else {
                mergedRecommendation = 'strong_sell'
            }

            const result = {
                symbol: validationResult?.validatedSymbol ?? 'UNKNOWN',
                assetType: validationResult?.assetType ?? 'stock',
                technicalAnalysis: {
                    trend: `Technical trend: ${tech?.signal ?? 'neutral'}`,
                    signal: tech?.signal ?? 'neutral',
                    strength: tech?.strength ?? 0.5,
                },
                fundamentalAnalysis: {
                    health: `Fundamental health: ${fund?.signal ?? 'neutral'}`,
                    signal: fund?.signal ?? 'neutral',
                    strength: fund?.strength ?? 0.5,
                },
                mergedRecommendation,
                mergedConfidence: parseFloat(mergedConfidence.toFixed(2)),
                timestamp: new Date().toISOString(),
            }

            logStepEnd('merge-parallel-analysis-v3', result, Date.now() - startTime)
            return result
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error))
            logError('merge-parallel-analysis-v3', err, inputData)
            throw err
        }
    },
})

// Define the workflow with parallel execution
export const financialAnalysisWorkflowV3 = createWorkflow({
    id: 'financial-analysis-v3-parallel',
    description:
        'Financial analysis with concurrent technical and fundamental analysis streams',
    inputSchema: financialAnalysisV3InputSchema,
    outputSchema: financialAnalysisV3OutputSchema,
})

// Chain: validate → parallel(technical, fundamental) → merge
financialAnalysisWorkflowV3
    .then(validateInputV3)
    .parallel([technicalAnalysisStep, fundamentalAnalysisStep])
    .then(mergeParallelAnalysisV3)
    .commit()

export default financialAnalysisWorkflowV3
