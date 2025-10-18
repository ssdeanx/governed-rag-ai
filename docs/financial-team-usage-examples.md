# Financial Team Agent Network - Usage Examples

This file contains practical examples for using the enhanced financial team agents and workflows.

## Setup

First, ensure you have the necessary imports and Mastra instance:

```typescript
import { mastra } from './src/mastra';
import { financialAnalysisWorkflow } from './src/mastra/workflows/financialAnalysisWorkflow';
```

## Example 1: Stock Analysis with Streaming

**Use Case**: Real-time stock analysis with progressive feedback

```typescript
import { mastra } from './src/mastra';

async function analyzeStockWithStreaming(symbol: string) {
    const workflow = mastra.getWorkflow('financialAnalysisWorkflow');
    const run = await workflow.createRunAsync();

    console.log(`\n📈 Analyzing ${symbol}...\n`);

    try {
        const stream = await run.streamVNext({
            inputData: {
                assetType: 'stock',
                symbol: symbol,
                analysisType: 'comprehensive',
                riskTolerance: 'medium'
            }
        });

        for await (const chunk of stream) {
            // Handle validation events
            if (chunk.type === 'validation-start') {
                console.log(`🔍 Validating ${chunk.payload.symbol}...`);
            }
            
            if (chunk.type === 'validation-complete') {
                console.log(
                    `✅ Validated: ${chunk.payload.validatedSymbol} @ $${chunk.payload.currentPrice}`
                );
            }

            // Handle analysis events
            if (chunk.type === 'analysis-start') {
                console.log(`📊 Starting technical & fundamental analysis...`);
            }

            if (chunk.type === 'analysis-progress') {
                console.log(
                    `📝 Analysis in progress (${Math.floor(chunk.payload.progress / 100)}% collected)...`
                );
            }

            if (chunk.type === 'analysis-complete') {
                console.log(
                    `✅ Analysis complete (${chunk.payload.duration}ms)`
                );
            }

            // Handle finalization events
            if (chunk.type === 'finalization-start') {
                console.log(`📋 Finalizing report...`);
            }

            if (chunk.type === 'finalization-complete') {
                console.log(`✅ Report ready!\n`);
                console.log('Final Recommendation:', chunk.payload.recommendation);
                console.log('Price Target:', chunk.payload.priceTarget);
                console.log('Risks:', chunk.payload.risks.join(', '));
            }

            if (chunk.type === 'analysis-error' || chunk.type === 'validation-error') {
                console.error(`❌ Error: ${chunk.payload.error}`);
            }
        }

    } catch (error) {
        console.error('Workflow error:', error);
    }
}

// Usage
analyzeStockWithStreaming('AAPL');
```

## Example 2: Crypto Analysis with Network Routing

**Use Case**: Let the network decide best analysis approach

```typescript
async function analyzeCryptoWithNetwork(symbol: string) {
    const networkAgent = mastra.getAgent('financial-team-network');

    console.log(`\n🪙 Analyzing ${symbol} with network routing...\n`);

    try {
        // The network will route to crypto analysis agent
        const response = await networkAgent.generate(
            `Provide a detailed analysis of ${symbol} including technical setup, 
             market sentiment, and trading signals. Consider current volatility and whale movements.`
        );

        console.log('Network Analysis:', response.text);

    } catch (error) {
        console.error('Network analysis error:', error);
    }
}

// Usage
analyzeCryptoWithNetwork('BTC');
```

## Example 3: Direct Agent Usage - Stock Analysis

**Use Case**: Direct agent call for specific analysis depth

```typescript
async function directStockAnalysis(symbol: string, tier: 'pro' | 'enterprise') {
    const stockAgent = mastra.getAgent('stock-analysis');

    console.log(`\n📊 Direct Stock Analysis: ${symbol} (${tier} tier)\n`);

    try {
        // Create runtime context with tier information
        const response = await stockAgent.generate(
            `Analyze ${symbol} for a ${tier} subscriber. Provide technical analysis using RSI, MACD, 
             and Bollinger Bands, then add fundamental analysis of P/E ratio, revenue growth, 
             and earnings. Finish with a clear buy/hold/sell recommendation.`,
            undefined,
            {
                tier: tier,
                riskTolerance: 'medium'
            }
        );

        console.log('Analysis Results:');
        console.log(response.text);
        console.log('\nUsage Statistics:');
        console.log(`Input tokens: ${response.usage?.promptTokens}`);
        console.log(`Output tokens: ${response.usage?.completionTokens}`);

    } catch (error) {
        console.error('Direct analysis error:', error);
    }
}

// Usage
directStockAnalysis('TSLA', 'pro');
```

## Example 4: Streaming Agent Responses

**Use Case**: Stream stock analysis directly from agent for real-time UI updates

```typescript
async function streamStockAnalysis(symbol: string) {
    const stockAgent = mastra.getAgent('stock-analysis');

    console.log(`\n📈 Streaming Stock Analysis: ${symbol}\n`);

    try {
        const stream = await stockAgent.stream([
            {
                role: 'user',
                content: `Analyze ${symbol}. Start with current price and recent trends, 
                         then technical indicators, then fundamentals, ending with recommendation.`
            }
        ]);

        // Stream the text response in real-time
        for await (const chunk of stream.textStream) {
            process.stdout.write(chunk);
        }

        console.log('\n\nFull text:', await stream.text);
        console.log('Finish reason:', stream.finishReason);
        console.log('Usage:', stream.usage);

    } catch (error) {
        console.error('Streaming error:', error);
    }
}

// Usage
streamStockAnalysis('AAPL');
```

## Example 5: Market Education - Learning Path

**Use Case**: Teach investment concepts adapted to learner level

```typescript
async function teachInvestmentConcept(
    concept: string,
    knowledgeLevel: 'beginner' | 'intermediate' | 'advanced'
) {
    const educationAgent = mastra.getAgent('market-education');

    console.log(`\n📚 Teaching "${concept}" (${knowledgeLevel} level)\n`);

    try {
        const response = await educationAgent.generate(
            `Explain "${concept}" in a way suitable for a ${knowledgeLevel} investor. 
             Include real examples with numbers, explain why it matters, 
             and suggest next topics to learn.`,
            undefined,
            {
                knowledgeLevel: knowledgeLevel
            }
        );

        console.log(response.text);

    } catch (error) {
        console.error('Education error:', error);
    }
}

// Usage examples
teachInvestmentConcept('What is P/E ratio?', 'beginner');
teachInvestmentConcept('How to use technical analysis in trading?', 'intermediate');
teachInvestmentConcept('Kelly Criterion for position sizing', 'advanced');
```

## Example 6: Compare Stock vs Crypto Analysis Approaches

**Use Case**: See how different agents approach similar tasks

```typescript
async function compareAnalysisApproaches(query: string) {
    const stockAgent = mastra.getAgent('stock-analysis');
    const cryptoAgent = mastra.getAgent('crypto-analysis');

    console.log(`\n🔄 Comparing Analysis Approaches: "${query}"\n`);

    try {
        // Run both analyses in parallel
        const [stockResponse, cryptoResponse] = await Promise.all([
            stockAgent.generate(`${query} (focus on stocks)`),
            cryptoAgent.generate(`${query} (focus on crypto)`)
        ]);

        console.log('=== STOCK AGENT APPROACH ===');
        console.log(stockResponse.text);

        console.log('\n=== CRYPTO AGENT APPROACH ===');
        console.log(cryptoResponse.text);

        console.log('\n=== KEY DIFFERENCES ===');
        console.log('Stock: Focuses on P/E, revenue, analyst consensus');
        console.log('Crypto: Focuses on market cap, volatility, whale movements');

    } catch (error) {
        console.error('Comparison error:', error);
    }
}

// Usage
compareAnalysisApproaches('What should we look for in a bullish technical setup?');
```

## Example 7: Batch Streaming Analysis

**Use Case**: Analyze multiple symbols with real-time progress updates

```typescript
async function batchAnalyzeWithProgress(symbols: string[], assetType: 'stock' | 'crypto') {
    const workflow = mastra.getWorkflow('financialAnalysisWorkflow');

    console.log(`\n📋 Batch ${assetType} Analysis: ${symbols.join(', ')}\n`);

    const results = [];

    for (const symbol of symbols) {
        console.log(`\n[${'='.repeat(40)}]`);
        console.log(`Analyzing: ${symbol}`);
        console.log('[' + '='.repeat(40) + ']\n');

        try {
            const run = await workflow.createRunAsync();
            const finalResult = { symbol, status: 'pending' as const };

            const stream = await run.streamVNext({
                inputData: {
                    assetType: assetType,
                    symbol: symbol,
                    analysisType: 'comprehensive'
                }
            });

            for await (const chunk of stream) {
                if (chunk.type === 'analysis-progress') {
                    process.stdout.write('.');
                }
                
                if (chunk.type === 'finalization-complete') {
                    finalResult.status = 'complete';
                }

                if (chunk.type === 'analysis-error') {
                    finalResult.status = 'error';
                    console.log(`\nError: ${chunk.payload?.error}`);
                }
            }

            results.push(finalResult);
            console.log('\n✅ Complete\n');

        } catch (error) {
            results.push({ symbol, status: 'error' as const });
            console.log(`\n❌ Failed: ${error}\n`);
        }
    }

    console.log('\n=== BATCH SUMMARY ===');
    results.forEach(result => {
        const icon = result.status === 'complete' ? '✅' : result.status === 'error' ? '❌' : '⏳';
        console.log(`${icon} ${result.symbol}: ${result.status}`);
    });
}

// Usage
batchAnalyzeWithProgress(['AAPL', 'MSFT', 'GOOGL'], 'stock');
batchAnalyzeWithProgress(['BTC', 'ETH', 'SOL'], 'crypto');
```

## Example 8: Custom Error Handling and Retry

**Use Case**: Robust analysis with automatic retry on failure

```typescript
async function robustAnalysisWithRetry(
    symbol: string,
    maxRetries: number = 3
): Promise<any> {
    const workflow = mastra.getWorkflow('financialAnalysisWorkflow');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`\nAttempt ${attempt}/${maxRetries} for ${symbol}`);
            const run = await workflow.createRunAsync();

            const stream = await run.streamVNext({
                inputData: {
                    assetType: 'stock',
                    symbol: symbol,
                    analysisType: 'comprehensive'
                }
            });

            let result = null;

            for await (const chunk of stream) {
                if (chunk.type === 'finalization-complete') {
                    result = chunk.payload;
                    console.log('✅ Analysis successful');
                    return result;
                }

                if (chunk.type === 'analysis-error') {
                    throw new Error(chunk.payload?.error || 'Analysis failed');
                }
            }

        } catch (error) {
            console.error(`Attempt ${attempt} failed:`, error);

            if (attempt < maxRetries) {
                // Exponential backoff: 1s, 2s, 4s
                const backoffMs = Math.pow(2, attempt - 1) * 1000;
                console.log(`Retrying in ${backoffMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoffMs));
            } else {
                throw new Error(`Failed after ${maxRetries} attempts: ${error}`);
            }
        }
    }
}

// Usage
robustAnalysisWithRetry('AAPL', 3).catch(console.error);
```

## Example 9: Context-Aware Analysis

**Use Case**: Pass user context to personalize recommendations

```typescript
async function personalisedAnalysis(
    symbol: string,
    userId: string,
    userProfile: {
        tier: 'free' | 'pro' | 'enterprise',
        riskTolerance: 'low' | 'medium' | 'high',
        investmentHorizon: 'short' | 'medium' | 'long'
    }
) {
    const stockAgent = mastra.getAgent('stock-analysis');

    console.log(`\n👤 Personalized Analysis for ${userId}`);
    console.log(`Profile: ${userProfile.tier} tier, ${userProfile.riskTolerance} risk tolerance`);
    console.log(`Investment horizon: ${userProfile.investmentHorizon}\n`);

    try {
        const prompt = `
        Analyze ${symbol} specifically for a ${userProfile.investmentHorizon}-term 
        investor with ${userProfile.riskTolerance} risk tolerance. 
        Consider position sizing and portfolio allocation for this profile.
        `;

        const response = await stockAgent.generate(
            prompt,
            undefined,
            {
                userId,
                tier: userProfile.tier,
                riskTolerance: userProfile.riskTolerance
            }
        );

        console.log(response.text);

    } catch (error) {
        console.error('Personalized analysis error:', error);
    }
}

// Usage
personalisedAnalysis('TSLA', 'user-123', {
    tier: 'pro',
    riskTolerance: 'medium',
    investmentHorizon: 'long'
});
```

## Example 10: Educational Streaming for UI Integration

**Use Case**: Stream lesson content for real-time UI rendering

```typescript
async function streamLessonToUI(topic: string, knowledgeLevel: 'beginner' | 'intermediate' | 'advanced') {
    const educationAgent = mastra.getAgent('market-education');

    console.log(`\n📚 Streaming Lesson: ${topic} (${knowledgeLevel})\n`);

    try {
        const stream = await educationAgent.stream([
            {
                role: 'user',
                content: `Teach me about "${topic}" at a ${knowledgeLevel} level. 
                         Structure: Definition → Why it matters → How it works → Examples → Next steps`
            }
        ]);

        // Simulate UI rendering with chunks
        for await (const chunk of stream.textStream) {
            // In real UI, update DOM element with chunk
            process.stdout.write(chunk);

            // Add small delay to simulate rendering
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        console.log('\n\n✅ Lesson complete');

    } catch (error) {
        console.error('Streaming error:', error);
    }
}

// Usage
streamLessonToUI('Diversification in investing', 'beginner');
```

## Running Examples

To run these examples:

```bash
# Single example
npx tsx examples/stock-streaming.ts

# Run all examples
for file in examples/*.ts; do
  echo "Running $file..."
  npx tsx "$file"
done
```

## Tips and Best Practices

1. **Always handle streaming events**: Check event type before accessing payload
2. **Use context wisely**: Provide runtimeContext for personalization
3. **Handle errors gracefully**: Implement retry logic for production
4. **Monitor performance**: Track analysis duration and token usage
5. **Stream for UX**: Use streaming for real-time feedback to users
6. **Batch efficiently**: Analyze multiple symbols in parallel when possible
7. **Cache results**: Store analysis results to avoid re-running for same symbols
8. **Validate inputs**: Check symbol format before analysis
