import type { NextRequest } from 'next/server';
import { getMastraBaseUrl } from '../../../../lib/mastra/mastra-client';

/**
 * Extracts a JWT/access token from a variety of common response shapes.
 *
 * Checks the provided object for token-like properties and returns the first truthy value found from:
 * `token`, `jwt`, `accessToken`, `data.token`, `data.accessToken`. Returns `null` if no token is present.
 *
 * @param obj - The object to search (e.g., a parsed backend response). May be any shape; `null`/`undefined` yields `null`.
 * @returns The token string if found, otherwise `null`.
 */
function findToken(obj: any) {
  if (!obj) { return null; }
  return obj.token || obj.jwt || obj.accessToken || obj.data?.token || obj.data?.accessToken || null;
}

/**
 * Proxy POST /api/auth/login to the Mastra auth endpoint and, when a token is present,
 * set a server-only HttpOnly cookie containing that token.
 *
 * Forwards the incoming JSON body to Mastra's /auth/login and returns the backend's
 * response body and status. If the backend response contains a token, a `mastra_jwt`
 * cookie is set with Max-Age of 7 days, Path=/, HttpOnly, SameSite=Lax, and `Secure`
 * when NODE_ENV is "production". On network/connection failures to the auth server,
 * responds with HTTP 502 and a JSON error object.
 *
 * @returns A Response whose body is the Mastra backend response (JSON or text wrapped
 *          as JSON) and whose status mirrors the backend status. When a token is found,
 *          the Response includes a Set-Cookie header for `mastra_jwt`.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const url = `${getMastraBaseUrl()}/auth/login`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    // Network/connection error talking to Mastra backend
    return new Response(JSON.stringify({ error: 'Failed to reach auth server' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }

  // attempt to parse JSON, but fall back to text for non-JSON responses
  let data: any;
  try {
    data = await res.json();
  } catch (e) {
    data = { message: await res.text() };
  }

  const token = findToken(data);

  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (token) {
    // Set HttpOnly cookie. Use Max-Age to avoid timezone issues.
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    const encoded = encodeURIComponent(token);
    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    const cookie = `mastra_jwt=${encoded}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secureFlag}`;
    headers['Set-Cookie'] = cookie;
  }

  return new Response(JSON.stringify(data), { status: res.status, headers });
}
