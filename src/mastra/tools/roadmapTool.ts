import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { AISpanType } from '@mastra/core/ai-tracing'
import { log } from '../config/logger'
// Schema definitions for roadmap tools
const CommentSchema = z.object({
    id: z.string(),
    author: z.string(),
    text: z.string(),
})

const FeatureStatusSchema = z.enum([
    'done',
    'planned',
    'backlog',
    'in progress',
])

const FeatureSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    status: z.string(),
    nodeType: z.string(),
    upvotes: z.number(),
    comments: z.array(CommentSchema),
})

// Input schemas
const AddFeatureInputSchema = z.object({
    id: z.string().optional().describe('ID of the feature'),
    title: z.string().describe('Title of the feature'),
    description: z.string().describe('Description of the feature'),
    status: FeatureStatusSchema.default('planned').describe(
        'Status of the feature'
    ),
    nodeType: z.literal('feature').default('feature'),
    upvotes: z.number().default(0),
    comments: z.array(CommentSchema).default([]),
})

const UpdateFeatureInputSchema = z.object({
    id: z.string().describe('ID of the feature to update'),
    title: z.string().optional().describe('New title of the feature'),
    description: z
        .string()
        .optional()
        .describe('New description of the feature'),
    status: FeatureStatusSchema.optional().describe(
        'New status of the feature'
    ),
    upvotes: z.number().optional(),
    comments: z.array(CommentSchema).optional(),
})

const DeleteFeatureInputSchema = z.object({
    id: z.string().describe('ID of the feature to delete'),
})

// Output schemas
const FeatureResponseSchema = z.object({
    success: z.boolean(),
    feature: FeatureSchema,
})

const DeleteResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
})

// Add a new feature
export const addFeatureTool = createTool({
    id: 'add-feature',
    description: 'Add a new feature to the product roadmap',
    inputSchema: AddFeatureInputSchema,
    outputSchema: FeatureResponseSchema,
    execute: async ({ context, tracingContext }) => {
        // Create a span for tracing
        const span = tracingContext?.currentSpan?.createChildSpan({
            type: AISpanType.TOOL_CALL,
            name: 'add-feature-tool',
            input: {
                title: context.title,
                hasDescription: !!context.description,
            },
        })

        const feature = {
            id: context.id ?? '',
            title: context.title,
            description: context.description,
            status: context.status,
            nodeType: context.nodeType,
            upvotes: context.upvotes,
            comments: context.comments,
        }

        span?.end({ output: { success: true, featureId: feature.id } })

        return {
            success: true,
            feature,
        }
    },
})

// Update a feature
export const updateFeatureTool = createTool({
    id: 'update-feature',
    description: 'Update an existing feature in the product roadmap',
    inputSchema: UpdateFeatureInputSchema,
    outputSchema: FeatureResponseSchema,
    execute: async ({ context, tracingContext }) => {
        // Create a span for tracing
        const span = tracingContext?.currentSpan?.createChildSpan({
            type: AISpanType.TOOL_CALL,
            name: 'update-feature-tool',
            input: {
                featureId: context.id,
                hasTitle: !!context.title,
                hasDescription: !!context.description,
            },
        })

        const result = {
            success: true,
            feature: {
                id: context.id,
                title: context.title ?? '',
                description: context.description ?? '',
                status: context.status ?? 'planned',
                nodeType: 'feature',
                upvotes: context.upvotes ?? 0,
                comments: context.comments ?? [],
            },
        }

        span?.end({ output: { success: true, featureId: context.id } })

        return result
    },
})

// Delete a feature
export const deleteFeatureTool = createTool({
    id: 'delete-feature',
    description: 'Delete a feature from the product roadmap',
    inputSchema: DeleteFeatureInputSchema,
    outputSchema: DeleteResponseSchema,
    execute: async ({ context, tracingContext }) => {
        // Create a span for tracing
        const span = tracingContext?.currentSpan?.createChildSpan({
            type: AISpanType.TOOL_CALL,
            name: 'delete-feature-tool',
            input: { featureId: context.id },
        })

        const result = {
            success: true,
            message: `Feature ${context.id} deleted successfully`,
        }

        span?.end({ output: { success: true, featureId: context.id } })

        return result
    },
})

// Export all tools
export const roadmapTools = {
    addFeatureTool,
    updateFeatureTool,
    deleteFeatureTool,
}
