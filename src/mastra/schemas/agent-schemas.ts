import { z } from 'zod'

export const subscriptionTierSchema = z.enum(['free', 'pro', 'enterprise'])

export const jwtClaimsSchema = z.object({
    sub: z.string(),
    roles: z.array(z.string()),
    tenant: z.string().optional(),
    tier: subscriptionTierSchema.optional().default('free'),
    stepUp: z.boolean().optional(),
    exp: z.number().optional(),
    iat: z.number().optional(),
    iss: z.string().optional(),
})

export const accessFilterSchema = z.object({
    allowTags: z.array(z.string()),
    maxClassification: z.enum(['public', 'internal', 'confidential']),
})

export const documentContextSchema = z.object({
    text: z.string(),
    docId: z.string(),
    versionId: z.string(),
    source: z.string(),
    score: z.number(),
    securityTags: z.array(z.string()),
    classification: z.enum(['public', 'internal', 'confidential']),
})

export const ragAnswerSchema = z.object({
    answer: z.string(),
    citations: z.array(
        z.object({
            docId: z.string(),
            source: z.string(),
        })
    ),
})

export const verificationResultSchema = z.object({
    ok: z.boolean(),
    reason: z.string(),
    answer: z.union([
        z.string(),
        z.object({
            text: z.string(),
            citations: z.array(
                z.object({
                    docId: z.string(),
                    source: z.string(),
                })
            ),
        }),
    ]),
})

/**
 * Centralized output schemas for all agents
 * (Some were previously defined ad-hoc in agent files)
 */
export const answererOutputSchema = ragAnswerSchema

export const retrieveOutputSchema = z.object({
    contexts: z.array(documentContextSchema),
})

export const rerankOutputSchema = z.object({
    contexts: z.array(documentContextSchema),
})

export const verifierOutputSchema = verificationResultSchema

export const identityOutputSchema = jwtClaimsSchema.extend({
    error: z.string().optional(),
})

export const policyOutputSchema = accessFilterSchema.extend({
    maxClassification: z.enum(['public', 'internal', 'confidential']),
})

export const editorOutputSchema = z.object({
    editedContent: z.string(),
    contentType: z.string(),
    summaryOfChanges: z.string(),
    improvementSuggestions: z.string(),
})

export const evaluationOutputSchema = z.object({
    isRelevant: z.boolean(),
    reason: z.string(),
})

export const learningExtractionOutputSchema = z.object({
    learning: z.string(),
    followUpQuestion: z.string(),
})

export const researchOutputSchema = z
    .object({
        queries: z.array(z.string()),
        searchResults: z
            .array(
                z.object({
                    title: z.string().optional(),
                    url: z.string().optional(),
                    relevance: z.string().optional(),
                })
            )
            .optional(),
        learnings: z.array(learningExtractionOutputSchema).optional(),
        completedQueries: z.array(z.string()).optional(),
        phase: z.string().optional(),
    })
    .loose()

export const copywriterOutputSchema = z.object({
    content: z.string(),
    metadata: z.record(z.string(), z.unknown()).optional(),
})

// Specific schema for the product roadmap actions
export const roadmapActionSchema = z.object({
    type: z.literal('setState'),
    stateKey: z.literal('nodes'),
    setterKey: z.enum(['addNode', 'removeNode', 'changeNode']),
    args: z.array(z.any()), // Args can be complex, leaving as any for now but could be tightened ## w
    content: z.string(),
})

export const productRoadmapOutputSchema = z.object({
    content: z.string(),
    object: roadmapActionSchema.optional(),
})

export const reportOutputSchema = z.object({
    report: z.string(),
})

export const starterOutputSchema = z.object({
    content: z.string(),
})

export const selfReferencingOutputSchema = z.object({
    content: z.string().optional(),
})

export const assistantOutputSchema = z.object({
    summary: z.string(),
    data: z.string(),
    sources: z.array(
        z.object({
            url: z.string(),
            title: z.string(),
        })
    ),
})

export const stockAnalysisOutputSchema = z.object({
    symbol: z.string(),
    currentPrice: z.number(),
    analysis: z.object({
        technical: z.object({
            trend: z.string(),
            indicators: z.record(z.string(), z.any()),
            signals: z.array(z.string()),
        }),
        fundamental: z.object({
            peRatio: z.number().optional(),
            eps: z.number().optional(),
            marketCap: z.number().optional(),
            revenue: z.number().optional(),
        }).optional(),
        sentiment: z.object({
            analystRating: z.string().optional(),
            newssentiment: z.string().optional(),
        }).optional(),
    }),
    recommendation: z.enum(['strong_buy', 'buy', 'hold', 'sell', 'strong_sell']),
    priceTarget: z.number().optional(),
    risks: z.array(z.string()),
    sources: z.array(z.object({
        provider: z.string(),
        timestamp: z.string(),
    })),
})

export const cryptoAnalysisOutputSchema = z.object({
    symbol: z.string(),
    currentPrice: z.number(),
    marketCap: z.number().optional(),
    volume24h: z.number().optional(),
    analysis: z.object({
        technical: z.object({
            trend: z.string(),
            indicators: z.record(z.string(), z.any()),
            signals: z.array(z.string()),
        }),
        sentiment: z.object({
            newsScore: z.number().optional(),
            socialScore: z.number().optional(),
            trendScore: z.number().optional(),
        }),
        onChain: z.object({
            activeAddresses: z.number().optional(),
            transactionVolume: z.number().optional(),
        }).optional(),
    }),
    recommendation: z.enum(['strong_buy', 'buy', 'hold', 'sell', 'strong_sell']),
    priceTarget: z.number().optional(),
    risks: z.array(z.string()),
    sources: z.array(z.object({
        provider: z.string(),
        timestamp: z.string(),
    })),
})

export const marketEducationOutputSchema = z.object({
    topic: z.string(),
    explanation: z.string(),
    keyPoints: z.array(z.string()),
    examples: z.array(z.object({
        scenario: z.string(),
        outcome: z.string(),
    })),
    practicalTips: z.array(z.string()),
    commonMistakes: z.array(z.string()),
    nextSteps: z.array(z.string()),
    resources: z.array(z.object({
        title: z.string(),
        url: z.string(),
        type: z.enum(['article', 'video', 'course', 'book']),
    })),
})

// Tier Configuration Schemas
export const tierQuotaSchema = z.object({
    maxDocuments: z.number().int().positive().or(z.literal(-1)), // -1 = unlimited
    maxApiRequestsPerDay: z.number().int().positive().or(z.literal(-1)),
    maxUsersPerTenant: z.number().int().positive().or(z.literal(-1)),
    features: z.array(z.string()),
    supportLevel: z.enum(['community', 'email', 'priority', 'phone_24x7']),
    customIntegrations: z.boolean(),
    advancedAnalytics: z.boolean(),
    whiteLabel: z.boolean(),
    onPremise: z.boolean(),
})

export const usageStatsSchema = z.object({
    tenant: z.string(),
    tier: subscriptionTierSchema,
    documentsIndexed: z.number().int().nonnegative(),
    apiRequestsToday: z.number().int().nonnegative(),
    totalUsers: z.number().int().nonnegative(),
    lastReset: z.iso.datetime(),
    quotaExceeded: z.boolean().optional(),
})

export const tierValidationResultSchema = z.object({
    allowed: z.boolean(),
    tier: subscriptionTierSchema,
    reason: z.string().optional(),
    upgradeRequired: z.boolean().optional(),
    currentUsage: usageStatsSchema.optional(),
})

/**
 * Content Generation Workflow Schemas
 */

// Cedar integration schemas
export const cedarContextSchema = z
    .object({
        selectedFeatures: z.array(z.string()).optional(),
        userPreferences: z.record(z.string(), z.any()).optional(),
        sessionState: z.any().optional(),
    })
    .optional()

export const cedarActionSchema = z
    .object({
        type: z.literal('setState'),
        stateKey: z.string(),
        setterKey: z.string(),
        args: z.array(z.any()),
    })
    .optional()

// Content generation input
export const contentGenerationInputSchema = z.object({
    contentType: z.enum(['blog', 'marketing', 'technical', 'business']),
    topic: z.string().min(1, 'Topic is required'),
    requirements: z.string().min(1, 'Requirements are required'),
    tone: z
        .enum(['professional', 'casual', 'technical', 'persuasive'])
        .optional(),
    targetAudience: z.string().optional(),
    cedarContext: cedarContextSchema,
    minQualityScore: z.number().min(0).max(1).default(0.7),
})

// Validated request (after input validation)
export const validatedRequestSchema = z.object({
    contentType: z.string(),
    topic: z.string(),
    requirements: z.string(),
    tone: z.string(),
    targetAudience: z.string().optional(),
    cedarContext: cedarContextSchema,
    minQualityScore: z.number(),
})

// Draft content (from copywriter)
export const draftContentSchema = z.object({
    content: z.string(),
    contentType: z.string(),
    wordCount: z.number(),
    metadata: z.record(z.string(), z.unknown()).optional(),
})

// Refined content (from editor) - extends editorOutputSchema
export const refinedContentSchema = z.object({
    editedContent: z.string(),
    contentType: z.string(),
    summaryOfChanges: z.string(),
    improvementSuggestions: z.string(),
    wordCount: z.number(),
})

// Evaluation result (from evaluation agent)
export const evaluationResultSchema = z.object({
    isRelevant: z.boolean(),
    reason: z.string(),
    qualityScore: z.number().min(0).max(1),
    metrics: z
        .object({
            contentSimilarity: z.number().optional(),
            completeness: z.number().optional(),
            toneConsistency: z.number().optional(),
            keywordCoverage: z.number().optional(),
        })
        .optional(),
})

// Final content output
export const finalContentSchema = z.object({
    finalContent: z.string(),
    contentType: z.string(),
    qualityScore: z.number(),
    iterationsPerformed: z.number(),
    summaryOfChanges: z.string(),
    improvementSuggestions: z.string(),
    wordCount: z.number(),
    meetsThreshold: z.boolean(), // Added: Boolean indicating if quality threshold was met
    cedarAction: z.any().optional(), // Future: emit Cedar actions if needed
})

/**
 * Export a mapping if needed programmatically
 * NOTE: All keys are camelCase to match actual agent/workflow exports
 */
export const agentOutputSchemas = {
    answerer: answererOutputSchema,
    retrieve: retrieveOutputSchema,
    rerank: rerankOutputSchema,
    verifier: verifierOutputSchema,
    identity: identityOutputSchema,
    policy: policyOutputSchema,
    editor: editorOutputSchema,
    evaluation: evaluationOutputSchema,
    learning: learningExtractionOutputSchema,
    research: researchOutputSchema,
    copywriter: copywriterOutputSchema,
    productRoadmap: productRoadmapOutputSchema,
    report: reportOutputSchema,
    starter: starterOutputSchema,
    selfReferencing: selfReferencingOutputSchema,
    assistant: assistantOutputSchema,
    stockAnalysis: stockAnalysisOutputSchema,
    cryptoAnalysis: cryptoAnalysisOutputSchema,
    marketEducation: marketEducationOutputSchema,
    // Content generation workflow schemas
    contentGenerationInput: contentGenerationInputSchema,
    validatedRequest: validatedRequestSchema,
    draftContent: draftContentSchema,
    refinedContent: refinedContentSchema,
    evaluationResult: evaluationResultSchema,
    finalContent: finalContentSchema,
}

// --- Model registry schemas ---
export const modelProviderSchema = z.enum([
    'google',
    'openai',
    'anthropic',
    'openrouter',
    'vertex',
    'gemini-cli',
])

export const modelCapabilitySchema = z.enum([
    'text-generation',
    'embedding',
    'vision',
    'audio',
    'reasoning',
])

export const costTierSchema = z.enum(['free', 'low', 'medium', 'high'])

export const modelMetadataSchema = z.object({
    id: z.string(),
    name: z.string(),
    provider: modelProviderSchema,
    capabilities: z.array(modelCapabilitySchema),
    contextWindow: z.number().int(),
    costTier: costTierSchema,
    maxTokens: z.number().int(),
    supportsStreaming: z.boolean().optional().default(true),
    requiresAuth: z.string().optional(),
    description: z.string().optional(),
    isAvailable: z.boolean().optional().default(true),
})

export const modelConfigurationSchema = z.object({
    userId: z.string().optional(),
    tenantId: z.string().optional(),
    primaryModelId: z.string(),
    fallbackModelId: z.string().optional(),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(512).max(32768).default(2048),
    topP: z.number().min(0).max(1).default(0.9),
    createdAt: z.iso.datetime().optional(),
    updatedAt: z.iso.datetime().optional(),
})

export const modelSelectionRequestSchema = z.object({
    primaryModel: z.string(),
    fallbackModel: z.string().optional(),
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
    topP: z.number().optional(),
})

export type ModelMetadata = z.infer<typeof modelMetadataSchema>
export type ModelConfiguration = z.infer<typeof modelConfigurationSchema>
export type ModelSelectionRequest = z.infer<typeof modelSelectionRequestSchema>
