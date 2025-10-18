import { createGitHubCopilotOpenAICompatible } from '@opeoginni/github-copilot-openai-compatible';
import { Agent } from '@mastra/core/agent'
import { pgMemory } from '../config/pg-storage';
import { responseQualityScorer, taskCompletionScorer } from './custom-scorers';

// Create the provider instance
const githubCopilot = createGitHubCopilotOpenAICompatible({
  baseURL: 'https://api.githubcopilot.com',
  name: 'githubcopilot',
  headers: {
    Authorization: `Bearer ${process.env.COPILOT_TOKEN}`,
    "Copilot-Integration-Id": "vscode-chat", // These configs must be provided
    "User-Agent": "GitHubCopilotChat/0.26.7",
    "Editor-Version": "vscode/1.104.1",
    "Editor-Plugin-Version": "copilot-chat/0.26.7"
  },
});

export const ssAgent = new Agent({
    id: 'verifier',
    name: 'verifier',
    model: githubCopilot.chatModel('gpt-5-mini'),
    //model: openAIModel, --- IGNORE ---
    description:
        'A strict answer verification agent that ensures the provided answer is fully supported by the given contexts and relevant to the question.',
    instructions: ({ runtimeContext }) => {
        const userId = runtimeContext.get('userId')
        return `You are a strict answer verification agent. Your task is to:
User: ${userId ?? 'anonymous'}

1. Verify that every claim in the answer is supported by the provided contexts
2. Check that citations are correctly attributed
3. Ensure no hallucinated or external information was added
4. Validate the answer directly addresses the question
5. CRITICAL: Check if the contexts are actually relevant to the question

Verification rules:
- Every factual statement must be traceable to a context
- Citations must match actual document IDs from contexts
- No information beyond what's in contexts is allowed
- Answer must be relevant to the original question
- CONTEXT RELEVANCE CHECK: The contexts must actually discuss the EXACT topic being asked about
- If contexts mention related but different topics, the answer should indicate no relevant information was found

SPECIAL VALIDATION for topic drift:
- If question asks about "Termination Procedures" but context only mentions "service termination fees", this is NOT relevant
- If question asks about "Employee Benefits" but context only mentions "benefit eligibility", this might not be sufficient
- If the context doesn't directly address the question topic, the answer should state no relevant information found

Valid responses that should PASS verification:
- "No authorized documents found that contain information about this topic."
- "The authorized documents don't contain information about this specific topic."
- Actual answers with proper citations where context directly addresses the question

You must respond with a valid JSON object in this format:
{
  "ok": true/false,
  "reason": "verification result reason",
  "answer": "the verified answer or failure explanation"
}

Common failure reasons:
- "Answer contains unsupported claims"
- "Citations don't match provided contexts"
- "Answer includes information not in contexts"
- "Answer doesn't address the question"
- "Context is not relevant to the question - answer should indicate no information found"

Always return valid JSON matching this exact structure.`
    },
    memory: pgMemory,
    evals: {
        // Add any evaluation metrics if needed
    },
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
})