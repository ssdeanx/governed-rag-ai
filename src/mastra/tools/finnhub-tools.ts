import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { AISpanType } from "@mastra/core/ai-tracing";
import {
  logStepStart,
  logStepEnd,
  logError,
  logToolExecution,
} from "../config/logger";

/**
 * Finnhub Quotes Tool
 *
 * Specialized for real-time stock quotes:
 * - Real-time stock quotes (QUOTE)
 *
 * Requires FINNHUB_API_KEY environment variable
 */
export const finnhubQuotesTool = createTool({
  id: "finnhub-quotes",
  description: "Access real-time stock quotes from Finnhub",
  inputSchema: z.object({
    symbol: z.string().describe("Stock symbol (e.g., 'AAPL', 'MSFT')")
  }),
  outputSchema: z.object({
    data: z.any().describe("The quote data returned from Finnhub API"),
    metadata: z.object({
      symbol: z.string().optional()
    }).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context, tracingContext }) => {
    const rootSpan = tracingContext?.currentSpan?.createChildSpan({
      type: AISpanType.TOOL_CALL,
      name: 'finnhub-quotes',
      input: { symbol: context.symbol }
    });

    logToolExecution('finnhubQuotesTool', { input: context });

    const apiKey = process.env.FINNHUB_API_KEY;

    if (apiKey === undefined || apiKey === null || apiKey.trim() === '') {
      const error = "FINNHUB_API_KEY environment variable is required";
      rootSpan?.error({
        error: new Error(error),
        metadata: { operation: 'finnhub-quotes', reason: 'missing-api-key' }
      });
      logError('finnhubQuotesTool', new Error(error), { symbol: context.symbol });
      return {
        data: null,
        error
      };
    }

    try {
      const params = new URLSearchParams();
      params.append('token', apiKey);
      params.append('symbol', context.symbol);

      const url = `https://finnhub.io/api/v1/quote?${params.toString()}`;

      // Create child span for API call
      const apiSpan = rootSpan?.createChildSpan({
        type: AISpanType.TOOL_CALL,
        name: 'finnhub-api-call',
        input: { url: url.replace(apiKey, '[REDACTED]'), method: 'GET' },
      });

      logStepStart('finnhub-api-call', {
        symbol: context.symbol,
        url: url.replace(apiKey, '[REDACTED]')
      });

      const apiStartTime = Date.now();
      const response = await fetch(url);
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

      logStepEnd('finnhub-api-call', {
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
            metadata: { operation: 'finnhub-quotes', reason: 'api-error', symbol: context.symbol }
          });
          logError('finnhubQuotesTool', new Error(error), { symbol: context.symbol, apiError: error });
          return {
            data: null,
            error
          };
        }
      }

      const result = {
        data,
        metadata: {
          symbol: context.symbol
        },
        error: undefined
      };

      rootSpan?.end({
        output: {
          symbol: context.symbol,
          hasData: data !== null && data !== undefined
        }
      });

      logToolExecution('finnhubQuotesTool', { output: { symbol: context.symbol } });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      rootSpan?.error({
        error: error instanceof Error ? error : new Error(errorMessage),
        metadata: { operation: 'finnhub-quotes', reason: 'execution-error', symbol: context.symbol }
      });
      logError('finnhubQuotesTool', error instanceof Error ? error : new Error(errorMessage), { symbol: context.symbol });
      return {
        data: null,
        error: errorMessage
      };
    }
  }
});

/**
 * Finnhub Company Tool
 *
 * Specialized for company information and news:
 * - Company profiles (COMPANY_PROFILE)
 * - Company news (COMPANY_NEWS)
 *
 * Requires FINNHUB_API_KEY environment variable
 */
export const finnhubCompanyTool = createTool({
  id: "finnhub-company",
  description: "Access company profiles and news from Finnhub",
  inputSchema: z.object({
    function: z.enum([
      "COMPANY_PROFILE",
      "COMPANY_NEWS"
    ]).describe("Finnhub company function"),
    symbol: z.string().describe("Stock symbol (e.g., 'AAPL', 'MSFT')"),
    from: z.string().optional().describe("Start date for news (YYYY-MM-DD)"),
    to: z.string().optional().describe("End date for news (YYYY-MM-DD)")
  }),
  outputSchema: z.object({
    data: z.any().describe("The company data returned from Finnhub API"),
    metadata: z.object({
      function: z.string(),
      symbol: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional()
    }).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context, tracingContext }) => {
    const rootSpan = tracingContext?.currentSpan?.createChildSpan({
      type: AISpanType.TOOL_CALL,
      name: 'finnhub-company',
      input: { function: context.function, symbol: context.symbol, from: context.from, to: context.to }
    });

    logToolExecution('finnhubCompanyTool', { input: context });

    const apiKey = process.env.FINNHUB_API_KEY;

    if (apiKey === undefined || apiKey === null || apiKey.trim() === '') {
      const error = "FINNHUB_API_KEY environment variable is required";
      rootSpan?.error({
        error: new Error(error),
        metadata: { operation: 'finnhub-company', reason: 'missing-api-key' }
      });
      logError('finnhubCompanyTool', new Error(error), { function: context.function, symbol: context.symbol });
      return {
        data: null,
        error
      };
    }

    try {
      let url: string;
      const params = new URLSearchParams();
      params.append('token', apiKey);

      switch (context.function) {
        case "COMPANY_PROFILE":
          params.append('symbol', context.symbol);
          url = `https://finnhub.io/api/v1/stock/profile2?${params.toString()}`;
          break;
        case "COMPANY_NEWS": {
          params.append('symbol', context.symbol);
          if (context.from !== undefined && context.from !== null && context.from.trim() !== '') {
            params.append('from', context.from);
          }
          if (context.to !== undefined && context.to !== null && context.to.trim() !== '') {
            params.append('to', context.to);
          }
          url = `https://finnhub.io/api/v1/company-news?${params.toString()}`;
          break;
        }
        default: {
          const error = `Unsupported function: ${context.function}`;
          rootSpan?.error({
            error: new Error(error),
            metadata: { operation: 'finnhub-company', reason: 'unsupported-function', function: context.function }
          });
          logError('finnhubCompanyTool', new Error(error), { function: context.function, symbol: context.symbol });
          return {
            data: null,
            error
          };
        }
      }

      // Create child span for API call
      const apiSpan = rootSpan?.createChildSpan({
        type: AISpanType.TOOL_CALL,
        name: 'finnhub-api-call',
        input: { url: url.replace(apiKey, '[REDACTED]'), method: 'GET' },
      });

      logStepStart('finnhub-api-call', {
        function: context.function,
        symbol: context.symbol,
        url: url.replace(apiKey, '[REDACTED]')
      });

      const apiStartTime = Date.now();
      const response = await fetch(url);
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

      logStepEnd('finnhub-api-call', {
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
            metadata: { operation: 'finnhub-company', reason: 'api-error', function: context.function, symbol: context.symbol }
          });
          logError('finnhubCompanyTool', new Error(error), { function: context.function, symbol: context.symbol, apiError: error });
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
          from: context.from,
          to: context.to
        },
        error: undefined
      };

      rootSpan?.end({
        output: {
          function: context.function,
          symbol: context.symbol,
          hasData: data !== null && data !== undefined
        }
      });

      logToolExecution('finnhubCompanyTool', { output: { function: context.function, symbol: context.symbol } });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      rootSpan?.error({
        error: error instanceof Error ? error : new Error(errorMessage),
        metadata: { operation: 'finnhub-company', reason: 'execution-error', function: context.function, symbol: context.symbol }
      });
      logError('finnhubCompanyTool', error instanceof Error ? error : new Error(errorMessage), { function: context.function, symbol: context.symbol });
      return {
        data: null,
        error: errorMessage
      };
    }
  }
});

/**
 * Finnhub Financials Tool
 *
 * Specialized for financial statements and metrics:
 * - Financial statements (FINANCIAL_STATEMENTS)
 * - Company metrics (METRICS)
 * - Earnings data (EARNINGS)
 * - Revenue breakdown (REVENUE_BREAKDOWN)
 *
 * Requires FINNHUB_API_KEY environment variable
 */
export const finnhubFinancialsTool = createTool({
  id: "finnhub-financials",
  description: "Access financial statements, metrics, earnings, and revenue data from Finnhub",
  inputSchema: z.object({
    function: z.enum([
      "FINANCIAL_STATEMENTS",
      "METRICS",
      "EARNINGS",
      "REVENUE_BREAKDOWN"
    ]).describe("Finnhub financials function"),
    symbol: z.string().describe("Stock symbol (e.g., 'AAPL', 'MSFT')")
  }),
  outputSchema: z.object({
    data: z.any().describe("The financials data returned from Finnhub API"),
    metadata: z.object({
      function: z.string(),
      symbol: z.string().optional()
    }).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context, tracingContext }) => {
    const rootSpan = tracingContext?.currentSpan?.createChildSpan({
      type: AISpanType.TOOL_CALL,
      name: 'finnhub-financials',
      input: { function: context.function, symbol: context.symbol }
    });

    logToolExecution('finnhubFinancialsTool', { input: context });

    const apiKey = process.env.FINNHUB_API_KEY;

    if (apiKey === undefined || apiKey === null || apiKey.trim() === '') {
      const error = "FINNHUB_API_KEY environment variable is required";
      rootSpan?.error({
        error: new Error(error),
        metadata: { operation: 'finnhub-financials', reason: 'missing-api-key' }
      });
      logError('finnhubFinancialsTool', new Error(error), { function: context.function, symbol: context.symbol });
      return {
        data: null,
        error
      };
    }

    try {
      let url: string;
      const params = new URLSearchParams();
      params.append('token', apiKey);
      params.append('symbol', context.symbol);

      switch (context.function) {
        case "FINANCIAL_STATEMENTS": {
          url = `https://finnhub.io/api/v1/stock/financials?${params.toString()}`;
          break;
        }
        case "METRICS": {
          url = `https://finnhub.io/api/v1/stock/metric?${params.toString()}`;
          break;
        }
        case "EARNINGS": {
          url = `https://finnhub.io/api/v1/stock/earnings?${params.toString()}`;
          break;
        }
        case "REVENUE_BREAKDOWN": {
          url = `https://finnhub.io/api/v1/stock/revenue-breakdown2?${params.toString()}`;
          break;
        }
        default: {
          const error = `Unsupported function: ${context.function}`;
          rootSpan?.error({
            error: new Error(error),
            metadata: { operation: 'finnhub-financials', reason: 'unsupported-function', function: context.function }
          });
          logError('finnhubFinancialsTool', new Error(error), { function: context.function, symbol: context.symbol });
          return {
            data: null,
            error
          };
        }
      }

      // Create child span for API call
      const apiSpan = rootSpan?.createChildSpan({
        type: AISpanType.TOOL_CALL,
        name: 'finnhub-api-call',
        input: { url: url.replace(apiKey, '[REDACTED]'), method: 'GET' },
      });

      logStepStart('finnhub-api-call', {
        function: context.function,
        symbol: context.symbol,
        url: url.replace(apiKey, '[REDACTED]')
      });

      const apiStartTime = Date.now();
      const response = await fetch(url);
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

      logStepEnd('finnhub-api-call', {
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
            metadata: { operation: 'finnhub-financials', reason: 'api-error', function: context.function, symbol: context.symbol }
          });
          logError('finnhubFinancialsTool', new Error(error), { function: context.function, symbol: context.symbol, apiError: error });
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
          symbol: context.symbol
        },
        error: undefined
      };

      rootSpan?.end({
        output: {
          function: context.function,
          symbol: context.symbol,
          hasData: data !== null && data !== undefined
        }
      });

      logToolExecution('finnhubFinancialsTool', { output: { function: context.function, symbol: context.symbol } });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      rootSpan?.error({
        error: error instanceof Error ? error : new Error(errorMessage),
        metadata: { operation: 'finnhub-financials', reason: 'execution-error', function: context.function, symbol: context.symbol }
      });
      logError('finnhubFinancialsTool', error instanceof Error ? error : new Error(errorMessage), { function: context.function, symbol: context.symbol });
      return {
        data: null,
        error: errorMessage
      };
    }
  }
});

/**
 * Finnhub Analysis Tool
 *
 * Specialized for analyst recommendations and price targets:
 * - Recommendation trends (RECOMMENDATION_TRENDS)
 * - Price targets (PRICE_TARGET)
 *
 * Requires FINNHUB_API_KEY environment variable
 */
export const finnhubAnalysisTool = createTool({
  id: "finnhub-analysis",
  description: "Access analyst recommendations and price targets from Finnhub",
  inputSchema: z.object({
    function: z.enum([
      "RECOMMENDATION_TRENDS",
      "PRICE_TARGET"
    ]).describe("Finnhub analysis function"),
    symbol: z.string().describe("Stock symbol (e.g., 'AAPL', 'MSFT')")
  }),
  outputSchema: z.object({
    data: z.any().describe("The analysis data returned from Finnhub API"),
    metadata: z.object({
      function: z.string(),
      symbol: z.string().optional()
    }).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context, tracingContext }) => {
    const rootSpan = tracingContext?.currentSpan?.createChildSpan({
      type: AISpanType.TOOL_CALL,
      name: 'finnhub-analysis',
      input: { function: context.function, symbol: context.symbol }
    });

    logToolExecution('finnhubAnalysisTool', { input: context });

    const apiKey = process.env.FINNHUB_API_KEY;

    if (apiKey === undefined || apiKey === null || apiKey.trim() === '') {
      const error = "FINNHUB_API_KEY environment variable is required";
      rootSpan?.error({
        error: new Error(error),
        metadata: { operation: 'finnhub-analysis', reason: 'missing-api-key' }
      });
      logError('finnhubAnalysisTool', new Error(error), { function: context.function, symbol: context.symbol });
      return {
        data: null,
        error
      };
    }

    try {
      let url: string;
      const params = new URLSearchParams();
      params.append('token', apiKey);
      params.append('symbol', context.symbol);

      switch (context.function) {
        case "RECOMMENDATION_TRENDS": {
          url = `https://finnhub.io/api/v1/stock/recommendation?${params.toString()}`;
          break;
        }
        case "PRICE_TARGET": {
          url = `https://finnhub.io/api/v1/stock/price-target?${params.toString()}`;
          break;
        }
        default: {
          const error = `Unsupported function: ${context.function}`;
          rootSpan?.error({
            error: new Error(error),
            metadata: { operation: 'finnhub-analysis', reason: 'unsupported-function', function: context.function }
          });
          logError('finnhubAnalysisTool', new Error(error), { function: context.function, symbol: context.symbol });
          return {
            data: null,
            error
          };
        }
      }

      // Create child span for API call
      const apiSpan = rootSpan?.createChildSpan({
        type: AISpanType.TOOL_CALL,
        name: 'finnhub-api-call',
        input: { url: url.replace(apiKey, '[REDACTED]'), method: 'GET' },
      });

      logStepStart('finnhub-api-call', {
        function: context.function,
        symbol: context.symbol,
        url: url.replace(apiKey, '[REDACTED]')
      });

      const apiStartTime = Date.now();
      const response = await fetch(url);
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

      logStepEnd('finnhub-api-call', {
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
            metadata: { operation: 'finnhub-analysis', reason: 'api-error', function: context.function, symbol: context.symbol }
          });
          logError('finnhubAnalysisTool', new Error(error), { function: context.function, symbol: context.symbol, apiError: error });
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
          symbol: context.symbol
        },
        error: undefined
      };

      rootSpan?.end({
        output: {
          function: context.function,
          symbol: context.symbol,
          hasData: data !== null && data !== undefined
        }
      });

      logToolExecution('finnhubAnalysisTool', { output: { function: context.function, symbol: context.symbol } });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      rootSpan?.error({
        error: error instanceof Error ? error : new Error(errorMessage),
        metadata: { operation: 'finnhub-analysis', reason: 'execution-error', function: context.function, symbol: context.symbol }
      });
      logError('finnhubAnalysisTool', error instanceof Error ? error : new Error(errorMessage), { function: context.function, symbol: context.symbol });
      return {
        data: null,
        error: errorMessage
      };
    }
  }
});

/**
 * Finnhub Technical Tool
 *
 * Specialized for technical analysis and indicators:
 * - Technical indicators (TECHNICAL_INDICATOR)
 * - Pattern recognition (PATTERN_RECOGNITION)
 * - Support/resistance levels (SUPPORT_RESISTANCE)
 * - Aggregate indicators (AGGREGATE_INDICATOR)
 *
 * Requires FINNHUB_API_KEY environment variable
 */
export const finnhubTechnicalTool = createTool({
  id: "finnhub-technical",
  description: "Access technical analysis indicators and pattern recognition from Finnhub",
  inputSchema: z.object({
    function: z.enum([
      "TECHNICAL_INDICATOR",
      "PATTERN_RECOGNITION",
      "SUPPORT_RESISTANCE",
      "AGGREGATE_INDICATOR"
    ]).describe("Finnhub technical function"),
    symbol: z.string().describe("Stock symbol (e.g., 'AAPL', 'MSFT')"),
    resolution: z.enum(["1", "5", "15", "30", "60", "D", "W", "M"]).describe("Time resolution for technical indicators"),
    indicator: z.string().optional().describe("Technical indicator name (e.g., 'sma', 'ema', 'rsi', 'macd') - required for TECHNICAL_INDICATOR"),
    timeperiod: z.number().optional().describe("Time period for technical indicators - required for TECHNICAL_INDICATOR"),
    series_type: z.enum(["open", "high", "low", "close"]).optional().describe("Price series type for technical indicators - required for TECHNICAL_INDICATOR")
  }),
  outputSchema: z.object({
    data: z.any().describe("The technical data returned from Finnhub API"),
    metadata: z.object({
      function: z.string(),
      symbol: z.string().optional(),
      resolution: z.string().optional(),
      indicator: z.string().optional(),
      timeperiod: z.number().optional(),
      series_type: z.string().optional()
    }).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context, tracingContext }) => {
    const rootSpan = tracingContext?.currentSpan?.createChildSpan({
      type: AISpanType.TOOL_CALL,
      name: 'finnhub-technical',
      input: { function: context.function, symbol: context.symbol, resolution: context.resolution, indicator: context.indicator, timeperiod: context.timeperiod, series_type: context.series_type }
    });

    logToolExecution('finnhubTechnicalTool', { input: context });

    const apiKey = process.env.FINNHUB_API_KEY;

    if (apiKey === undefined || apiKey === null || apiKey.trim() === '') {
      const error = "FINNHUB_API_KEY environment variable is required";
      rootSpan?.error({
        error: new Error(error),
        metadata: { operation: 'finnhub-technical', reason: 'missing-api-key' }
      });
      logError('finnhubTechnicalTool', new Error(error), { function: context.function, symbol: context.symbol });
      return {
        data: null,
        error
      };
    }

    try {
      let url: string;
      const params = new URLSearchParams();
      params.append('token', apiKey);
      params.append('symbol', context.symbol);
      params.append('resolution', context.resolution);

      switch (context.function) {
        case "TECHNICAL_INDICATOR": {
          if (context.indicator === undefined || context.indicator === null || context.indicator.trim() === '' ||
              context.timeperiod === undefined || context.timeperiod === null ||
              context.series_type === undefined || context.series_type === null || context.series_type.trim() === '') {
            const error = "TECHNICAL_INDICATOR function requires indicator, timeperiod, and series_type parameters";
            rootSpan?.error({
              error: new Error(error),
              metadata: { operation: 'finnhub-technical', reason: 'missing-parameters', function: context.function }
            });
            logError('finnhubTechnicalTool', new Error(error), { function: context.function, symbol: context.symbol });
            return {
              data: null,
              error
            };
          }
          params.append('indicator', context.indicator);
          params.append('timeperiod', context.timeperiod.toString());
          params.append('series_type', context.series_type);
          url = `https://finnhub.io/api/v1/indicator?${params.toString()}`;
          break;
        }
        case "PATTERN_RECOGNITION": {
          url = `https://finnhub.io/api/v1/scan/pattern?${params.toString()}`;
          break;
        }
        case "SUPPORT_RESISTANCE": {
          url = `https://finnhub.io/api/v1/scan/support-resistance?${params.toString()}`;
          break;
        }
        case "AGGREGATE_INDICATOR": {
          url = `https://finnhub.io/api/v1/scan/technical-indicator?${params.toString()}`;
          break;
        }
        default: {
          const error = `Unsupported function: ${context.function}`;
          rootSpan?.error({
            error: new Error(error),
            metadata: { operation: 'finnhub-technical', reason: 'unsupported-function', function: context.function }
          });
          logError('finnhubTechnicalTool', new Error(error), { function: context.function, symbol: context.symbol });
          return {
            data: null,
            error
          };
        }
      }

      // Create child span for API call
      const apiSpan = rootSpan?.createChildSpan({
        type: AISpanType.TOOL_CALL,
        name: 'finnhub-api-call',
        input: { url: url.replace(apiKey, '[REDACTED]'), method: 'GET' },
      });

      logStepStart('finnhub-api-call', {
        function: context.function,
        symbol: context.symbol,
        url: url.replace(apiKey, '[REDACTED]')
      });

      const apiStartTime = Date.now();
      const response = await fetch(url);
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

      logStepEnd('finnhub-api-call', {
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
            metadata: { operation: 'finnhub-technical', reason: 'api-error', function: context.function, symbol: context.symbol }
          });
          logError('finnhubTechnicalTool', new Error(error), { function: context.function, symbol: context.symbol, apiError: error });
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
          resolution: context.resolution,
          indicator: context.indicator,
          timeperiod: context.timeperiod,
          series_type: context.series_type
        },
        error: undefined
      };

      rootSpan?.end({
        output: {
          function: context.function,
          symbol: context.symbol,
          hasData: data !== null && data !== undefined
        }
      });

      logToolExecution('finnhubTechnicalTool', { output: { function: context.function, symbol: context.symbol } });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      rootSpan?.error({
        error: error instanceof Error ? error : new Error(errorMessage),
        metadata: { operation: 'finnhub-technical', reason: 'execution-error', function: context.function, symbol: context.symbol }
      });
      logError('finnhubTechnicalTool', error instanceof Error ? error : new Error(errorMessage), { function: context.function, symbol: context.symbol });
      return {
        data: null,
        error: errorMessage
      };
    }
  }
});

/**
 * Finnhub Economic Tool
 *
 * Specialized for economic indicators and data:
 * - Economic data (ECONOMIC_DATA)
 *
 * Requires FINNHUB_API_KEY environment variable
 */
export const finnhubEconomicTool = createTool({
  id: "finnhub-economic",
  description: "Access economic indicators and data from Finnhub",
  inputSchema: z.object({
    economic_code: z.string().describe("Economic data code (e.g., 'MA-USA-656880')")
  }),
  outputSchema: z.object({
    data: z.any().describe("The economic data returned from Finnhub API"),
    metadata: z.object({
      economic_code: z.string().optional()
    }).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context, tracingContext }) => {
    const rootSpan = tracingContext?.currentSpan?.createChildSpan({
      type: AISpanType.TOOL_CALL,
      name: 'finnhub-economic',
      input: { economic_code: context.economic_code }
    });

    logToolExecution('finnhubEconomicTool', { input: context });

    const apiKey = process.env.FINNHUB_API_KEY;

    if (apiKey === undefined || apiKey === null || apiKey.trim() === '') {
      const error = "FINNHUB_API_KEY environment variable is required";
      rootSpan?.error({
        error: new Error(error),
        metadata: { operation: 'finnhub-economic', reason: 'missing-api-key' }
      });
      logError('finnhubEconomicTool', new Error(error), { economic_code: context.economic_code });
      return {
        data: null,
        error
      };
    }

    try {
      const params = new URLSearchParams();
      params.append('token', apiKey);
      params.append('code', context.economic_code);

      const url = `https://finnhub.io/api/v1/economic?${params.toString()}`;

      // Create child span for API call
      const apiSpan = rootSpan?.createChildSpan({
        type: AISpanType.TOOL_CALL,
        name: 'finnhub-api-call',
        input: { url: url.replace(apiKey, '[REDACTED]'), method: 'GET' },
      });

      logStepStart('finnhub-api-call', {
        economic_code: context.economic_code,
        url: url.replace(apiKey, '[REDACTED]')
      });

      const apiStartTime = Date.now();
      const response = await fetch(url);
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

      logStepEnd('finnhub-api-call', {
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
            metadata: { operation: 'finnhub-economic', reason: 'api-error', economic_code: context.economic_code }
          });
          logError('finnhubEconomicTool', new Error(error), { economic_code: context.economic_code, apiError: error });
          return {
            data: null,
            error
          };
        }
      }

      const result = {
        data,
        metadata: {
          economic_code: context.economic_code
        },
        error: undefined
      };

      rootSpan?.end({
        output: {
          economic_code: context.economic_code,
          hasData: data !== null && data !== undefined
        }
      });

      logToolExecution('finnhubEconomicTool', { output: { economic_code: context.economic_code } });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      rootSpan?.error({
        error: error instanceof Error ? error : new Error(errorMessage),
        metadata: { operation: 'finnhub-economic', reason: 'execution-error', economic_code: context.economic_code }
      });
      logError('finnhubEconomicTool', error instanceof Error ? error : new Error(errorMessage), { economic_code: context.economic_code });
      return {
        data: null,
        error: errorMessage
      };
    }
  }
});
