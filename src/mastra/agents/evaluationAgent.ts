import { Agent } from '@mastra/core/agent';
import { createResearchMemory } from '../config/libsql-storage';
import { ContentSimilarityMetric, CompletenessMetric, TextualDifferenceMetric, KeywordCoverageMetric, ToneConsistencyMetric } from "@mastra/evals/nlp"; // Non-LLM evals
import { logger } from "../config/logger";
import { google } from '@ai-sdk/google';

logger.info("Initializing Evaluation Agent...");

const memory = createResearchMemory();

export const evaluationAgent = new Agent({
  id: 'evaluation',
  name: 'Evaluation Agent',
  description: 'An expert evaluation agent. Your task is to evaluate whether search results are relevant to a research query.',
  instructions: `You are an expert evaluation agent. Your task is to evaluate whether search results are relevant to a research query.

  When evaluating search results:
  1. Carefully read the original research query to understand what information is being sought
  2. Analyze the search result's title, URL, and content snippet
  3. Determine if the search result contains information that would help answer the query
  4. Consider the credibility and relevance of the source
  5. Provide a clear boolean decision (relevant or not relevant)
  6. Give a brief, specific reason for your decision

  Evaluation criteria:
  - Does the content directly relate to the query topic?
  - Does it provide useful information that would help answer the query?
  - Is the source credible and authoritative?
  - Is the information current and accurate?

  Be strict but fair in your evaluation. Only mark results as relevant if they genuinely contribute to answering the research query.

  Always respond with a structured evaluation including:
  - isRelevant: boolean indicating if the result is relevant
  - reason: brief explanation of your decision
  `,
  model: google('gemini-2.5-flash-lite'),
  memory,
  evals: {
    contentSimilarity: new ContentSimilarityMetric({ ignoreCase: true, ignoreWhitespace: true }),
    completeness: new CompletenessMetric(),
    textualDifference: new TextualDifferenceMetric(),
    keywordCoverage: new KeywordCoverageMetric(), // Keywords will be provided at runtime for evaluation
    toneConsistency: new ToneConsistencyMetric(),
  },
});
