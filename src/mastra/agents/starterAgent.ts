
import { Agent } from '@mastra/core/agent'
import { starterOutputSchema } from '../schemas/agent-schemas'
import { log } from '../config/logger'
//import gemini from '../config/gemini-cli'
import { weatherTool } from '../tools/weather-tool'
import { BatchPartsProcessor, UnicodeNormalizer } from '@mastra/core/processors'
import { responseQualityScorer, taskCompletionScorer } from './custom-scorers'
import { researchAgent } from './researchAgent'
import { mcpAgent } from './mcpAgent'
import { evaluationAgent } from './evaluationAgent'
import { googleAIFlashLite, graphQueryTool, pgMemory, pgQueryTool } from '../config'
import { policyAgent } from './policy.agent'
import { reportAgent } from './reportAgent'

// Define runtime context for this agent
export interface StarterAgentContext {
    userId?: string
    sessionId?: string
}

log.info('Initializing Starter Agent...')

/**
 * Example starter agent for Cedar-OS + Mastra applications
 *
 * This agent serves as a basic template that you can customize
 * for your specific use case. Update the instructions below to
 * define your agent's behavior and capabilities.
 */
export const starterAgent = new Agent({
    id: 'starter',
    name: 'Starter Agent',
    description:
        'A basic starter agent that assists users with general questions and tasks.',
    instructions: ({ runtimeContext }) => {
        const userId = runtimeContext.get('userId')
        return `
<role>
User: ${userId ?? 'admin'}
You are a helpful AI assistant. Your primary function is to assist users with their questions and tasks.
Today's date is ${new Date().toISOString()}
</role>

<primary_function>
Your primary function is to help users navigate the product roadmap, understand feature priorities, and manage feature requests.
</primary_function>

<response_guidelines>
When responding:
- Be helpful, accurate, and concise
- Format your responses in a clear, readable way
- Use the tools available to you when appropriate
</response_guidelines>

<response_format>
You will respond in a JSON format with the following fields:
{
  "content": "The response to the user's question or task"
}
</response_format>
  `
    },
    model: googleAIFlashLite, // Nucleus sampling threshold
    tools: { weatherTool, pgQueryTool, graphQueryTool },
    memory: pgMemory,
    scorers: {
        responseQuality: {
            scorer: responseQualityScorer,
            sampling: { type: 'ratio', rate: 0.8 },
        },
        taskCompletion: {
            scorer: taskCompletionScorer,
            sampling: { type: 'ratio', rate: 0.7 },
        },
    },
    workflows: {},
    agents: {researchAgent, mcpAgent, evaluationAgent, policyAgent, reportAgent},
    inputProcessors: [
        new UnicodeNormalizer({
            stripControlChars: true,
            collapseWhitespace: true,
            preserveEmojis: true,
            trim: true,
        }),
    ],
})
export { starterOutputSchema }
