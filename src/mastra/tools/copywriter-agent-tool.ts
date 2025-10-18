import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { log } from '../config/logger'
import { AISpanType } from '@mastra/core/ai-tracing'

// Define runtime context for this tool
export interface CopywriterToolContext {
    userId?: string
    contentType?: string
}

log.info('Initializing Enhanced Copywriter Agent Tool...')

export const copywriterTool = createTool({
    id: 'copywriter-agent',
    description:
        'Calls the copywriter agent to create engaging, high-quality content across multiple formats including blog posts, marketing copy, social media content, technical writing, and business communications.',
    inputSchema: z.object({
        topic: z.string().describe('The main topic or subject for the content'),
        contentType: z
            .enum([
                'blog',
                'marketing',
                'social',
                'technical',
                'business',
                'creative',
                'general',
            ])
            .optional()
            .describe("The type of content to create (defaults to 'blog')"),
        targetAudience: z
            .string()
            .optional()
            .describe('The intended audience for the content'),
        tone: z
            .enum([
                'professional',
                'casual',
                'formal',
                'engaging',
                'persuasive',
                'educational',
            ])
            .optional()
            .describe('Desired tone for the content'),
        length: z
            .enum(['short', 'medium', 'long'])
            .optional()
            .describe("Approximate content length (defaults to 'medium')"),
        specificRequirements: z
            .string()
            .optional()
            .describe('Any specific requirements, guidelines, or focus areas'),
    }),
    outputSchema: z.object({
        content: z.string().describe('The created content in markdown format'),
        contentType: z.string().describe('The type of content created'),
        title: z
            .string()
            .optional()
            .describe('Suggested title for the content'),
        summary: z.string().optional().describe('Brief summary of the content'),
        keyPoints: z
            .array(z.string())
            .optional()
            .describe('Key points or takeaways from the content'),
        wordCount: z
            .number()
            .optional()
            .describe('Approximate word count of the content'),
    }),
    execute: async ({ context, mastra, tracingContext }) => {
        const {
            topic,
            contentType = 'blog',
            targetAudience,
            tone,
            length = 'medium',
            specificRequirements,
        } = context

        // Create a span for tracing
        const span = tracingContext?.currentSpan?.createChildSpan({
            type: AISpanType.TOOL_CALL,
            name: 'copywriter-agent-tool',
            input: {
                topic,
                contentType,
                targetAudience: targetAudience ?? 'general',
                tone: tone ?? 'engaging',
                length,
                hasRequirements: specificRequirements && specificRequirements.length > 0,
            },
        })

        try {
            const agent = mastra!.getAgent('copywriterAgent')

            // Build the prompt with context
            let prompt = `Create ${length} ${contentType} content about: ${topic}`

            if (targetAudience && targetAudience.trim().length > 0) {
                prompt += `\n\nTarget audience: ${targetAudience}`
            }

            if (tone) {
                prompt += `\n\nDesired tone: ${tone}`
            }

            if (specificRequirements) {
                prompt += `\n\nSpecific requirements: ${specificRequirements}`
            }

            // Add content type specific guidance
            switch (contentType) {
                case 'blog':
                    prompt +=
                        '\n\nCreate a well-structured blog post with engaging introduction, body sections, and conclusion.'
                    break
                case 'marketing':
                    prompt +=
                        '\n\nCreate persuasive marketing copy that highlights benefits and includes clear calls-to-action.'
                    break
                case 'social':
                    prompt +=
                        '\n\nCreate concise, engaging social media content optimized for sharing and engagement.'
                    break
                case 'technical':
                    prompt +=
                        '\n\nCreate clear, accurate technical content with proper explanations and examples.'
                    break
                case 'business':
                    prompt +=
                        '\n\nCreate professional business communication with clear objectives and actionable content.'
                    break
                case 'creative':
                    prompt +=
                        '\n\nCreate engaging creative content with storytelling elements and vivid language.'
                    break
                case 'general': {
                    throw new Error('Not implemented yet: "general" case')
                }
            }

            const result = await agent.generate(prompt)

            // Parse and structure the response
            const content = result.text
            const wordCount = content.split(/\s+/).length

            // Extract title if present (look for # or ## at start)
            const titleMatch = /^#{1,2}\s+(.+)$/m.exec(content)
            const title = titleMatch ? titleMatch[1] : undefined

            // Create a simple summary from the first paragraph or first few sentences
            const firstParagraph =
                content.split('\n\n')[0] || content.split('\n')[0] || ''
            const summary =
                firstParagraph.length > 200
                    ? firstParagraph.substring(0, 200) + '...'
                    : firstParagraph

            span?.end({
                output: {
                    success: true,
                    contentType,
                    wordCount,
                    hasTitle: !(!title),
                    contentLength: content.length,
                },
            })

            return {
                content,
                contentType,
                title,
                summary,
                keyPoints: [], // Could be enhanced to extract key points
                wordCount,
            }
        } catch (error) {
            const errorMsg =
                error instanceof Error ? error.message : 'Unknown error'
            log.error('Copywriter agent tool error:', {
                error: errorMsg,
                topic,
                contentType,
            })
            span?.end({
                metadata: {
                    success: false,
                    error: errorMsg,
                    topic,
                    contentType,
                },
            })
            throw new Error(`Failed to generate content: ${errorMsg}`)
        }
    },
})
