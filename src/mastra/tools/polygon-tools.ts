import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { AISpanType } from "@mastra/core/ai-tracing";
import type { RuntimeContext } from "@mastra/core/runtime-context";
import {
  logStepStart,
  logStepEnd,
  logError,
  logToolExecution,
} from "../config/logger";

/**
 * Governance-aware Runtime Context for Polygon.io tools
 * Includes security, tenant, and access control information
 */
interface PolygonRuntimeContext extends RuntimeContext {
  // API Configuration
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;

  // Governance & Security Context
  userId?: string;
  tenantId?: string;
  roles?: string[];
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
  classificationLevel?: 'public' | 'internal' | 'confidential';
  currentTime?: Date;
  sessionId?: string;

  // Access Control
  allowedClassifications?: string[];
  maxRequestsPerHour?: number;
  rateLimitRemaining?: number;

  // Audit & Compliance
  requestId?: string;
  correlationId?: string;
  source?: string;
}

/**
 * Polygon.io Stock Quotes Tool
 *
 * Specialized for real-time stock market quotes and trades:
 * - Real-time quotes (QUOTES)
 * - Recent trades (TRADES)
 * - Market snapshots (SNAPSHOT)
 * - Previous close prices (PREVIOUS_CLOSE)
 *
 * Requires POLYGON_API_KEY environment variable or runtimeContext.apiKey
 */
export const polygonStockQuotesTool = createTool({
  id: "polygon-stock-quotes",
  description: "Access real-time stock quotes, trades, and market snapshots from Polygon.io",
  inputSchema: z.object({
    function: z.enum([
      "QUOTES",
      "TRADES",
      "SNAPSHOT",
      "PREVIOUS_CLOSE"
    ]).describe("Polygon.io stock quotes function"),
    symbol: z.string().describe("Stock symbol (e.g., 'AAPL', 'MSFT', 'GOOGL')"),
    limit: z.number().optional().describe("Maximum number of results to return (max 50000)"),
    sort: z.enum(["asc", "desc"]).optional().describe("Sort order for results")
  }),
  outputSchema: z.object({
    data: z.any().describe("The stock quotes data returned from Polygon.io API"),
    metadata: z.object({
      function: z.string(),
      symbol: z.string().optional(),
      status: z.string().optional(),
      request_id: z.string().optional(),
      count: z.number().optional()
    }).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context, tracingContext, runtimeContext }) => {
    const startTime = Date.now();

  const apiKey = process.env.POLYGON_API_KEY;

    // Governance checks
    const governanceCtx = runtimeContext as PolygonRuntimeContext;
    const userId = governanceCtx?.userId;
    const tenantId = governanceCtx?.tenantId;
    const roles = governanceCtx?.roles ?? [];
    const subscriptionTier = governanceCtx?.subscriptionTier ?? 'free';
    const classificationLevel = governanceCtx?.classificationLevel ?? 'public';
    const currentTime = governanceCtx?.currentTime ?? new Date();

    logToolExecution('polygon-stock-quotes', { input: context });

    // Create root tracing span with governance context
    const rootSpan = tracingContext?.currentSpan?.createChildSpan({
      type: AISpanType.TOOL_CALL,
      name: 'polygon-stock-quotes-tool',
      input: {
        function: context.function,
        symbol: context.symbol,
        limit: context.limit,
        sort: context.sort,
        governance: {
          userId,
          tenantId,
          roles,
          subscriptionTier,
          classificationLevel,
          currentTime: currentTime.toISOString(),
        },
      },
    });

    // Log governance context for audit
    logToolExecution('polygon-stock-quotes', {
      input: context,
      governance: {
        userId,
        tenantId,
        roles,
        subscriptionTier,
        classificationLevel,
        currentTime: currentTime.toISOString(),
        requestId: governanceCtx?.requestId,
        correlationId: governanceCtx?.correlationId
      }
    });

    if (apiKey === undefined || apiKey === null || apiKey.trim() === '') {
      const error = "POLYGON_API_KEY environment variable or runtimeContext.apiKey is required";
      logError('polygon-stock-quotes', new Error(error), {
        context,
        governance: { userId, tenantId, roles, subscriptionTier }
      });

      rootSpan?.error({
        error: new Error(error),
        metadata: { operation: 'polygon-stock-quotes', reason: 'missing-api-key' },
      });

      return {
        data: null,
        error
      };
    }

    try {
      let url: string;

      switch (context.function) {
        case "QUOTES":
          url = `https://api.polygon.io/v3/quotes/${context.symbol}`;
          break;
        case "TRADES":
          url = `https://api.polygon.io/v3/trades/${context.symbol}`;
          break;
        case "SNAPSHOT":
          url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${context.symbol}`;
          break;
        case "PREVIOUS_CLOSE":
          url = `https://api.polygon.io/v2/aggs/ticker/${context.symbol}/prev`;
          break;
        default: {
          const error = `Unsupported function: ${context.function}`;
          logError('polygon-stock-quotes', new Error(error), { context });

          rootSpan?.error({
            error: new Error(error),
            metadata: { operation: 'polygon-stock-quotes', reason: 'unsupported-function' },
          });

          return {
            data: null,
            error
          };
        }
      }

      // Add API key and optional parameters
      const params = new URLSearchParams();
      params.append('apiKey', apiKey);

      if (context.limit !== undefined && context.limit !== null) {
        params.append('limit', context.limit.toString());
      }
      if (context.sort !== undefined && context.sort !== null) {
        params.append('sort', context.sort);
      }

      const finalUrl = `${url}?${params.toString()}`;
      const redactedUrl = apiKey ? finalUrl.replace(apiKey, '[REDACTED]') : finalUrl;

      // Create child span for API call
      const apiSpan = rootSpan?.createChildSpan({
        type: AISpanType.TOOL_CALL,
        name: 'polygon-api-call',
        input: { url: redactedUrl, method: 'GET' },
      });

      logStepStart('polygon-api-call', {
        function: context.function,
        symbol: context.symbol,
        url: redactedUrl
      });

      const apiStartTime = Date.now();
      const response = await fetch(finalUrl);
      const data = await response.json();
      const apiDuration = Date.now() - apiStartTime;

      apiSpan?.end({
        output: {
          status: response.status,
          statusText: response.statusText,
          dataSize: JSON.stringify(data).length
        }
      });

      logStepEnd('polygon-api-call', {
        status: response.status,
        dataSize: JSON.stringify(data).length
      }, apiDuration);

      // Check for API errors
      if (data !== null && typeof data === 'object' && 'error' in (data as Record<string, unknown>)) {
        const errorValue = (data as Record<string, unknown>)['error'];
        if (errorValue !== null && errorValue !== undefined && String(errorValue).trim() !== '') {
          const error = String(errorValue);
          logError('polygon-stock-quotes', new Error(error), {
            context,
            responseStatus: response.status
          });

          rootSpan?.error({
            error: new Error(error),
            metadata: {
              operation: 'polygon-stock-quotes',
              reason: 'api-error',
              status: response.status
            },
          });

          return {
            data: null,
            error
          };
        }
      }

      const result = {
        data,
        metadata: {
          function: context.function,
          symbol: context.symbol,
          status: data.status,
          request_id: data.request_id,
          count: data.count
        },
        error: undefined
      };

      const totalDuration = Date.now() - startTime;
      logStepEnd('polygon-stock-quotes', {
        success: true,
        function: context.function,
        symbol: context.symbol,
        dataPoints: (data !== null && typeof data === 'object' && 'count' in data && typeof data.count === 'number') ? data.count : 0
      }, totalDuration);

      rootSpan?.end({
        output: {
          success: true,
          function: context.function,
          symbol: context.symbol,
          dataPoints: (data !== null && typeof data === 'object' && 'count' in data && typeof data.count === 'number') ? data.count : 0,
          processingTimeMs: totalDuration,
        },
      });

      return result;

    } catch (error) {
      const totalDuration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      logError('polygon-stock-quotes', error, {
        context,
        processingTimeMs: totalDuration
      });

      rootSpan?.error({
        error: error instanceof Error ? error : new Error(errorMessage),
        metadata: {
          operation: 'polygon-stock-quotes',
          processingTimeMs: totalDuration,
        },
      });

      return {
        data: null,
        error: errorMessage
      };
    }
  }
});

/**
 * Polygon.io Stock Aggregates Tool
 *
 * Specialized for historical stock price aggregates (bars):
 * - Historical price bars with customizable timeframes
 * - Support for different multipliers and timespans
 * - Date range filtering
 *
 * Requires POLYGON_API_KEY environment variable
 */
export const polygonStockAggregatesTool = createTool({
  id: "polygon-stock-aggregates",
  description: "Access historical stock price aggregates (bars) from Polygon.io with customizable timeframes",
  inputSchema: z.object({
    symbol: z.string().describe("Stock symbol (e.g., 'AAPL', 'MSFT', 'GOOGL')"),
    multiplier: z.number().describe("Multiplier for aggregate bars (e.g., 1, 5, 15)"),
    timespan: z.enum(["minute", "hour", "day", "week", "month", "quarter", "year"]).describe("Timespan for aggregate bars"),
    from: z.string().optional().describe("Start date for historical data (YYYY-MM-DD)"),
    to: z.string().optional().describe("End date for historical data (YYYY-MM-DD)"),
    limit: z.number().optional().describe("Maximum number of results to return (max 50000)"),
    sort: z.enum(["asc", "desc"]).optional().describe("Sort order for results")
  }),
  outputSchema: z.object({
    data: z.any().describe("The stock aggregates data returned from Polygon.io API"),
    metadata: z.object({
      symbol: z.string().optional(),
      status: z.string().optional(),
      request_id: z.string().optional(),
      count: z.number().optional(),
      multiplier: z.number().optional(),
      timespan: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional()
    }).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context, tracingContext, runtimeContext }) => {
    const startTime = Date.now();
    logToolExecution('polygon-stock-aggregates', { input: context });

    // Create root tracing span
    const rootSpan = tracingContext?.currentSpan?.createChildSpan({
      type: AISpanType.TOOL_CALL,
      name: 'polygon-stock-aggregates-tool',
      input: {
        symbol: context.symbol,
        multiplier: context.multiplier,
        timespan: context.timespan,
        from: context.from,
        to: context.to,
        limit: context.limit,
        sort: context.sort,
      },
    });

  const apiKey = process.env.POLYGON_API_KEY;
// Governance checks
    const governanceCtx = runtimeContext as PolygonRuntimeContext;
    const userId = governanceCtx?.userId;
    const tenantId = governanceCtx?.tenantId;
    const roles = governanceCtx?.roles ?? [];
    const subscriptionTier = governanceCtx?.subscriptionTier ?? 'free';
    const classificationLevel = governanceCtx?.classificationLevel ?? 'public';
    const currentTime = governanceCtx?.currentTime ?? new Date();
    logToolExecution('polygon-stock-aggregates', {
      input: context,
      governance: {
        userId,
        tenantId,
        roles,
        subscriptionTier,
        classificationLevel,
        currentTime,
        requestId: governanceCtx?.requestId,
        correlationId: governanceCtx?.correlationId
      }
    });

    if (apiKey === undefined || apiKey === null || apiKey.trim() === '') {
      const error = "POLYGON_API_KEY environment variable or runtimeContext.apiKey is required";
      logError('polygon-stock-aggregates', new Error(error), { context });

      rootSpan?.error({
        error: new Error(error),
        metadata: { operation: 'polygon-stock-aggregates', reason: 'missing-api-key' },
      });

      return {
        data: null,
        error
      };
    }

    if (context.multiplier === undefined || context.multiplier === null || context.multiplier <= 0 || isNaN(context.multiplier)) {
      const error = "Multiplier must be a positive number";
      logError('polygon-stock-aggregates', new Error(error), { context });

      rootSpan?.error({
        error: new Error(error),
        metadata: { operation: 'polygon-stock-aggregates', reason: 'invalid-multiplier' },
      });

      return {
        data: null,
        error
      };
    }

    try {
      const url = `https://api.polygon.io/v2/aggs/ticker/${context.symbol}/range/${context.multiplier}/${context.timespan}/${context.from ?? '2020-01-01'}/${context.to ?? new Date().toISOString().split('T')[0]}`;

      // Add API key and optional parameters
      const params = new URLSearchParams();
      params.append('apiKey', apiKey);

      if (context.limit !== undefined && context.limit !== null) {
        params.append('limit', context.limit.toString());
      }
      if (context.sort !== undefined && context.sort !== null) {
        params.append('sort', context.sort);
      }

      const finalUrl = `${url}?${params.toString()}`;
      const redactedUrl = apiKey ? finalUrl.replace(apiKey, '[REDACTED]') : finalUrl;

      // Create child span for API call
      const apiSpan = rootSpan?.createChildSpan({
        type: AISpanType.TOOL_CALL,
        name: 'polygon-api-call',
        input: { url: redactedUrl, method: 'GET' },
      });

      logStepStart('polygon-api-call', {
        symbol: context.symbol,
        multiplier: context.multiplier,
        timespan: context.timespan,
        url: redactedUrl
      });

      const apiStartTime = Date.now();
      const response = await fetch(finalUrl);
      const data = await response.json();
      const apiDuration = Date.now() - apiStartTime;

      apiSpan?.end({
        output: {
          status: response.status,
          statusText: response.statusText,
          dataSize: JSON.stringify(data).length
        }
      });

      logStepEnd('polygon-api-call', {
        status: response.status,
        dataSize: JSON.stringify(data).length
      }, apiDuration);

      // Check for API errors
      if (data !== null && typeof data === 'object' && 'error' in (data as Record<string, unknown>)) {
        const errorValue = (data as Record<string, unknown>)['error'];
        if (errorValue !== null && errorValue !== undefined && String(errorValue).trim() !== '') {
          const error = String(errorValue);
          logError('polygon-stock-aggregates', new Error(error), {
            context,
            responseStatus: response.status
          });

          rootSpan?.error({
            error: new Error(error),
            metadata: {
              operation: 'polygon-stock-aggregates',
              reason: 'api-error',
              status: response.status
            },
          });

          return {
            data: null,
            error
          };
        }
      }

      const result = {
        data,
        metadata: {
          symbol: context.symbol,
          status: data.status,
          request_id: data.request_id,
          count: data.count,
          multiplier: context.multiplier,
          timespan: context.timespan,
          from: context.from,
          to: context.to
        },
        error: undefined
      };

      const totalDuration = Date.now() - startTime;
      logStepEnd('polygon-stock-aggregates', {
        success: true,
        symbol: context.symbol,
        dataPoints: (data !== null && typeof data === 'object' && 'count' in data && typeof data.count === 'number') ? data.count : 0
      }, totalDuration);

      rootSpan?.end({
        output: {
          success: true,
          symbol: context.symbol,
          dataPoints: (data !== null && typeof data === 'object' && 'count' in data && typeof data.count === 'number') ? data.count : 0,
          processingTimeMs: totalDuration,
        },
      });

      return result;

    } catch (error) {
      const totalDuration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      logError('polygon-stock-aggregates', error, {
        context,
        processingTimeMs: totalDuration
      });

      rootSpan?.error({
        error: error instanceof Error ? error : new Error(errorMessage),
        metadata: {
          operation: 'polygon-stock-aggregates',
          processingTimeMs: totalDuration,
        },
      });

      return {
        data: null,
        error: errorMessage
      };
    }
  }
});

/**
 * Polygon.io Stock Fundamentals Tool
 *
 * Specialized for company fundamentals and reference data:
 * - Company profiles and information (COMPANY)
 * - Dividend history (DIVIDENDS)
 * - Stock split history (SPLITS)
 * - Financial statements (FINANCIALS)
 *
 * Requires POLYGON_API_KEY environment variable
 */
export const polygonStockFundamentalsTool = createTool({
  id: "polygon-stock-fundamentals",
  description: "Access company fundamentals and reference data from Polygon.io including profiles, dividends, and splits",
  inputSchema: z.object({
    function: z.enum([
      "COMPANY",
      "DIVIDENDS",
      "SPLITS",
      "FINANCIALS"
    ]).describe("Polygon.io stock fundamentals function"),
    symbol: z.string().optional().describe("Stock symbol (e.g., 'AAPL', 'MSFT', 'GOOGL') - required for COMPANY and FINANCIALS"),
    limit: z.number().optional().describe("Maximum number of results to return (max 50000)"),
    sort: z.enum(["asc", "desc"]).optional().describe("Sort order for results")
  }),
  outputSchema: z.object({
    data: z.any().describe("The stock fundamentals data returned from Polygon.io API"),
    metadata: z.object({
      function: z.string(),
      symbol: z.string().optional(),
      status: z.string().optional(),
      request_id: z.string().optional(),
      count: z.number().optional()
    }).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context, tracingContext, runtimeContext }) => {
    const startTime = Date.now();
    logToolExecution('polygon-stock-fundamentals', { input: context });

    // Create root tracing span
    const rootSpan = tracingContext?.currentSpan?.createChildSpan({
      type: AISpanType.TOOL_CALL,
      name: 'polygon-stock-fundamentals-tool',
      input: {
        function: context.function,
        symbol: context.symbol,
        limit: context.limit,
        sort: context.sort,
      },
    });

  const apiKey = process.env.POLYGON_API_KEY;
// Governance checks
    // Governance checks
    const governanceCtx = runtimeContext as PolygonRuntimeContext;
    const userId = governanceCtx?.userId;
    const tenantId = governanceCtx?.tenantId;
    const roles = governanceCtx?.roles ?? [];
    const subscriptionTier = governanceCtx?.subscriptionTier ?? 'free';
    const classificationLevel = governanceCtx?.classificationLevel ?? 'public';
    const currentTime = governanceCtx?.currentTime ?? new Date();
    logToolExecution('polygon-stock-fundamentals', {
      input: context,
      governance: {
        userId,
        tenantId,
        roles,
        subscriptionTier,
        classificationLevel,
        currentTime,
        requestId: governanceCtx?.requestId,
        correlationId: governanceCtx?.correlationId
      }
    });
    if (apiKey === undefined || apiKey === null || apiKey.trim() === '') {
      const error = "POLYGON_API_KEY environment variable or runtimeContext.apiKey is required";
      logError('polygon-stock-fundamentals', new Error(error), { context });

      rootSpan?.error({
        error: new Error(error),
        metadata: { operation: 'polygon-stock-fundamentals', reason: 'missing-api-key' },
      });

      return {
        data: null,
        error
      };
    }

    try {
      let url: string;

      switch (context.function) {
        case "COMPANY":
          if (context.symbol === undefined || context.symbol === null || context.symbol.trim() === '') {
            const error = "COMPANY function requires symbol parameter";
            logError('polygon-stock-fundamentals', new Error(error), { context });

            rootSpan?.error({
              error: new Error(error),
              metadata: { operation: 'polygon-stock-fundamentals', reason: 'missing-symbol' },
            });

            return {
              data: null,
              error
            };
          }
          url = `https://api.polygon.io/v3/reference/tickers/${context.symbol}`;
          break;
        case "DIVIDENDS":
          url = `https://api.polygon.io/v3/reference/dividends`;
          break;
        case "SPLITS":
          url = `https://api.polygon.io/v3/reference/splits`;
          break;
        case "FINANCIALS":
          if (context.symbol === undefined || context.symbol === null || context.symbol.trim() === '') {
            const error = "FINANCIALS function requires symbol parameter";
            logError('polygon-stock-fundamentals', new Error(error), { context });

            rootSpan?.error({
              error: new Error(error),
              metadata: { operation: 'polygon-stock-fundamentals', reason: 'missing-symbol' },
            });

            return {
              data: null,
              error
            };
          }
          url = `https://api.polygon.io/v3/reference/financials`;
          break;
        default: {
          const error = `Unsupported function: ${context.function}`;
          logError('polygon-stock-fundamentals', new Error(error), { context });

          rootSpan?.error({
            error: new Error(error),
            metadata: { operation: 'polygon-stock-fundamentals', reason: 'unsupported-function' },
          });

          return {
            data: null,
            error
          };
        }
      }

      // Add API key and optional parameters
      const params = new URLSearchParams();
      params.append('apiKey', apiKey);

      if (context.symbol !== undefined && context.symbol !== null && context.symbol.trim() !== '') {
        params.append('ticker', context.symbol);
      }
      if (context.limit !== undefined && context.limit !== null) {
        params.append('limit', context.limit.toString());
      }
      if (context.sort !== undefined && context.sort !== null) {
        params.append('sort', context.sort);
      }

      const finalUrl = `${url}?${params.toString()}`;

      // Create child span for API call
      const apiSpan = rootSpan?.createChildSpan({
        type: AISpanType.TOOL_CALL,
        name: 'polygon-api-call',
        input: { url: finalUrl.replace(apiKey, '[REDACTED]'), method: 'GET' },
      });

      logStepStart('polygon-api-call', {
        function: context.function,
        symbol: context.symbol,
        url: finalUrl.replace(apiKey, '[REDACTED]')
      });

      const apiStartTime = Date.now();
      const response = await fetch(finalUrl);
      const data = await response.json();
      const apiDuration = Date.now() - apiStartTime;

      apiSpan?.end({
        output: {
          status: response.status,
          statusText: response.statusText,
          dataSize: JSON.stringify(data).length
        }
      });

      logStepEnd('polygon-api-call', {
        status: response.status,
        dataSize: JSON.stringify(data).length
      }, apiDuration);

      // Check for API errors
      if (data !== null && typeof data === 'object' && 'error' in (data as Record<string, unknown>)) {
        const errorValue = (data as Record<string, unknown>)['error'];
        if (errorValue !== null && errorValue !== undefined && String(errorValue).trim() !== '') {
          const error = String(errorValue);
          logError('polygon-stock-fundamentals', new Error(error), {
            context,
            responseStatus: response.status
          });

          rootSpan?.error({
            error: new Error(error),
            metadata: {
              operation: 'polygon-stock-fundamentals',
              reason: 'api-error',
              status: response.status
            },
          });

          return {
            data: null,
            error
          };
        }
      }

      const result = {
        data,
        metadata: {
          function: context.function,
          symbol: context.symbol,
          status: data.status,
          request_id: data.request_id,
          count: data.count
        },
        error: undefined
      };

      const totalDuration = Date.now() - startTime;
      logStepEnd('polygon-stock-fundamentals', {
        success: true,
        function: context.function,
        symbol: context.symbol,
        dataPoints: (data !== null && typeof data === 'object' && 'count' in data && typeof data.count === 'number') ? data.count : 0
      }, totalDuration);

      rootSpan?.end({
        output: {
          success: true,
          function: context.function,
          symbol: context.symbol,
          dataPoints: (data !== null && typeof data === 'object' && 'count' in data && typeof data.count === 'number') ? data.count : 0,
          processingTimeMs: totalDuration,
        },
      });

      return result;

    } catch (error) {
      const totalDuration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      logError('polygon-stock-fundamentals', error, {
        context,
        processingTimeMs: totalDuration
      });

      rootSpan?.error({
        error: error instanceof Error ? error : new Error(errorMessage),
        metadata: {
          operation: 'polygon-stock-fundamentals',
          processingTimeMs: totalDuration,
        },
      });

      return {
        data: null,
        error: errorMessage
      };
    }
  }
});

/**
 * Polygon.io Crypto Quotes Tool
 *
 * Specialized for real-time cryptocurrency quotes and trades:
 * - Real-time crypto quotes (QUOTES)
 * - Recent crypto trades (TRADES)
 * - Individual crypto snapshots (SNAPSHOT_SINGLE)
 *
 * Requires POLYGON_API_KEY environment variable
 */
export const polygonCryptoQuotesTool = createTool({
  id: "polygon-crypto-quotes",
  description: "Access real-time cryptocurrency quotes, trades, and individual snapshots from Polygon.io",
  inputSchema: z.object({
    function: z.enum([
      "QUOTES",
      "TRADES",
      "SNAPSHOT_SINGLE"
    ]).describe("Polygon.io crypto quotes function"),
    symbol: z.string().describe("Crypto symbol (e.g., 'X:BTC-USD', 'X:ETH-USD')"),
    limit: z.number().optional().describe("Maximum number of results to return (max 50000)")
  }),
  outputSchema: z.object({
    data: z.any().describe("The crypto quotes data returned from Polygon.io API"),
    metadata: z.object({
      function: z.string(),
      symbol: z.string().optional(),
      status: z.string().optional(),
      request_id: z.string().optional(),
      count: z.number().optional()
    }).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context, tracingContext, runtimeContext }) => {
    const startTime = Date.now();
    logToolExecution('polygon-crypto-quotes', { input: context });

    // Create root tracing span
    const rootSpan = tracingContext?.currentSpan?.createChildSpan({
      type: AISpanType.TOOL_CALL,
      name: 'polygon-crypto-quotes-tool',
      input: {
        function: context.function,
        symbol: context.symbol,
        limit: context.limit,
      },
    });

  const apiKey = process.env.POLYGON_API_KEY;
    // Governance checks
    const governanceCtx = runtimeContext as PolygonRuntimeContext;
    const userId = governanceCtx?.userId;
    const tenantId = governanceCtx?.tenantId;
    const roles = governanceCtx?.roles ?? [];
    const subscriptionTier = governanceCtx?.subscriptionTier ?? 'free';
    const classificationLevel = governanceCtx?.classificationLevel ?? 'public';
    const currentTime = governanceCtx?.currentTime ?? new Date();
    logToolExecution('polygon-stock-fundamentals', {
      input: context,
      governance: {
        userId,
        tenantId,
        roles,
        subscriptionTier,
        classificationLevel,
        currentTime,
        requestId: governanceCtx?.requestId,
        correlationId: governanceCtx?.correlationId
      }
    });
    if (apiKey === undefined || apiKey === null || apiKey.trim() === '') {
      const error = "POLYGON_API_KEY environment variable or runtimeContext.apiKey is required";
      logError('polygon-crypto-quotes', new Error(error), { context });

      rootSpan?.error({
        error: new Error(error),
        metadata: { operation: 'polygon-crypto-quotes', reason: 'missing-api-key' },
      });

      return {
        data: null,
        error
      };
    }

    try {
      let url: string;

      switch (context.function) {
        case "QUOTES":
          url = `https://api.polygon.io/v3/quotes/${context.symbol}`;
          break;
        case "TRADES":
          url = `https://api.polygon.io/v3/trades/${context.symbol}`;
          break;
        case "SNAPSHOT_SINGLE":
          url = `https://api.polygon.io/v2/snapshot/locale/global/markets/crypto/tickers/${context.symbol}`;
          break;
        default: {
          const error = `Unsupported function: ${context.function}`;
          logError('polygon-crypto-quotes', new Error(error), { context });

          rootSpan?.error({
            error: new Error(error),
            metadata: { operation: 'polygon-crypto-quotes', reason: 'unsupported-function' },
          });

          return {
            data: null,
            error
          };
        }
      }

      // Add API key and optional parameters
      const params = new URLSearchParams();
      params.append('apiKey', apiKey);

      if (context.limit !== undefined && context.limit !== null) {
        params.append('limit', context.limit.toString());
      }

      const finalUrl = `${url}?${params.toString()}`;

      // Create child span for API call
      const apiSpan = rootSpan?.createChildSpan({
        type: AISpanType.TOOL_CALL,
        name: 'polygon-api-call',
        input: { url: finalUrl.replace(apiKey, '[REDACTED]'), method: 'GET' },
      });

      logStepStart('polygon-api-call', {
        function: context.function,
        symbol: context.symbol,
        url: finalUrl.replace(apiKey, '[REDACTED]')
      });

      const apiStartTime = Date.now();
      const response = await fetch(finalUrl);
      const data = await response.json();
      const apiDuration = Date.now() - apiStartTime;

      apiSpan?.end({
        output: {
          status: response.status,
          statusText: response.statusText,
          dataSize: JSON.stringify(data).length
        }
      });

      logStepEnd('polygon-api-call', {
        status: response.status,
        dataSize: JSON.stringify(data).length
      }, apiDuration);

      // Check for API errors
      if (data !== null && typeof data === 'object' && 'error' in (data as Record<string, unknown>)) {
        const errorValue = (data as Record<string, unknown>)['error'];
        if (errorValue !== null && errorValue !== undefined && String(errorValue).trim() !== '') {
          const error = String(errorValue);
          logError('polygon-crypto-quotes', new Error(error), {
            context,
            responseStatus: response.status
          });

          rootSpan?.error({
            error: new Error(error),
            metadata: {
              operation: 'polygon-crypto-quotes',
              reason: 'api-error',
              status: response.status
            },
          });

          return {
            data: null,
            error
          };
        }
      }

      const result = {
        data,
        metadata: {
          function: context.function,
          symbol: context.symbol,
          status: data.status,
          request_id: data.request_id,
          count: data.count
        },
        error: undefined
      };

      const totalDuration = Date.now() - startTime;
      logStepEnd('polygon-crypto-quotes', {
        success: true,
        function: context.function,
        symbol: context.symbol,
        dataPoints: (data !== null && typeof data === 'object' && 'count' in data && typeof data.count === 'number') ? data.count : 0
      }, totalDuration);

      rootSpan?.end({
        output: {
          success: true,
          function: context.function,
          symbol: context.symbol,
          dataPoints: (data !== null && typeof data === 'object' && 'count' in data && typeof data.count === 'number') ? data.count : 0,
          processingTimeMs: totalDuration,
        },
      });

      return result;

    } catch (error) {
      const totalDuration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      logError('polygon-crypto-quotes', error, {
        context,
        processingTimeMs: totalDuration
      });

      rootSpan?.error({
        error: error instanceof Error ? error : new Error(errorMessage),
        metadata: {
          operation: 'polygon-crypto-quotes',
          processingTimeMs: totalDuration,
        },
      });

      return {
        data: null,
        error: errorMessage
      };
    }
  }
});

/**
 * Polygon.io Crypto Aggregates Tool
 *
 * Specialized for historical cryptocurrency price aggregates:
 * - Historical crypto price bars with customizable timeframes
 * - Support for different multipliers and timespans
 * - Date range filtering
 *
 * Requires POLYGON_API_KEY environment variable
 */
export const polygonCryptoAggregatesTool = createTool({
  id: "polygon-crypto-aggregates",
  description: "Access historical cryptocurrency price aggregates (bars) from Polygon.io with customizable timeframes",
  inputSchema: z.object({
    symbol: z.string().describe("Crypto symbol (e.g., 'X:BTC-USD', 'X:ETH-USD')"),
    multiplier: z.number().describe("Multiplier for aggregate bars (e.g., 1, 5, 15)"),
    timespan: z.enum(["minute", "hour", "day", "week", "month", "quarter", "year"]).describe("Timespan for aggregate bars"),
    from: z.string().optional().describe("Start date for historical data (YYYY-MM-DD)"),
    to: z.string().optional().describe("End date for historical data (YYYY-MM-DD)"),
    limit: z.number().optional().describe("Maximum number of results to return (max 50000)"),
    sort: z.enum(["asc", "desc"]).optional().describe("Sort order for results")
  }),
  outputSchema: z.object({
    data: z.any().describe("The crypto aggregates data returned from Polygon.io API"),
    metadata: z.object({
      symbol: z.string().optional(),
      status: z.string().optional(),
      request_id: z.string().optional(),
      count: z.number().optional(),
      multiplier: z.number().optional(),
      timespan: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional()
    }).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context, tracingContext, runtimeContext }) => {
    const rootSpan = tracingContext?.currentSpan?.createChildSpan({
      type: AISpanType.TOOL_CALL,
      name: 'polygon-crypto-aggregates',
      input: { symbol: context.symbol, multiplier: context.multiplier, timespan: context.timespan }
    });

  logToolExecution('polygon-crypto-aggregates', { input: context });

  const apiKey = process.env.POLYGON_API_KEY;
    // Governance checks
    const governanceCtx = runtimeContext as PolygonRuntimeContext;
    const userId = governanceCtx?.userId;
    const tenantId = governanceCtx?.tenantId;
    const roles = governanceCtx?.roles ?? [];
    const subscriptionTier = governanceCtx?.subscriptionTier ?? 'free';
    const classificationLevel = governanceCtx?.classificationLevel ?? 'public';
    const currentTime = governanceCtx?.currentTime ?? new Date();
    logToolExecution('polygon-stock-fundamentals', {
      input: context,
      governance: {
        userId,
        tenantId,
        roles,
        subscriptionTier,
        classificationLevel,
        currentTime,
        requestId: governanceCtx?.requestId,
        correlationId: governanceCtx?.correlationId
      }
    });
    if (apiKey === undefined || apiKey === null || apiKey.trim() === '') {
      const error = "POLYGON_API_KEY environment variable or runtimeContext.apiKey is required";
      rootSpan?.error({
        error: new Error(error),
        metadata: { operation: 'polygon-crypto-aggregates', reason: 'missing-api-key' }
      });
      logError('polygon-crypto-aggregates', new Error(error), { symbol: context.symbol });
      return {
        data: null,
        error
      };
    }

    if (context.multiplier === undefined || context.multiplier === null || context.multiplier <= 0 || isNaN(context.multiplier)) {
      const error = "Multiplier must be a positive number";
      rootSpan?.error({
        error: new Error(error),
        metadata: { operation: 'polygon-crypto-aggregates', reason: 'invalid-multiplier', multiplier: context.multiplier }
      });
      logError('polygon-crypto-aggregates', new Error(error), { symbol: context.symbol, multiplier: context.multiplier });
      return {
        data: null,
        error
      };
    }

    try {
      const url = `https://api.polygon.io/v2/aggs/ticker/${context.symbol}/range/${context.multiplier}/${context.timespan}/${context.from ?? '2020-01-01'}/${context.to ?? new Date().toISOString().split('T')[0]}`;

      // Add API key and optional parameters
      const params = new URLSearchParams();
      params.append('apiKey', apiKey);

      if (context.limit !== undefined && context.limit !== null) {
        params.append('limit', context.limit.toString());
      }
      if (context.sort !== undefined && context.sort !== null) {
        params.append('sort', context.sort);
      }

      const finalUrl = `${url}?${params.toString()}`;

      // Create child span for API call
      const apiSpan = rootSpan?.createChildSpan({
        type: AISpanType.TOOL_CALL,
        name: 'polygon-api-call',
        input: { url: finalUrl.replace(apiKey, '[REDACTED]'), method: 'GET' },
      });

      logStepStart('polygon-api-call', {
        symbol: context.symbol,
        url: finalUrl.replace(apiKey, '[REDACTED]')
      });

      const apiStartTime = Date.now();
      const response = await fetch(finalUrl);
      const data = await response.json();
      const apiDuration = Date.now() - apiStartTime;

      apiSpan?.end({
        output: {
          status: response.status,
          statusText: response.statusText,
          dataSize: JSON.stringify(data).length,
          duration: apiDuration
        }
      });

      logStepEnd('polygon-api-call', {
        status: response.status,
        dataSize: JSON.stringify(data).length
      }, apiDuration);

      // Check for API errors
      if (data !== null && typeof data === 'object' && 'error' in (data as Record<string, unknown>)) {
        const errorValue = (data as Record<string, unknown>)['error'];
        if (errorValue !== null && errorValue !== undefined && String(errorValue).trim() !== '') {
          const error = String(errorValue);
          rootSpan?.error({
            error: new Error(error),
            metadata: { operation: 'polygon-crypto-aggregates', reason: 'api-error', symbol: context.symbol }
          });
          logError('polygonCryptoAggregatesTool', new Error(error), { symbol: context.symbol, apiError: error });
          return {
            data: null,
            error
          };
        }
      }

      const result = {
        data,
        metadata: {
          symbol: context.symbol,
          status: data.status,
          request_id: data.request_id,
          count: data.count,
          multiplier: context.multiplier,
          timespan: context.timespan,
          from: context.from,
          to: context.to
        },
        error: undefined
      };

      rootSpan?.end({
        output: {
          count: data?.count ?? 0,
          symbol: context.symbol,
          status: data?.status
        }
      });

  logToolExecution('polygon-crypto-aggregates', { output: { symbol: context.symbol, count: data?.count ?? 0 } });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      rootSpan?.error({
        error: error instanceof Error ? error : new Error(errorMessage),
        metadata: { operation: 'polygon-crypto-aggregates', reason: 'execution-error', symbol: context.symbol }
      });
      logError('polygonCryptoAggregatesTool', error instanceof Error ? error : new Error(errorMessage), { symbol: context.symbol });
      return {
        data: null,
        error: errorMessage
      };
    }
  }
});

/**
 * Polygon.io Crypto Snapshots Tool
 *
 * Specialized for market-wide cryptocurrency snapshots:
 * - All crypto tickers snapshot (SNAPSHOT_ALL)
 *
 * Requires POLYGON_API_KEY environment variable
 */
export const polygonCryptoSnapshotsTool = createTool({
  id: "polygon-crypto-snapshots",
  description: "Access market-wide cryptocurrency snapshots from Polygon.io",
  inputSchema: z.object({
    limit: z.number().optional().describe("Maximum number of results to return (max 50000)")
  }),
  outputSchema: z.object({
    data: z.any().describe("The crypto snapshots data returned from Polygon.io API"),
    metadata: z.object({
      status: z.string().optional(),
      request_id: z.string().optional(),
      count: z.number().optional()
    }).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context, tracingContext, runtimeContext }) => {
    const rootSpan = tracingContext?.currentSpan?.createChildSpan({
      type: AISpanType.TOOL_CALL,
      name: 'polygon-crypto-snapshots',
      input: { limit: context.limit }
    });

  logToolExecution('polygon-crypto-snapshots', { input: context });

  const apiKey = process.env.POLYGON_API_KEY;
    // Governance checks
    const governanceCtx = runtimeContext as PolygonRuntimeContext;
    const userId = governanceCtx?.userId;
    const tenantId = governanceCtx?.tenantId;
    const roles = governanceCtx?.roles ?? [];
    const subscriptionTier = governanceCtx?.subscriptionTier ?? 'free';
    const classificationLevel = governanceCtx?.classificationLevel ?? 'public';
    const currentTime = governanceCtx?.currentTime ?? new Date();
    logToolExecution('polygon-stock-fundamentals', {
      input: context,
      governance: {
        userId,
        tenantId,
        roles,
        subscriptionTier,
        classificationLevel,
        currentTime,
        requestId: governanceCtx?.requestId,
        correlationId: governanceCtx?.correlationId
      }
    });
    if (apiKey === undefined || apiKey === null || apiKey.trim() === '') {
      const error = "POLYGON_API_KEY environment variable or runtimeContext.apiKey is required";
      rootSpan?.error({
        error: new Error(error),
        metadata: { operation: 'polygon-crypto-snapshots', reason: 'missing-api-key' }
      });
      logError('polygon-crypto-snapshots', new Error(error), {});
      return {
        data: null,
        error
      };
    }

    try {
      const url = `https://api.polygon.io/v2/snapshot/locale/global/markets/crypto/tickers`;

      // Add API key and optional parameters
      const params = new URLSearchParams();
      params.append('apiKey', apiKey);

      if (context.limit !== undefined && context.limit !== null) {
        params.append('limit', context.limit.toString());
      }

      const finalUrl = `${url}?${params.toString()}`;

      // Create child span for API call
      const apiSpan = rootSpan?.createChildSpan({
        type: AISpanType.TOOL_CALL,
        name: 'polygon-api-call',
        input: { url: finalUrl.replace(apiKey, '[REDACTED]'), method: 'GET' },
      });

      logStepStart('polygon-api-call', {
        url: finalUrl.replace(apiKey, '[REDACTED]')
      });

      const apiStartTime = Date.now();
      const response = await fetch(finalUrl);
      const data = await response.json();
      const apiDuration = Date.now() - apiStartTime;

      apiSpan?.end({
        output: {
          status: response.status,
          statusText: response.statusText,
          dataSize: JSON.stringify(data).length,
          duration: apiDuration
        }
      });

      logStepEnd('polygon-api-call', {
        status: response.status,
        dataSize: JSON.stringify(data).length
      }, apiDuration);

      // Check for API errors
      if (data !== null && typeof data === 'object' && 'error' in (data as Record<string, unknown>)) {
        const errorValue = (data as Record<string, unknown>)['error'];
        if (errorValue !== null && errorValue !== undefined && String(errorValue).trim() !== '') {
          const error = String(errorValue);
          rootSpan?.error({
            error: new Error(error),
            metadata: { operation: 'polygon-crypto-snapshots', reason: 'api-error' }
          });
          logError('polygon-crypto-snapshots', new Error(error), { apiError: error });
          return {
            data: null,
            error
          };
        }
      }

      const result = {
        data,
        metadata: {
          status: data.status,
          request_id: data.request_id,
          count: data.count
        },
        error: undefined
      };

      rootSpan?.end({
        output: {
          count: data?.count ?? 0,
          status: data?.status
        }
      });

  logToolExecution('polygon-crypto-snapshots', { output: { count: data?.count ?? 0 } });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      rootSpan?.error({
        error: error instanceof Error ? error : new Error(errorMessage),
        metadata: { operation: 'polygon-crypto-snapshots', reason: 'execution-error' }
      });
      logError('polygonCryptoSnapshotsTool', error instanceof Error ? error : new Error(errorMessage), {});
      return {
        data: null,
        error: errorMessage
      };
    }
  }
});
