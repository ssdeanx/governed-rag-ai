/**
 * Langfuse Exporter for Mastra AI Tracing
 *
 * This exporter sends tracing data to Langfuse for AI observability.
 * Root spans start traces in Langfuse.
 * LLM_GENERATION spans become Langfuse generations, all others become spans.
 */

import type {
  AITracingExporter,
  AITracingEvent,
  AnyExportedAISpan,
  LLMGenerationAttributes,
} from '@mastra/core/ai-tracing';
import { AISpanType, AITracingEventType, omitKeys } from '@mastra/core/ai-tracing';
import { ConsoleLogger } from '@mastra/core/logger';
import { Langfuse } from 'langfuse';
import type { LangfuseTraceClient, LangfuseSpanClient, LangfuseGenerationClient, LangfuseEventClient } from 'langfuse';

export interface LangfuseExporterConfig {
  /** Langfuse API key */
  publicKey?: string;
  /** Langfuse secret key */
  secretKey?: string;
  /** Langfuse host URL */
  baseUrl?: string;
  /** Enable realtime mode - flushes after each event for immediate visibility */
  realtime?: boolean;
  /** Logger level for diagnostic messages (default: 'warn') */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  /** Additional options to pass to the Langfuse client */
  options?: Record<string, unknown>;
}

interface TraceData {
  trace: LangfuseTraceClient; // Langfuse trace object
  spans: Map<string, LangfuseSpanClient | LangfuseGenerationClient>; // Maps span.id to Langfuse span/generation
  events: Map<string, LangfuseEventClient>; // Maps span.id to Langfuse event
}

type LangfuseParent = LangfuseTraceClient | LangfuseSpanClient | LangfuseGenerationClient | LangfuseEventClient;

export class LangfuseExporter implements AITracingExporter {
  name = 'langfuse';
  private readonly client: Langfuse | null;
  private readonly realtime: boolean;
  private readonly traceMap = new Map<string, TraceData>();
  private readonly logger: ConsoleLogger;

  constructor(config: LangfuseExporterConfig) {
    this.realtime = config.realtime ?? false;
    this.logger = new ConsoleLogger({ level: config.logLevel ?? 'warn' });

    const hasPublicKey = typeof config.publicKey === 'string' && config.publicKey.length > 0;
    const hasSecretKey = typeof config.secretKey === 'string' && config.secretKey.length > 0;

    if (!hasPublicKey || !hasSecretKey) {
      this.logger.error('LangfuseExporter: Missing required credentials, exporter will be disabled', {
        hasPublicKey,
        hasSecretKey,
      });
      // Create a no-op client to prevent runtime errors
      this.client = null;
      return;
    }

    this.client = new Langfuse({
      publicKey: config.publicKey,
      secretKey: config.secretKey,
      baseUrl: config.baseUrl,
      ...config.options,
      persistence: 'localStorage'
    });
  }

  async exportEvent(event: AITracingEvent): Promise<void> {
    if (!this.client) {
      // Exporter is disabled due to missing credentials
      return;
    }

    if (event.exportedSpan.isEvent) {
      await this.handleEventSpan(event.exportedSpan);
      return;
    }

    switch (event.type) {
      case AITracingEventType.SPAN_STARTED:
        await this.handleSpanStarted(event.exportedSpan);
        break;
      case AITracingEventType.SPAN_UPDATED:
        await this.handleSpanUpdateOrEnd(event.exportedSpan, false);
        break;
      case AITracingEventType.SPAN_ENDED:
        await this.handleSpanUpdateOrEnd(event.exportedSpan, true);
        break;
    }

    // Flush immediately in realtime mode for instant visibility
    if (this.realtime) {
      await this.client.flushAsync();
    }
  }

  private async handleSpanStarted(span: AnyExportedAISpan): Promise<void> {
    if (span.isRootSpan) {
      this.initTrace(span);
    }
    const method = 'handleSpanStarted';

    const traceData = this.getTraceData({ span, method });
    if (!traceData) {
      return;
    }

    const langfuseParent = this.getLangfuseParent({ traceData, span, method });
    if (!langfuseParent) {
      return;
    }

    const payload = this.buildSpanPayload(span, true);

    const langfuseSpan =
      span.type === AISpanType.LLM_GENERATION ? langfuseParent.generation(payload) : langfuseParent.span(payload);

    traceData.spans.set(span.id, langfuseSpan);
  }

  private async handleSpanUpdateOrEnd(span: AnyExportedAISpan, isEnd: boolean): Promise<void> {
    const method = isEnd ? 'handleSpanEnd' : 'handleSpanUpdate';

    const traceData = this.getTraceData({ span, method });
    if (!traceData) {
      return;
    }

    const langfuseSpan = traceData.spans.get(span.id);
    if (!langfuseSpan) {
      this.logger.warn('Langfuse exporter: No Langfuse span found for span update/end', {
        traceId: span.traceId,
        spanId: span.id,
        spanName: span.name,
        spanType: span.type,
        isRootSpan: span.isRootSpan,
        parentSpanId: span.parentSpanId,
        method,
      });
      return;
    }

    // use update for both update & end, so that we can use the
    // end time we set when ending the span.
    langfuseSpan.update(this.buildSpanPayload(span, false));

    if (isEnd && span.isRootSpan) {
      traceData.trace.update({ output: span.output });
      this.traceMap.delete(span.traceId);
    }
  }

  private async handleEventSpan(span: AnyExportedAISpan): Promise<void> {
    if (span.isRootSpan) {
      this.logger.debug('Langfuse exporter: Creating trace', {
        traceId: span.traceId,
        spanId: span.id,
        spanName: span.name,
        method: 'handleEventSpan',
      });
      this.initTrace(span);
    }
    const method = 'handleEventSpan';

    const traceData = this.getTraceData({ span, method });
    if (!traceData) {
      return;
    }

    const langfuseParent = this.getLangfuseParent({ traceData, span, method });
    if (!langfuseParent) {
      return;
    }

    const payload = this.buildSpanPayload(span, true);

    const langfuseEvent = langfuseParent.event(payload);

    traceData.events.set(span.id, langfuseEvent);
  }

  private initTrace(span: AnyExportedAISpan): void {
    if (!this.client) {
      this.logger.error('Langfuse exporter: initTrace called without a Langfuse client - exporter is disabled', {
        traceId: span.traceId,
        spanId: span.id,
      });
      return;
    }
    const trace = this.client.trace(this.buildTracePayload(span));
    this.traceMap.set(span.traceId, { trace, spans: new Map(), events: new Map() });
  }

  private getTraceData(options: { span: AnyExportedAISpan; method: string }): TraceData | undefined {
    const { span, method } = options;
    if (this.traceMap.has(span.traceId)) {
      return this.traceMap.get(span.traceId);
    }
    this.logger.warn('Langfuse exporter: No trace data found for span', {
      traceId: span.traceId,
      spanId: span.id,
      spanName: span.name,
      spanType: span.type,
      isRootSpan: span.isRootSpan,
      parentSpanId: span.parentSpanId,
      method,
    });
  }

  private getLangfuseParent(options: {
    traceData: TraceData;
    span: AnyExportedAISpan;
    method: string;
  }): LangfuseParent | undefined {
    const { traceData, span, method } = options;

    const parentId = span.parentSpanId;
    // Explicitly check for undefined, null or empty string to avoid unexpected nullable checks
    if (parentId === undefined || parentId === null || parentId === '') {
      return traceData.trace;
    }
    if (traceData.spans.has(parentId)) {
      return traceData.spans.get(parentId);
    }
    if (traceData.events.has(parentId)) {
      return traceData.events.get(parentId);
    }
    this.logger.warn('Langfuse exporter: No parent data found for span', {
      traceId: span.traceId,
      spanId: span.id,
      spanName: span.name,
      spanType: span.type,
      isRootSpan: span.isRootSpan,
      parentSpanId: span.parentSpanId,
      method,
    });
  }

  private buildTracePayload(span: AnyExportedAISpan): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      id: span.traceId,
      name: span.name,
    };

    const { userId, sessionId, ...remainingMetadata } = span.metadata ?? {};

    if (userId !== undefined && userId !== null && userId !== '') {
      payload.userId = userId;
    }
    if (sessionId !== undefined && sessionId !== null && sessionId !== '') {
      payload.sessionId = sessionId;
    }
    if (span.input !== undefined && span.input !== null) {
      payload.input = span.input;
    }

    payload.metadata = {
      spanType: span.type,
      ...span.attributes,
      ...remainingMetadata,
    };

    return payload;
  }

  private buildSpanPayload(span: AnyExportedAISpan, isCreate: boolean): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    if (isCreate) {
      payload.id = span.id;
      payload.name = span.name;
      payload.startTime = span.startTime;
      if (span.input !== undefined) {
        payload.input = span.input;
      }
    }

    if (span.output !== undefined) {
      payload.output = span.output;
    }
    if (span.endTime !== undefined) {
      payload.endTime = span.endTime;
    }

    const attributes = (span.attributes ?? {}) as Record<string, unknown>;

    // Strip special fields from metadata if used in top-level keys
    const attributesToOmit: string[] = [];

    if (span.type === AISpanType.LLM_GENERATION) {
      const llmAttr = attributes as unknown as Partial<LLMGenerationAttributes>;

      if (llmAttr.model !== undefined) {
        payload.model = llmAttr.model;
        attributesToOmit.push('model');
      }

      if (llmAttr.usage !== undefined) {
        payload.usage = llmAttr.usage;
        attributesToOmit.push('usage');
      }

      if (llmAttr.parameters !== undefined) {
        payload.modelParameters = llmAttr.parameters;
        attributesToOmit.push('parameters');
      }
    }

    payload.metadata = {
      spanType: span.type,
      ...omitKeys(attributes, attributesToOmit),
      ...span.metadata,
    };

    if (span.errorInfo) {
      payload.level = 'ERROR';
      payload.statusMessage = span.errorInfo.message;
    }

    return payload;
  }

  async shutdown(): Promise<void> {
    if (this.client) {
      await this.client.shutdownAsync();
    }
    this.traceMap.clear();
  }
}

