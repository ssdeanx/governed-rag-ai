import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { log } from '../config/logger'
import { AISpanType } from '@mastra/core/ai-tracing'

export const extractLearningsTool = createTool({
    id: 'extract-learnings',
    description:
        'Extract key learnings and follow-up questions from a search result',
    inputSchema: z.object({
        query: z.string().describe('The original research query'),
        result: z
            .object({
                title: z.string(),
                url: z.string(),
                content: z.string(),
            })
            .describe('The search result to process'),
    }),
    execute: async ({ context, mastra, tracingContext }) => {
        const extractSpan = tracingContext?.currentSpan?.createChildSpan({
            type: AISpanType.TOOL_CALL,
            name: 'extract_learnings',
            input: {
                query: context.query,
                url: context.result.url,
                contentLength: context.result.content.length,
            },
        })

        try {
            const { query, result } = context

            if (!mastra) {
                throw new Error('Mastra instance not found')
            }
            const learningExtractionAgent = mastra.getAgent(
                'learningExtractionAgent'
            )
            if (!learningExtractionAgent) {
                throw new Error(
                    'learningExtractionAgent not found on mastra instance'
                )
            }
            log.info('Extracting learnings from search result', {
                title: result.title,
                url: result.url,
            })
            const response = await learningExtractionAgent.generate([
                {
                    role: 'user',
                    content: `The user is researching "${query}".
            Extract a key learning and generate follow-up questions from this search result:

            Title: ${result.title}
            URL: ${result.url}
            Content: ${result.content.substring(0, 8000)}...

            Respond with a JSON object containing:
            - learning: string with the key insight from the content
            - followUpQuestions: array of up to 1 follow-up question for deeper research`,
                },
            ])

            const outputSchema = z.object({
                learning: z.string(),
                followUpQuestions: z.array(z.string()).max(1),
            })

            log.info('Learning extraction response', {
                result: response.object,
            })

            const parsed = outputSchema.safeParse(response.object)

            if (!parsed.success) {
                log.warn(
                    'Learning extraction agent returned unexpected shape',
                    {
                        response: response.object,
                    }
                )
                extractSpan?.end({
                    output: {
                        learningLength:
                            (response.object as any)?.learning?.length ?? 0,
                        followUpQuestionsCount:
                            (response.object as any)?.followUpQuestions
                                ?.length ?? 0,
                    },
                    metadata: { invalidResponse: true },
                })
                return {
                    learning:
                        'Invalid response format from learning extraction agent',
                    followUpQuestions: [],
                }
            }

            extractSpan?.end({
                output: {
                    learningLength: parsed.data.learning.length,
                    followUpQuestionsCount:
                        parsed.data.followUpQuestions.length,
                },
            })
            return parsed.data
        } catch (error) {
            log.error('Error extracting learnings', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            })
            const errorMessage =
                error instanceof Error ? error.message : String(error)
            extractSpan?.end({ metadata: { error: errorMessage } })
            return {
                learning: `Error extracting information: ${errorMessage}`,
                followUpQuestions: [],
            }
        }
    },
})
