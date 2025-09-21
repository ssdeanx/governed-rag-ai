import type { NextRequest } from 'next/server';

/**
 * HTTP POST handler for sign-out requests.
 *
 * Responds with a JSON `{ ok: true }` and HTTP 200. The handler currently does not clear cookies or session state;
 * any server-side session/cookie cleanup should be performed here if required.
 *
 * @returns A Response with `{"ok": true}` and `Content-Type: application/json`.
 */
export async function POST(req: NextRequest) {
  // If you use cookies/sessions on server, clear them here. For now just return OK.
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
