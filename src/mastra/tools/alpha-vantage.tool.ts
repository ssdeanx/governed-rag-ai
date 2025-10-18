import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Alpha Vantage Tools
 *
 * Specialized tools for financial market data from Alpha Vantage:
 * - Crypto Tool: Optimized for cryptocurrency data and exchange rates
 * - Stock Tool: Optimized for stock market data and analysis
 *
 * Requires ALPHA_VANTAGE_API_KEY environment variable
 */

/**
 * Alpha Vantage Crypto Tool
 *
 * Specialized for cryptocurrency data including:
 * - Crypto time series data (intraday, daily, weekly, monthly)
 * - Digital currency exchange rates
 * - Crypto-to-fiat and crypto-to-crypto exchange rates
 */
export const alphaVantageCryptoTool = createTool({
  id: "alpha-vantage-crypto",
  description: "Access cryptocurrency market data from Alpha Vantage including crypto prices, exchange rates, and historical data",
  inputSchema: z.object({
    function: z.enum([
      "CRYPTO_INTRADAY",
      "CRYPTO_DAILY",
      "CRYPTO_WEEKLY",
      "CRYPTO_MONTHLY",
      "CURRENCY_EXCHANGE_RATE"
    ]).describe("Crypto-specific Alpha Vantage API function"),
    symbol: z.string().describe("Cryptocurrency symbol (e.g., 'BTC', 'ETH', 'ADA')"),
    market: z.string().default("USD").describe("Quote currency for exchange rates (e.g., 'USD', 'EUR', 'BTC')"),
    interval: z.enum(["1min", "5min", "15min", "30min", "60min"]).optional().describe("Time interval for intraday data"),
    outputsize: z.enum(["compact", "full"]).optional().describe("Amount of data to return (compact=latest 100, full=all available)"),
    datatype: z.enum(["json", "csv"]).optional().describe("Response format")
  }),
  outputSchema: z.object({
    data: z.any().describe("The cryptocurrency data returned from Alpha Vantage API"),
    metadata: z.object({
      function: z.string(),
      symbol: z.string(),
      market: z.string().optional(),
      last_refreshed: z.string().optional(),
      interval: z.string().optional(),
      output_size: z.string().optional(),
      time_zone: z.string().optional()
    }).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      return {
        data: null,
        error: "ALPHA_VANTAGE_API_KEY environment variable is required"
      };
    }

    try {
      const params = new URLSearchParams({
        apikey: apiKey,
        function: context.function,
        symbol: context.symbol,
        market: context.market
      });

      // Add optional parameters
      if (context.interval !== undefined) {
        params.append("interval", context.interval);
      }
      if (context.outputsize !== undefined) {
        params.append("outputsize", context.outputsize);
      }
      if (context.datatype !== undefined) {
        params.append("datatype", context.datatype);
      }

      const url = `https://www.alphavantage.co/query?${params.toString()}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const dataObj = data as unknown;

      // Check for API-specific errors
      if ((Boolean(dataObj)) && typeof dataObj === 'object' && dataObj !== null && "Error Message" in (dataObj as Record<string, unknown>)) {
        const errorMessage = (dataObj as Record<string, unknown>)["Error Message"];
        if (errorMessage !== null && errorMessage !== undefined && String(errorMessage).trim() !== '') {
          return {
            data: null,
            error: String(errorMessage)
          };
        }
      }

      if ((Boolean(dataObj)) && typeof dataObj === 'object' && dataObj !== null && "Note" in (dataObj as Record<string, unknown>)) {
        const note = (dataObj as Record<string, unknown>)["Note"];
        if (note !== null && note !== undefined && String(note).trim() !== '') {
          return {
            data: null,
            error: String(note) // API limit reached
          };
        }
      }

      // Extract metadata if available
      let metadata: unknown = null;
      if ((Boolean(dataObj)) && typeof dataObj === 'object' && dataObj !== null) {
        const dataRecord = dataObj as Record<string, unknown>;
        if ("Meta Data" in dataRecord) {
          metadata = dataRecord["Meta Data"];
        } else if ("meta" in dataRecord) {
          metadata = dataRecord["meta"];
        }
      }

      const metadataObj = metadata;

      // Helper function to safely extract metadata values
      const getMetadataValue = (key: string): string | null => {
        if ((Boolean(metadataObj)) && typeof metadataObj === 'object' && metadataObj !== null) {
          const metaRecord = metadataObj as Record<string, unknown>;
          if (key in metaRecord) {
            const value = metaRecord[key];
            return value !== null && value !== undefined ? String(value) : null;
          }
        }
        return null;
      };

      return {
        data,
        metadata: {
          function: getMetadataValue("1. Information") ?? context.function,
          symbol: getMetadataValue("2. Symbol") ?? context.symbol,
          market: getMetadataValue("3. Market") ?? context.market,
          last_refreshed: getMetadataValue("4. Last Refreshed") ?? undefined,
          interval: getMetadataValue("5. Interval") ?? undefined,
          output_size: getMetadataValue("6. Output Size") ?? undefined,
          time_zone: getMetadataValue("7. Time Zone") ?? undefined
        }
      };

    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
});

/**
 * Alpha Vantage Stock Tool
 *
 * Specialized for stock market data including:
 * - Stock time series data (intraday, daily, weekly, monthly)
 * - Real-time quotes
 * - Symbol search
 * - Technical indicators
 * - Fundamental data
 */
export const alphaVantageStockTool = createTool({
  id: "alpha-vantage-stock",
  description: "Access stock market data from Alpha Vantage including stock prices, quotes, technical indicators, and fundamental data",
  inputSchema: z.object({
    function: z.enum([
      "TIME_SERIES_INTRADAY",
      "TIME_SERIES_DAILY",
      "TIME_SERIES_DAILY_ADJUSTED",
      "TIME_SERIES_WEEKLY",
      "TIME_SERIES_MONTHLY",
      "GLOBAL_QUOTE",
      "SYMBOL_SEARCH",
      "SMA",
      "EMA",
      "RSI",
      "MACD",
      "STOCH",
      "BBANDS",
      "ADX",
      "CCI"
    ]).describe("Stock-specific Alpha Vantage API function"),
    symbol: z.string().describe("Stock symbol (e.g., 'IBM', 'AAPL', 'GOOGL')"),
    interval: z.enum(["1min", "5min", "15min", "30min", "60min"]).optional().describe("Time interval for intraday data"),
    outputsize: z.enum(["compact", "full"]).optional().describe("Amount of data to return (compact=latest 100, full=all available)"),
    datatype: z.enum(["json", "csv"]).optional().describe("Response format"),
    // Technical indicator parameters
    indicator: z.string().optional().describe("Technical indicator name (e.g., 'SMA', 'EMA', 'RSI', 'MACD')"),
    time_period: z.number().optional().describe("Time period for technical indicators"),
    series_type: z.enum(["close", "open", "high", "low"]).optional().describe("Price series type for technical indicators")
  }),
  outputSchema: z.object({
    data: z.any().describe("The stock data returned from Alpha Vantage API"),
    metadata: z.object({
      function: z.string(),
      symbol: z.string().optional(),
      last_refreshed: z.string().optional(),
      interval: z.string().optional(),
      output_size: z.string().optional(),
      time_zone: z.string().optional(),
      indicator: z.string().optional(),
      time_period: z.string().optional(),
      series_type: z.string().optional()
    }).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
      return {
        data: null,
        error: "ALPHA_VANTAGE_API_KEY environment variable is required"
      };
    }

    try {
      const params = new URLSearchParams({
        apikey: apiKey,
        function: context.function
      });

      // Add required symbol parameter
      if (context.symbol) {
        params.append("symbol", context.symbol);
      }

      // Add optional parameters
      if (context.interval !== undefined) {
        params.append("interval", context.interval);
      }
      if (context.outputsize !== undefined) {
        params.append("outputsize", context.outputsize);
      }
      if (context.datatype !== undefined) {
        params.append("datatype", context.datatype);
      }

      // Technical indicator parameters
      if (context.indicator !== undefined && context.indicator !== null) {
        params.append("indicator", context.indicator);
      }
      if (context.time_period !== undefined && context.time_period !== null) {
        params.append("time_period", context.time_period.toString());
      }
      if (context.series_type !== undefined) {
        params.append("series_type", context.series_type);
      }

      const url = `https://www.alphavantage.co/query?${params.toString()}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const dataObj = data as unknown;

      // Check for API-specific errors
      if ((Boolean(dataObj)) && typeof dataObj === 'object' && dataObj !== null && "Error Message" in dataObj) {
        const errorMessage = (dataObj as Record<string, unknown>)["Error Message"];
        if (errorMessage !== null && errorMessage !== undefined && String(errorMessage).trim() !== '') {
          return {
            data: null,
            error: String(errorMessage)
          };
        }
      }

      if ((Boolean(dataObj)) && typeof dataObj === 'object' && dataObj !== null && "Note" in dataObj) {
        const note = (dataObj as Record<string, unknown>)["Note"];
        if (note !== null && note !== undefined && String(note).trim() !== '') {
          return {
            data: null,
            error: String(note) // API limit reached
          };
        }
      }

      // Extract metadata if available
      const metadata = ((Boolean(dataObj)) && typeof dataObj === 'object' && dataObj !== null && "Meta Data" in dataObj ? (dataObj as Record<string, unknown>)["Meta Data"] : null) ??
                      ((Boolean(dataObj)) && typeof dataObj === 'object' && dataObj !== null && "meta" in dataObj ? (dataObj as Record<string, unknown>)["meta"] : null) ??
                      {};

      const metadataObj = metadata as unknown;

      return {
        data,
        metadata: {
          function: ((Boolean(metadataObj)) && typeof metadataObj === 'object' && metadataObj !== null && "1. Information" in metadataObj ? String((metadataObj as Record<string, unknown>)["1. Information"]) : null) ?? context.function,
          symbol: ((Boolean(metadataObj)) && typeof metadataObj === 'object' && metadataObj !== null && "2. Symbol" in metadataObj ? String((metadataObj as Record<string, unknown>)["2. Symbol"]) : null) ?? context.symbol,
          last_refreshed: (Boolean(metadataObj)) && typeof metadataObj === 'object' && metadataObj !== null && "3. Last Refreshed" in metadataObj ? String((metadataObj as Record<string, unknown>)["3. Last Refreshed"]) : undefined,
          interval: (Boolean(metadataObj)) && typeof metadataObj === 'object' && metadataObj !== null && "4. Interval" in metadataObj ? String((metadataObj as Record<string, unknown>)["4. Interval"]) : undefined,
          output_size: (Boolean(metadataObj)) && typeof metadataObj === 'object' && metadataObj !== null && "5. Output Size" in metadataObj ? String((metadataObj as Record<string, unknown>)["5. Output Size"]) : undefined,
          time_zone: (Boolean(metadataObj)) && typeof metadataObj === 'object' && metadataObj !== null && "6. Time Zone" in metadataObj ? String((metadataObj as Record<string, unknown>)["6. Time Zone"]) : undefined,
          indicator: context.indicator,
          time_period: context.time_period?.toString(),
          series_type: context.series_type
        }
      };

    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
});

/**
 * Legacy Alpha Vantage Tool (General Purpose)
 *
 * Provides access to all financial market data including:
 * - Stock time series data (intraday, daily, weekly, monthly)
 * - Forex exchange rates
 * - Cryptocurrency data
 * - Economic indicators (GDP, inflation, unemployment, etc.)
 * - Technical indicators
 * - Fundamental data
 *
 * Note: For better performance, consider using alphaVantageCryptoTool or alphaVantageStockTool
 * Requires ALPHA_VANTAGE_API_KEY environment variable
 */
export const alphaVantageTool = createTool({
  id: "alpha-vantage",
  description: "Access real-time and historical financial market data from Alpha Vantage including stocks, forex, crypto, and economic indicators. For specialized use cases, consider using alphaVantageCryptoTool or alphaVantageStockTool.",
  inputSchema: z.object({
    function: z.enum([
      "TIME_SERIES_INTRADAY",
      "TIME_SERIES_DAILY",
      "TIME_SERIES_WEEKLY",
      "TIME_SERIES_MONTHLY",
      "GLOBAL_QUOTE",
      "SYMBOL_SEARCH",
      "CURRENCY_EXCHANGE_RATE",
      "FX_INTRADAY",
      "FX_DAILY",
      "FX_WEEKLY",
      "FX_MONTHLY",
      "CRYPTO_INTRADAY",
      "CRYPTO_DAILY",
      "CRYPTO_WEEKLY",
      "CRYPTO_MONTHLY",
      "DIGITAL_CURRENCY_DAILY",
      "DIGITAL_CURRENCY_WEEKLY",
      "DIGITAL_CURRENCY_MONTHLY",
      "ECONOMIC_INDICATORS",
      "TECHNICAL_INDICATOR",
      "FUNDAMENTAL_DATA"
    ]).describe("Alpha Vantage API function to call"),
    symbol: z.string().optional().describe("Stock symbol, currency pair (e.g., 'IBM', 'EURUSD'), or crypto symbol (e.g., 'BTC')"),
    market: z.string().optional().describe("Physical currency or digital/crypto currency (e.g., 'USD', 'EUR', 'BTC')"),
    interval: z.enum(["1min", "5min", "15min", "30min", "60min"]).optional().describe("Time interval for intraday data"),
    outputsize: z.enum(["compact", "full"]).optional().describe("Amount of data to return (compact=latest 100, full=all available)"),
    datatype: z.enum(["json", "csv"]).optional().describe("Response format"),
    indicator: z.string().optional().describe("Technical indicator name (e.g., 'SMA', 'EMA', 'RSI', 'MACD')"),
    time_period: z.number().optional().describe("Time period for technical indicators"),
    series_type: z.enum(["close", "open", "high", "low"]).optional().describe("Price series type for technical indicators"),
    economic_indicator: z.enum([
      "REAL_GDP",
      "REAL_GDP_PER_CAPITA",
      "TREASURY_YIELD",
      "FEDERAL_FUNDS_RATE",
      "CPI",
      "INFLATION",
      "INFLATION_EXPECTATION",
      "CONSUMER_SENTIMENT",
      "RETAIL_SALES",
      "DURABLES",
      "UNEMPLOYMENT",
      "NONFARM_PAYROLL"
    ]).optional().describe("Economic indicator to retrieve")
  }),
  outputSchema: z.object({
    data: z.any().describe("The financial data returned from Alpha Vantage API"),
    metadata: z.object({
      function: z.string(),
      symbol: z.string().optional(),
      last_refreshed: z.string().optional(),
      interval: z.string().optional(),
      output_size: z.string().optional(),
      time_zone: z.string().optional()
    }).optional(),
    error: z.string().optional()
  }),
  execute: async ({ context }) => {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    if (!apiKey) {
      return {
        data: null,
        error: "ALPHA_VANTAGE_API_KEY environment variable is required"
      };
    }

    try {
      const params = new URLSearchParams({
        apikey: apiKey,
        function: context.function
      });

      // Add function-specific parameters
      if (context.symbol !== undefined && context.symbol !== null) {
        params.append("symbol", context.symbol);
      }
      if (context.market !== undefined && context.market !== null) {
        params.append("market", context.market);
      }
      if (context.interval !== undefined) {
        params.append("interval", context.interval);
      }
      if (context.outputsize !== undefined) {
        params.append("outputsize", context.outputsize);
      }
      if (context.datatype !== undefined) {
        params.append("datatype", context.datatype ?? "json");
      }

      // Technical indicator parameters
      if (context.indicator !== undefined && context.indicator !== null) {
        params.append("indicator", context.indicator);
      }
      if (context.time_period !== undefined && context.time_period !== null) {
        params.append("time_period", context.time_period.toString());
      }
      if (context.series_type !== undefined) {
        params.append("series_type", context.series_type);
      }

      // Economic indicator
      if (context.economic_indicator !== undefined) {
        params.append("function", context.economic_indicator);
      }

      const url = `https://www.alphavantage.co/query?${params.toString()}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      const dataObj = data as unknown;

      // Check for API-specific errors
      if ((Boolean(dataObj)) && typeof dataObj === 'object' && dataObj !== null && "Error Message" in (dataObj as Record<string, unknown>) && Boolean((dataObj as Record<string, unknown>)["Error Message"])) {
        return {
          data: null,
          error: String((dataObj as Record<string, unknown>)["Error Message"])
        };
      }

      if ((Boolean(dataObj)) && typeof dataObj === 'object' && dataObj !== null && "Note" in (dataObj as Record<string, unknown>) && Boolean((dataObj as Record<string, unknown>)["Note"])) {
        return {
          data: null,
          error: String((dataObj as Record<string, unknown>)["Note"]) // API limit reached
        };
      }

      // Extract metadata if available
      const metadata = ((Boolean(dataObj)) && typeof dataObj === 'object' && dataObj !== null && "Meta Data" in dataObj ? (dataObj as Record<string, unknown>)["Meta Data"] : null) ??
                      ((Boolean(dataObj)) && typeof dataObj === 'object' && dataObj !== null && "meta" in dataObj ? (dataObj as Record<string, unknown>)["meta"] : null) ??
                      {};

      const metadataObj = metadata as unknown;

      return {
        data,
        metadata: {
          function: ((Boolean(metadataObj)) && typeof metadataObj === 'object' && metadataObj !== null && "1. Information" in metadataObj ? String((metadataObj as Record<string, unknown>)["1. Information"]) : null) ?? context.function,
          symbol: ((Boolean(metadataObj)) && typeof metadataObj === 'object' && metadataObj !== null && "2. Symbol" in metadataObj ? String((metadataObj as Record<string, unknown>)["2. Symbol"]) : null) ?? context.symbol,
          last_refreshed: (Boolean(metadataObj)) && typeof metadataObj === 'object' && metadataObj !== null && "3. Last Refreshed" in metadataObj ? String((metadataObj as Record<string, unknown>)["3. Last Refreshed"]) : undefined,
          interval: (Boolean(metadataObj)) && typeof metadataObj === 'object' && metadataObj !== null && "4. Interval" in metadataObj ? String((metadataObj as Record<string, unknown>)["4. Interval"]) : undefined,
          output_size: (Boolean(metadataObj)) && typeof metadataObj === 'object' && metadataObj !== null && "5. Output Size" in metadataObj ? String((metadataObj as Record<string, unknown>)["5. Output Size"]) : undefined,
          time_zone: (Boolean(metadataObj)) && typeof metadataObj === 'object' && metadataObj !== null && "6. Time Zone" in metadataObj ? String((metadataObj as Record<string, unknown>)["6. Time Zone"]) : undefined
        }
      };

    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
});
