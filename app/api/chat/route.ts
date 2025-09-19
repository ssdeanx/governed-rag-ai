import { mastra } from '@/src/mastra';

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

// Configure timeout config
const STATUS_VALUE = 400;
export const maxDuration = 60; // 60 seconds for chat responses
export const dynamic = 'force-dynamic';

/**
 * Handles POST requests to process a question via the "governed-rag-answer" workflow and streams the response as Server-Sent Events (SSE).
 *
 * Expects a JSON body with `jwt` and `question`. If either is missing, returns a 400 JSON error: `{ error: 'Missing required fields' }`.
 * On success, starts a Mastra workflow run, streams an initial "Processing your request..." SSE event, then streams the workflow's `answer` in successive SSE `data` events (chunks up to 50 characters with ~50ms pause between chunks). After streaming the answer it sends a final SSE event with `{ done: true, citations, contexts: [] }`.
 * If the workflow fails or an internal error occurs during streaming, a final SSE event is sent containing an error message and `done: true`. If an unexpected exception escapes, the handler returns a 500 JSON error `{ error: 'Internal server error', message }`.
 *
 * @param request - Next.js request whose JSON body must include `jwt` and `question`.
 * @returns A NextResponse that either streams SSE events (`Content-Type: text/event-stream`) for successful or partial results, or a JSON error response with status 400 or 500 for input or server errors.
 */
export async function POST(request: NextRequest) {
  try {
    const { jwt, question } = await request.json();

    if (!(jwt) || !question) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: STATUS_VALUE }
      );
    }

    const encoder: TextEncoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: 'Processing your request...\n\n' })}\n\n`)
          );

          console.log(`Processing question: ${question}`);
          const startTime = Date.now();

          // Get workflow from mastra and use createRunAsync
          const workflow = mastra.getWorkflows()['governed-rag-answer'];
          const run = await workflow.createRunAsync();

          const result = await run.start({
            inputData: { jwt, question }
          });

          const duration: number = (Date.now() - startTime) / 1000;
          console.log(`Workflow completed in ${duration}s`);

          if (result.status === 'success') {
            const { answer, citations } = result.result;

            // Stream the answer in chunks
            const chunks = answer.match(/.{1,50}/g) ?? [answer];
            for (const chunk of chunks) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
              );
              await new Promise(resolve => setTimeout(resolve, 50));
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                done: true,
                citations,
                contexts: []
              })}\n\n`)
            );
          } else {
            const errorMessage = result.status === 'failed' && 'error' in result
              ? result.error?.message || 'Failed to process your request'
              : 'Failed to process your request';
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                content: `⚠️ ${errorMessage}`,
                done: true
              })}\n\n`)
            );
          }
        } catch (error) {
          console.error('Stream error:', error);
          const errorMessage = error instanceof Error ? error.message : 'An error occurred';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              content: `❌ Error: ${errorMessage}`,
              done: true
            })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
