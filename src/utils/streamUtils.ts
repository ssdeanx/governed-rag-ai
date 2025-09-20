import type { StreamTextResult } from 'ai';

// ------------------- Functions for Data-Only SSE Format -------------------

/**
 * Creates an HTTP Response that streams server-sent events (SSE) using a data-only format.
 *
 * The provided callback is given the stream controller to enqueue UTF-8 encoded SSE payloads.
 * The stream signals normal completion by emitting an `event: done` line followed by an empty `data:` frame.
 * If the callback throws, an error payload `{ type: "error", message }` is emitted in a `data:` frame before the stream closes.
 *
 * @param cb - Async callback that receives a ReadableStreamDefaultController<Uint8Array> to enqueue SSE frames (UTF-8 bytes). It should not close the controller; completion is handled by this function.
 * @returns A Response whose body is the SSE ReadableStream and which includes headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, and `Connection: keep-alive`.
 */

export function createSSEStream(
  cb: (controller: ReadableStreamDefaultController<Uint8Array>) => Promise<void>,
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await cb(controller);
        // Signal completion with empty data
        controller.enqueue(encoder.encode('event: done\n'));
        controller.enqueue(encoder.encode('data:\n\n'));
      } catch (err) {
        console.error('Error during SSE stream', err);

        const message = err instanceof Error ? err.message : 'Internal error';
        controller.enqueue(encoder.encode('data: '));
        controller.enqueue(encoder.encode(`${JSON.stringify({ type: 'error', message })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export function streamProgressUpdate(
  controller: ReadableStreamDefaultController<Uint8Array>,
  message: string,
  status: 'in_progress' | 'complete' | 'error',
) {
  const encoder = new TextEncoder();
  const payload = {
    type: 'progress_update',
    state: status,
    text: message,
  };
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
}

/**
 * Emits a JSON-serializable payload as an SSE `data:` event on the given stream controller.
 *
 * The payload is serialized with `JSON.stringify` and written as `data: <json>\n\n` (bytes) so it can be consumed by an SSE client.
 *
 * @param controller - Readable stream controller to enqueue the encoded SSE bytes into
 * @param eventData - The value to serialize and send as the event payload
 */

export function streamJSONEvent<T>(
  controller: ReadableStreamDefaultController<Uint8Array>,
  eventData: T,
) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode('data: '));
  controller.enqueue(encoder.encode(`${JSON.stringify(eventData)}\n\n`));
}

/**
 * Stream text chunks from a StreamTextResult into an SSE-compatible data-only stream and return the full concatenated text.
 *
 * Iterates the async `textStream` from `streamResult`, escapes literal newline characters (`\n` → `\\n`) for SSE compliance,
 * and enqueues each chunk as a `data: <chunk>\n\n` event on the provided `streamController`.
 *
 * @param streamResult - Source containing an async iterable `textStream` of string chunks.
 * @param streamController - Readable stream controller on which SSE `data:` events are enqueued.
 * @returns The concatenation of all streamed chunks as a single string.
 */

export async function handleTextStream(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  streamResult: StreamTextResult<any, any>,
  streamController: ReadableStreamDefaultController<Uint8Array>,
): Promise<string> {
  const encoder = new TextEncoder();
  const chunks: string[] = [];

  // Stream raw text chunks through data field
  for await (const chunk of streamResult.textStream) {
    chunks.push(chunk);
    // Escape literal newlines for SSE compliance
    const escaped = chunk.replace(/\n/g, '\\n');
    streamController.enqueue(encoder.encode(`data:${escaped}\n\n`));
  }

  return chunks.join('');
}
