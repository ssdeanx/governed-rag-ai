import { LibSQLStore, LibSQLVector } from "@mastra/libsql";
import { Memory } from "@mastra/memory";
import { embedMany } from "ai";
//import { PinoLogger } from "@mastra/loggers";
import type {
  AITracingExporter,
  AITracingEvent,
  AnyExportedAISpan,
  LLMGenerationAttributes,
} from '@mastra/core/ai-tracing';
import { AISpanType, AITracingEventType, omitKeys } from '@mastra/core/ai-tracing'
import type { RuntimeContext } from '@mastra/core/runtime-context';
import type { UIMessage } from 'ai';
//import type { RegisteredLogger } from "@mastra/core/logger";
import z from "zod";
import { google } from "@ai-sdk/google";
//import { FileTransport } from "@mastra/loggers/file";
import { log } from "./logger";

export interface TracingSpanInput {
  type: AISpanType;
  name: string;
  input?: Record<string, unknown>;
}

export interface SpanEndInput {
  output?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface QueryResult {
  id: string;
  score: number;
  metadata: Record<string, unknown>;
  document?: string;
  vector?: number[];
}

/**
 * Simplified Message type used by memory search and UI adapters
 */
export interface Message {
  id?: string;
  role?: 'user' | 'assistant' | 'system' | 'data';
  content?: string;
  createdAt?: string | number | Date;
  threadId?: string;
}

/**
 * Complete LibSQL Storage Configuration for Mastra Deep Research Agent
 */

export const STORAGE_CONFIG = {
  DEFAULT_DIMENSION: 1536, // Gemini embedding-001 dimension
  DEFAULT_DATABASE_URL: "file: deep-research.db",
  VECTOR_DATABASE_URL: "file: vector-store.db", // Separate database for vector operations
  VECTOR_INDEXES: {
    RESEARCH_DOCUMENTS: "research_documents",
    WEB_CONTENT: "web_content",
    LEARNINGS: "learnings",
    REPORTS: "reports"
  }
} as const;

export const sqlstore = new LibSQLStore({
      url: process.env.DATABASE_URL ?? STORAGE_CONFIG.DEFAULT_DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN ?? ''
});
/**
 * LibSQL Storage Configuration
 */

export const createLibSQLStore = (tracingContext?: { context?: any; runtimeContext?: RuntimeContext; currentSpan?: { createChildSpan(_input: TracingSpanInput): { end(options: SpanEndInput): void } } }) => {
  const startTime = Date.now();
  const databaseUrl = process.env.DATABASE_URL ?? STORAGE_CONFIG.DEFAULT_DATABASE_URL;

  // Create child span for storage initialization
  const initSpan = tracingContext?.currentSpan?.createChildSpan({
    type: AISpanType.GENERIC,
    name: 'libsql_store_initialization',
    input: {
      databaseUrl: databaseUrl.replace(/authToken=[^&]*/, 'authToken=***'), // Mask auth token
      hasAuthToken: !!process.env.DATABASE_AUTH_TOKEN
    }
  });

  try {
    const store = new LibSQLStore({
      url: databaseUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });

    const processingTime = Date.now() - startTime;

    // Update span with success
    initSpan?.end({
      output: {
        success: true,
        processingTime
      },
      metadata: {
        databaseUrl: databaseUrl.replace(/authToken=[^&]*/, 'authToken=***'),
        operation: 'store_initialization'
      }
    });

    log.info('LibSQL storage initialized successfully', {
      databaseUrl: databaseUrl.replace(/authToken=[^&]*/, 'authToken=***'),
      processingTime
    });
    return store;
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update span with error
    initSpan?.end({
      output: {
        success: false,
        processingTime
      },
      metadata: {
        error: errorMessage,
        operation: 'store_initialization'
      }
    });

    log.error('Failed to initialize LibSQL storage', {
      databaseUrl: databaseUrl.replace(/authToken=[^&]*/, 'authToken=***'),
      error: errorMessage,
      processingTime
    });
    throw error;
  }
};

/**
 * LibSQL Vector Store Configuration
 */

export const createLibSQLVectorStore = (tracingContext?: { context?: unknown; runtimeContext?: RuntimeContext; currentSpan?: { createChildSpan(_input: TracingSpanInput): { end(options: SpanEndInput): void } } }) => {
  const startTime = Date.now();
  const databaseUrl = process.env.VECTOR_DATABASE_URL ?? STORAGE_CONFIG.VECTOR_DATABASE_URL;

  // Create child span for vector store initialization
  const initSpan = tracingContext?.currentSpan?.createChildSpan({
    type: AISpanType.GENERIC,
    name: 'libsql_vector_store_initialization',
    input: {
      databaseUrl: databaseUrl.replace(/authToken=[^&]*/, 'authToken=***'), // Mask auth token
      hasAuthToken: !!(process.env.VECTOR_DATABASE_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN)
    }
  });

  try {
    const vectorStore = new LibSQLVector({
      connectionUrl: databaseUrl,
      authToken: process.env.VECTOR_DATABASE_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN,
    });

    const processingTime = Date.now() - startTime;

    // Update span with success
    initSpan?.end({
      output: {
        success: true,
        processingTime
      },
      metadata: {
        databaseUrl: databaseUrl.replace(/authToken=[^&]*/, 'authToken=***'),
        operation: 'vector_store_initialization'
      }
    });

    log.info('LibSQL vector store initialized successfully', {
      databaseUrl: databaseUrl.replace(/authToken=[^&]*/, 'authToken=***'),
      processingTime
    });
    return vectorStore;
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update span with error
    initSpan?.end({
      output: {
        success: false,
        processingTime
      },
      metadata: {
        error: errorMessage,
        operation: 'vector_store_initialization'
      }
    });

    log.error('Failed to initialize LibSQL vector store', {
      databaseUrl: databaseUrl.replace(/authToken=[^&]*/, 'authToken=***'),
      error: errorMessage,
      processingTime
    });
    throw error;
  }
};

/**
 * Initialize vector indexes
 */
export const initializeVectorIndexes = async () => {
  const vectorStore = createLibSQLVectorStore();

  try {
    log.info('Initializing vector indexes...');

    await vectorStore.createIndex({
      indexName: STORAGE_CONFIG.VECTOR_INDEXES.RESEARCH_DOCUMENTS,
      dimension: STORAGE_CONFIG.DEFAULT_DIMENSION,
    });

    await vectorStore.createIndex({
      indexName: STORAGE_CONFIG.VECTOR_INDEXES.WEB_CONTENT,
      dimension: STORAGE_CONFIG.DEFAULT_DIMENSION,
    });

    await vectorStore.createIndex({
      indexName: STORAGE_CONFIG.VECTOR_INDEXES.LEARNINGS,
      dimension: STORAGE_CONFIG.DEFAULT_DIMENSION,
    });

    await vectorStore.createIndex({
      indexName: STORAGE_CONFIG.VECTOR_INDEXES.REPORTS,
      dimension: STORAGE_CONFIG.DEFAULT_DIMENSION,
    });

    log.info('All vector indexes initialized successfully');
  } catch (error) {
    log.error('Failed to initialize vector indexes', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Search for similar content in vector store
 */

export const searchSimilarContent = async (
  query: string,
  indexName: string,
  topK = 5,
  tracingContext?: { currentSpan?: { createChildSpan(_input: TracingSpanInput): { end(options: SpanEndInput): void } } }
) => {
  const startTime = Date.now();

  // Create child span for vector search
  const searchSpan = tracingContext?.currentSpan?.createChildSpan({
    type: AISpanType.LLM_CHUNK,
    name: 'vector_similarity_search',
    input: {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''), // Truncate for span
      indexName,
      topK
    }
  } as TracingSpanInput);

  try {
    const vectorStore = createLibSQLVectorStore(tracingContext);
    const embedder = google.textEmbedding('gemini-embedding-001');

    // Create child span for embedding generation
    const embedSpan = tracingContext?.currentSpan?.createChildSpan({
      type: AISpanType.LLM_GENERATION,
      name: 'embedding_generation',
      input: {
        queryLength: query.length,
        model: 'gemini-embedding-001'
      }
    });

    // Call embedMany and normalize its result so we always have an embeddings array to use
        // Define a narrow type for possible embedMany return shapes and a runtime guard
        type EmbedManyResult = number[][] | { embeddings?: number[][] } | any;
        const embedResult = await embedMany({
          values: [query],
          model: embedder,
        }) as EmbedManyResult;

    const isNumberMatrix = (value: unknown): value is number[][] =>
      Array.isArray(value) && value.every(
        row => Array.isArray(row) && row.every(cell => typeof cell === 'number')
      );

    const embeddings: number[][] = isNumberMatrix(embedResult)
      ? embedResult
      : (isNumberMatrix((embedResult as { embeddings?: unknown }).embeddings)
        ? (embedResult as { embeddings: number[][] }).embeddings
        : []);

    embedSpan?.end({
      output: {
        embeddingDimension: Array.isArray(embeddings) && embeddings[0] ? embeddings[0].length : 0
      },
      metadata: {
        model: 'gemini-embedding-001',
        tokensProcessed: query.split(' ').length
      }
    });

    const results = await vectorStore.query({
      indexName,
      queryVector: embeddings[0],
      topK,
    }) as QueryResult[];

    const processingTime = Date.now() - startTime;

    // Update main search span with results
        searchSpan?.end({
          output: {
            resultsFound: results.length,
            processingTime
          },
          metadata: {
            indexName,
            topK,
            avgScore: results.length > 0 ? results.reduce((sum: number, r: QueryResult) => sum + (r.score ?? 0), 0) / results.length : 0
          }
        });

    log.info('Vector search completed', {
      query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
      indexName,
      topK,
      resultsCount: results.length,
      processingTime
    });
    return results;
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update span with error
    searchSpan?.end({
      output: {
        success: false,
        processingTime
      },
      metadata: {
        error: errorMessage,
        indexName,
        topK
      }
    });

    log.error('Failed to search similar content', {
      query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
      indexName,
      error: errorMessage,
      processingTime
    });
    throw error;
  }
};

/**
 * Memory Configuration for Research Agents
 */
export const createResearchMemory = () => {
  return new Memory({
    storage: sqlstore,
    vector: createLibSQLVectorStore(), // TODO: Pass tracingContext
    embedder: google.textEmbedding("gemini-embedding-001"),
    options: {
      lastMessages: 500,
      workingMemory: {
        enabled: true,
        template: `# Agent Memory Context
- **User Task**: Research summary, analysis, recommendations, etc.
- **Target Audience**: Who will read this report
- **Key Findings**: Important discoveries from research
- **User Goals**: User long term goals
- **Process**: How to achieve goals, & actions nessary
- **Client Requirements**: Specific requirements or constraints


Always Respond to user as well as update this!  Its critical, to not get stuck just updating your working memory.
`,
      },
      semanticRecall: {
        topK: 5,
        messageRange: { before: 3, after: 2 },
        scope: 'resource',
      },
      threads: {
      generateTitle: true, // Enable automatic title generation
      },
        },
        processors: [

    ],
    // ...
  });
};

/**
 * Memory Configuration for Report Generation Agents
 */
export const createReportMemory = () => {
  return new Memory({
    storage: createLibSQLStore(),
    vector: createLibSQLVectorStore(),
    embedder: google.textEmbedding("gemini-embedding-001"),
    options: {
      lastMessages: 100,
      workingMemory: {
        enabled: true,
        template: `# Report Generation Context
- **Report Type**: Research summary, analysis, recommendations, etc.
- **Target Audience**: Who will read this report
- **Key Findings**: Important discoveries from research
- **Structure Preferences**: Preferred report format and sections
- **Citation Style**: Preferred citation format
- **Previous Reports**: Summary of previously generated reports
- **Client Requirements**: Specific requirements or constraints`,
      },
      semanticRecall: {
        topK: 10,
        messageRange: 3,
        scope: 'resource',
      },
      threads: {
      generateTitle: true, // Enable automatic title generation
      },
    },
    processors: [

    ],
  });
};

/**
 * ExtractParams interface
 */
export interface ExtractParams {
  title?: boolean | {
    summaries?: Array<"self" | "prev" | "next">;
    nodeTemplate?: string;
    combineTemplate?: string;
  };
  summary?: boolean | {
    summaries?: Array<"self" | "prev" | "next">;
    promptTemplate?: string;
  };
  keywords?: boolean | {
    keywords?: number;
    promptTemplate?: string;
  };
  questions?: boolean | {
    questions?: number;
    promptTemplate?: string;
    embeddingOnly?: boolean;
  };
}

/**
 * Upserts a batch of vectors into the specified LibSQL vector index.
 *
 * Each vector in `vectors` is paired positionally with `metadata` and `ids` (i.e., vectors[i] ↔ metadata[i] ↔ ids[i]).
 *
 * @param indexName - Target vector index name.
 * @param vectors - Array of numeric vectors to insert.
 * @param metadata - Array of metadata objects corresponding to each vector.
 * @param ids - Array of unique IDs corresponding to each vector.
 * @returns An object with `success: true` and `count` when the upsert completes; on failure the function throws a `VectorStoreError`.
 */

export async function upsertVectors(
  indexName: string,
  vectors: ReadonlyArray<readonly number[]>,
  metadata: ReadonlyArray<Record<string, unknown>>,
  ids: readonly string[],
  tracingContext?: { context?: unknown; runtimeContext?: RuntimeContext; currentSpan?: { createChildSpan(_input: TracingSpanInput): { end(options: SpanEndInput): void } } }
): Promise<{ success: boolean; count?: number; error?: string }> {
  const startTime = Date.now();

  // Create child span for upsert operation
  const upsertSpan = tracingContext?.currentSpan?.createChildSpan({
    type: AISpanType.LLM_CHUNK,
    name: 'vector_upsert_operation',
    input: {
      indexName,
      vectorCount: vectors.length,
      idsLength: ids.length
    }
  } as TracingSpanInput);

  try {
    const vectorStore = createLibSQLVectorStore(tracingContext);

    // Convert readonly inputs to mutable arrays expected by the vector store implementation
    const mutableVectors = vectors.map(row => Array.from(row));
    const mutableMetadata = metadata.map(m => ({ ...m }));
    const mutableIds = Array.from(ids);

    await vectorStore.upsert({
      indexName,
      vectors: mutableVectors,
      metadata: mutableMetadata,
      ids: mutableIds,
    });

    const processingTime = Date.now() - startTime;

    // Update span with success
    upsertSpan?.end({
      output: {
        success: true,
        count: vectors.length,
        processingTime
      },
      metadata: {
        operation: 'upsert_vectors',
        indexName
      }
    });

    log.info('Vectors upserted successfully', {
      indexName,
      count: vectors.length,
      processingTime
    });

    return { success: true, count: vectors.length };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update span with error
    upsertSpan?.end({
      output: {
        success: false,
        processingTime
      },
      metadata: {
        error: errorMessage,
        operation: 'upsert_vectors',
        indexName,
        vectorCount: vectors.length
      }
    });

    log.error('Failed to upsert vectors', {
      indexName,
      count: vectors.length,
      error: errorMessage,
      processingTime
    });

    throw new VectorStoreError(errorMessage, 'upsert_vectors', {
      indexName,
      vectorCount: vectors.length,
      idsLength: ids.length
    });
  }
}
/**
 * Create a vector index in the configured vector store.
 *
 * Attempts to create an index with the provided name, embedding dimension, and similarity metric.
 * If a tracing context is provided, a child span for the index creation will be created and ended
 * with success or error metadata.
 *
 * @param indexName - The name of the index to create.
 * @param dimension - Embedding dimension for the index (defaults to STORAGE_CONFIG.DEFAULT_DIMENSION).
 * @param metric - Similarity metric to use for the index: `'cosine'`, `'euclidean'`, or `'dotproduct'` (defaults to `'cosine'`).
 * @returns A promise that resolves to an object with `success: true` when the index is created.
 * @throws VectorStoreError when index creation fails.
 */

export async function createVectorIndex(
  indexName: string,
  dimension = STORAGE_CONFIG.DEFAULT_DIMENSION,
  metric: 'cosine' | 'euclidean' | 'dotproduct' = 'cosine',
  tracingContext?: { currentSpan?: { createChildSpan(input: TracingSpanInput): { end(options: SpanEndInput): void } } }
): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now();

// Create child span for index creation
const indexSpan = tracingContext?.currentSpan?.createChildSpan({
  type: AISpanType.LLM_GENERATION,
  name: 'vector_index_creation',
  input: {
    indexName,
    dimension,
    metric,
  }
} as TracingSpanInput);

  try {
    const vectorStore = createLibSQLVectorStore(tracingContext);
    await vectorStore.createIndex({
      indexName,
      dimension,
      metric,
    });
    const processingTime = Date.now() - startTime;
    // Update span with success
    indexSpan?.end({
      output: {
        success: true,
        processingTime
      },
      metadata: {
        operation: 'create_vector_index',
        indexName,
        dimension,
        metric
      }
    });

    log.info('Vector index created successfully', { indexName, dimension, metric, processingTime });
    return { success: true };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update span with error
    indexSpan?.end({
      output: {
        success: false,
        processingTime
      },
      metadata: {
        error: errorMessage,
        operation: 'create_vector_index',
        indexName,
        dimension,
        metric
      }
    });

    log.error('Failed to create vector index', {
      indexName,
      dimension,
      error: errorMessage,
      processingTime
    });

    throw new VectorStoreError(errorMessage, 'create_vector_index', {
      indexName,
      dimension,
      metric
    });
  }
}

/**
 * Query a LibSQL vector index for nearest neighbors and return normalized results.
 *
 * Performs a vector similarity query against the specified index and returns an array of
 * QueryResult objects normalized to { id, score, metadata }. The function creates a tracing
 * child span (when a tracing context is provided), records processing time, and throws a
 * VectorStoreError on failure.
 *
 * @param indexName - Name of the vector index to query.
 * @param queryVector - The query embedding vector.
 * @param topK - Maximum number of nearest neighbors to return (default: 5).
 * @param filter - Optional filter expression passed through to the underlying vector store.
 * @param includeVector - If true, requests raw vectors from the store (the returned results are still normalized and do not include the vector payload).
 *
 * @returns A promise that resolves to an array of QueryResult objects with `id`, `score`, and `metadata`.
 *
 * @throws VectorStoreError - Thrown when the vector store query fails; the error contains operation and context details.
 */

export async function queryVectors(
  indexName: string,
  queryVector: readonly number[],
  topK = 5,
  filter?: Readonly<Parameters<LibSQLVector['query']>[0]['filter']>,
  includeVector = false,
  tracingContext?: { context?: unknown; runtimeContext?: RuntimeContext; currentSpan?: { createChildSpan(input: TracingSpanInput): { end(options: SpanEndInput): void } } }
): Promise<QueryResult[]> {
  const startTime = Date.now();

  // Create child span for query operation
  const querySpan = tracingContext?.currentSpan?.createChildSpan({
    type: AISpanType.TOOL_CALL,
    name: 'vector_query_operation',
    input: {
      indexName,
      queryVectorDimension: queryVector.length,
      topK,
      hasFilter: !!filter,
      includeVector
    }
  } as TracingSpanInput);

  try {
    const vectorStore = createLibSQLVectorStore(tracingContext);
    const results = await vectorStore.query({
      indexName,
      queryVector: Array.from(queryVector),
      topK,
      filter,
      includeVector,
    }) as QueryResult[];

    const processingTime = Date.now() - startTime;

    // Update span with success
    querySpan?.end({
      output: {
        resultsCount: results.length,
        processingTime
      },
      metadata: {
        operation: 'query_vectors',
        indexName,
        topK
      }
    });

    log.info('Vector query completed successfully', {
      indexName,
      topK,
      resultsCount: results.length,
      processingTime
    });

    return results.map(result => ({
      id: result.id,
      score: result.score,
      metadata: result.metadata ?? {},
    })) as QueryResult[];
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update span with error
    querySpan?.end({
      output: {
        success: false,
        processingTime
      },
      metadata: {
        error: errorMessage,
        operation: 'query_vectors',
        indexName,
        topK
      }
    });

    log.error('Failed to query vectors', {
      indexName,
      topK,
      error: errorMessage,
      processingTime
    });

    throw new VectorStoreError(errorMessage, 'query_vectors', {
      indexName,
      topK,
      hasFilter: !!filter,
      includeVector
    });
  }
}

/**
 * Search a Memory store for messages semantically similar to a query and normalize results.
 *
 * Performs an embedding for the query, runs a semantic recall against the provided Memory (scoped to the thread),
 * and converts varied memory response shapes into a consistent array of Message and UIMessage objects.
 *
 * The function tolerates multiple memory result shapes (e.g., `messages`, `messagesV2`, or a raw array),
 * normalizes roles into the Message.role union, extracts text from `content` or `parts`, and preserves `createdAt`
 * and thread identifiers when available. On error the function logs the failure and returns empty arrays.
 *
 * @param threadId - Identifier of the thread to constrain the recall to.
 * @param query - Free-text query used for semantic search.
 * @param topK - Maximum number of messages to return (default: 5).
 * @returns An object with `messages` (normalized Message[]) and `uiMessages` (UI-friendly message view).
 */

export async function searchMemoryMessages(
  memory: Readonly<Memory>,
  threadId: string,
  query: string,
  topK = 5
): Promise<{ messages: Message[]; uiMessages: UIMessage[] }> {
  try {
    const embedder = google.textEmbedding("gemini-embedding-001");

    await embedMany({
      values: [query],
      model: embedder,
    });

    const recalled = await memory.query({
      threadId,
      selectBy: {
        vectorSearchString: query,
      },
      threadConfig: {
        semanticRecall: {
          topK,
          messageRange: 2,
          scope: 'thread',
        },
      },
    }) as { messages?: unknown[]; uiMessages?: unknown[]; };

    // memory.query can return different shapes; prefer .messages or .messagesV2, fallback to array if provided
    const recalledMessagesArray: unknown[] =
      Array.isArray((recalled as { messages?: unknown[] }).messages) ? (recalled as { messages: unknown[] }).messages
      : Array.isArray((recalled as { messagesV2?: unknown[] }).messagesV2) ? (recalled as { messagesV2: unknown[] }).messagesV2
      : Array.isArray(recalled) ? recalled as unknown[]
      : [];

    const normalizeRole = (r?: string | null): Message['role'] => {
      if (r === null) {
        return 'user';
      }
      const s = String(r).toLowerCase();
      if (s === 'system') {
        return 'system';
      }
      if (s === 'assistant' || s === 'bot') {
        return 'assistant';
      }
      if (s === 'data') {
        return 'data';
      }
      if (s === 'user' || s === 'human') {
        return 'user';
      }
      return 'user';
    };

    const relevantMessages = recalledMessagesArray.map((msg: unknown, idx: number) => {
      const msgObj = msg as { id?: string; role?: string; sender?: string; roleName?: string; content?: string; parts?: Array<{ text?: string; content?: string }>; createdAt?: string; timestamp?: string; threadId?: string; thread_id?: string };
      const safeId = msgObj.id ?? `${threadId}-msg-${idx}-${Date.now()}`;
      const role = normalizeRole(msgObj.role ?? msgObj.sender ?? msgObj.roleName);
      const content = msgObj.content ?? (msgObj.parts?.map((p) => p.text ?? p.content).join('') ?? '');
      const createdAtRaw = msgObj.createdAt ?? msgObj.timestamp;
      const createdAt = typeof createdAtRaw !== 'undefined' ? new Date(createdAtRaw as string | number | Date) : undefined;
      const thread = msgObj.threadId ?? msgObj.thread_id;
      return {
        id: safeId,
        role,
        content,
        createdAt,
        threadId: thread,
      } as Message;
    });

    log.info('Memory search completed', {
      threadId,
      query,
      topK,
      foundMessages: relevantMessages.length
    });

    const uiMessages = relevantMessages.map((m: Readonly<Message>) => {
      return {
              id: m.id,
              role: m.role,
              content: m.content,
              createdAt: m.createdAt,
              threadId: m.threadId,
            } as unknown as UIMessage;
    });

    return {
      messages: relevantMessages,
      uiMessages
    };
  } catch (error) {
    log.error('Failed to search memory messages', {
      threadId,
      query,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return { messages: [], uiMessages: [] };
  }
}

/**
 * Vector store error class
 */
export class VectorStoreError extends Error {
  public operation: string;
  public context: Record<string, unknown>;

  constructor(message: string, operation: string, context: Record<string, unknown> = {}) {
    super(message);
    this.name = 'VectorStoreError';
    this.operation = operation;
    this.context = context;
  }
}

/**
 * LibSQL vector store instance
 */
export const upstashVector = createLibSQLVectorStore();

/**
 * Convert V2 message format to simplified structure
 */
interface MessagePart {
  text?: string;
  content?: string;
}

interface MessageV2 {
  id?: string;
  role?: string;
  content?: string;
  parts?: MessagePart[];
  createdAt?: string;
  thread_id?: string;
  format?: string;
}

export const simplifyMessages = (messages: readonly MessageV2[]) => {
  return messages.map((msg: Readonly<MessageV2>) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content ?? (msg.parts?.map((part) => part.text ?? part.content).join('') ?? ''),
    createdAt: msg.createdAt,
    threadId: msg.thread_id,
    format: msg.format ?? 'v2'
  }));
};

/**
 * Get or create user resource for working memory
 */

export const getOrCreateUserResource = async (memory: Memory, userId: string) => {
  try {
    const {storage} = memory; // Already confirmed to be LibSQLStore type

    let userResource = await storage.getResourceById({ resourceId: userId });

    if (userResource) {
      return userResource;
    }

    await storage.saveResource({
      resource: {
        id: userId,
        workingMemory: `# User Research Context for ${userId}
- **Research Interests**: To be populated during conversations
- **Preferred Sources**: To be populated during conversations
- **Previous Research**: To be populated during conversations
- **Contact Information**: User ID: ${userId}`,
        createdAt: new Date(), // Changed to Date object
        updatedAt: new Date(), // Changed to Date object
        metadata: {
          resourceId: userId, // Keep resourceId in metadata for consistency/retrieval
          preferences: {},
          tags: ['research-user']
        }
      }
    });

    log.info('Created new user resource', { userId });

    // Re-fetch the resource after creation to ensure it's fully populated and consistent
    userResource = await storage.getResourceById({ resourceId: userId });
    return userResource;
  } catch (error) {
    log.error('Failed to get or create user resource', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Update user working memory
 */

export const updateUserWorkingMemory = async (memory: Memory, userId: string, updates: { workingMemory: string; metadata?: Record<string, unknown> } & Record<string, unknown>) => {
  try {
    await memory.storage?.updateResource({
      resourceId: userId,
      workingMemory: updates.workingMemory,
      metadata: {
        ... (updates.metadata!),
        updatedAt: new Date(), // Moved updatedAt back into metadata
        // resourceId: userId // This property is not needed here, as it's already resourceId
      }
    });

    log.info('Updated user working memory', { userId });
  } catch (error) {
    log.error('Failed to update user working memory', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

/**
 * Chunk with metadata for processing
 */
export interface ChunkWithMetadata {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
}

/**
 * Augment each chunk's metadata by extracting optional fields (title, summary, keywords, questions).
 *
 * The `extractParams` flags control which fields are added:
 * - title: adds `extractedTitle` (boolean uses simple heuristics; object form yields an advanced placeholder).
 * - summary: adds `extractedSummary` (boolean uses a short prefix; object form adds `extractedSummaries` keyed by requested types).
 * - keywords: adds `extractedKeywords` (boolean uses simple frequency-based extraction; object form returns placeholder keywords).
 * - questions: adds `extractedQuestions` (boolean extracts sentences ending with `?`; object form returns placeholder questions).
 *
 * The function returns a new array of chunks where each chunk is a shallow copy with its `metadata` replaced by an augmented metadata object; the original input array and its objects are not mutated.
 *
 * @param chunks - Array of chunks with `content` and `metadata` to enhance.
 * @param extractParams - Controls which metadata fields to extract and whether to use simple or advanced extraction.
 * @returns A new array of chunks with augmented metadata containing any of: `extractedTitle`, `extractedSummary`, `extractedSummaries`, `extractedKeywords`, `extractedQuestions`.
 */

export function extractChunkMetadata(
  chunks: ChunkWithMetadata[],
  extractParams: ExtractParams
): ChunkWithMetadata[] {
  const enhancedChunks = [...chunks];

  chunks.forEach((chunk, index) => {
    const enhancedMetadata: Record<string, unknown> = { ...chunk.metadata };

    if (extractParams.title) {
      if (typeof extractParams.title === 'boolean') {
        const firstLine = chunk.content.split('\n')[0]?.trim();
        const firstSentence = chunk.content.split(/[.!?]/)[0]?.trim();
        enhancedMetadata.extractedTitle = firstLine || firstSentence || `Chunk ${index + 1}`;
      } else {
        enhancedMetadata.extractedTitle = `Advanced Title ${index + 1}`;
      }
    }

    if (extractParams.summary) {
      if (typeof extractParams.summary === 'boolean') {
        enhancedMetadata.extractedSummary = `${chunk.content.substring(0, 100)}...`;
      } else {
        const summaries: Record<string, string> = {};
        if ((extractParams.summary.summaries?.includes('self')) ?? false) {
          summaries.self = `${chunk.content.substring(0, 150)}...`;
        }
        enhancedMetadata.extractedSummaries = summaries;
      }
    }

    if (extractParams.keywords) {
      if (typeof extractParams.keywords === 'boolean') {
        const words = chunk.content.toLowerCase().match(/\b\w{4,}\b/g) ?? [];
        const wordCount: Record<string, number> = {};
        words.forEach(word => {
          wordCount[word] = (wordCount[word] || 0) + 1;
        });
        const topKeywords = Object.entries(wordCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([word]) => word);
        enhancedMetadata.extractedKeywords = topKeywords;
      } else {
        enhancedMetadata.extractedKeywords = [`keyword1`, `keyword2`, `keyword3`];
      }
    }

    if (extractParams.questions) {
      if (typeof extractParams.questions === 'boolean') {
        const questions = chunk.content.split(/[.!?]/)
          .map(s => s.trim())
          .filter(s => s.endsWith('?'))
          .slice(0, 3);
        enhancedMetadata.extractedQuestions = questions;
      } else {
        enhancedMetadata.extractedQuestions = [
          `What is the main topic of this chunk?`,
          `What are the key points discussed?`
        ];
      }
    }

    enhancedChunks[index] = {
      ...chunk,
      metadata: enhancedMetadata
    };
  });

  log.info('Metadata extraction completed', {
    chunksProcessed: chunks.length,
    extractParams: Object.keys(extractParams)
  });

  return enhancedChunks;
}

/**
 * Storage health check
 */

export const performStorageHealthCheck = async (context: 'research' | 'report' = 'research') => {
  const results = {
    storage: false,
    vectorStore: false,
    indexes: {} as Record<string, boolean>,
    errors: [] as string[]
  };

  // Decision logic for index selection based on context
  const relevantIndexes = context === 'research'
    ? [STORAGE_CONFIG.VECTOR_INDEXES.RESEARCH_DOCUMENTS, STORAGE_CONFIG.VECTOR_INDEXES.LEARNINGS]
    : [STORAGE_CONFIG.VECTOR_INDEXES.REPORTS, STORAGE_CONFIG.VECTOR_INDEXES.WEB_CONTENT];

  try {
    createLibSQLStore();
    results.storage = true;
    log.info('Storage connectivity check passed');
  } catch (error) {
    results.errors.push(`Storage check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  try {
    createLibSQLVectorStore();
    results.vectorStore = true;
    log.info('Vector store connectivity check passed');
  } catch (error) {
    results.errors.push(`Vector store check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  for (const indexName of relevantIndexes) {
    try {
      const vectorStore = createLibSQLVectorStore();
      await vectorStore.query({
        indexName,
        queryVector: new Array(STORAGE_CONFIG.DEFAULT_DIMENSION).fill(0),
        topK: 1,
      });
      results.indexes[indexName] = true;
    } catch (error) {
      results.indexes[indexName] = false;
      results.errors.push(`Index '${indexName}' check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const overallHealth = results.storage && results.vectorStore && Object.values(results.indexes).every(Boolean);

  log.info('Storage health check completed', {
    overallHealth,
    context,
    relevantIndexes,
    results,
    errorCount: results.errors.length
  });

  // MCP integration: Log for mastraDocs reference
  log.info('For storage documentation, refer to mastraDocs path: reference/storage/', {
    context
  });

  return {
    healthy: overallHealth,
    ...results
  };
};

/**
 * Initialize complete storage system
 */

export const initializeStorageSystem = async (context: 'research' | 'report' = 'research') => {
  try {
    log.info('Initializing complete storage system...', { context });

    await initializeVectorIndexes();

    const healthCheck = await performStorageHealthCheck(context);

    if (healthCheck.healthy) {
      log.info('Storage system initialized successfully', { context });
      return { success: true, healthCheck };
    } else {
      log.warn('Storage system initialized with issues', { healthCheck, context });
      return { success: false, healthCheck };
    }
  } catch (error) {
    log.error('Failed to initialize storage system', {
      error: error instanceof Error ? error.message : 'Unknown error',
      context
    });
    throw error;
  }
};
