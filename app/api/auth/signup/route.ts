import type { NextRequest } from 'next/server';
import { getMastraBaseUrl } from '../../../../lib/mastra/mastra-client';

/**
 * Extracts a JWT/access token from common response shapes.
 *
 * Looks for a token in the following properties (in order) and returns the first non-falsy value:
 * `token`, `jwt`, `accessToken`, `data.token`, `data.accessToken`. Returns `null` if no token is found
 * or if `obj` is falsy.
 *
 * @param obj - Object to search for a token (any shape).
 * @returns The token string if found, otherwise `null`.
 */
function findToken(obj: any) {
  if (!obj) { return null; }
  return obj.token || obj.jwt || obj.accessToken || obj.data?.token || obj.data?.accessToken || null;
}

/**
 * Proxies a signup POST to the Mastra auth service, returns the upstream response,
 * and sets a `mastra_jwt` HttpOnly cookie when the upstream response contains a token.
 *
 * Reads JSON from the incoming NextRequest, forwards it to `{MastraBaseUrl}/auth/signup`,
 * and returns the upstream response body and status. If the upstream response includes
 * a token (detected via the module's `findToken` helper), a `mastra_jwt` cookie is added:
 * Path=/, Max-Age=7 days, HttpOnly, SameSite=Lax, and `Secure` when NODE_ENV is "production".
 * If the fetch to the auth server fails, returns a 502 JSON response `{ error: 'Failed to reach auth server' }`.
 *
 * @param req - Incoming NextRequest containing the JSON signup payload.
 * @returns A Response whose status matches the upstream auth server and whose body is the upstream JSON (or text fallback).
export async function POST(req: NextRequest) {
  const body = await req.json();

  const url = `${getMastraBaseUrl()}/auth/signup`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Failed to reach auth server' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }

  let data: any;
  try {
    data = await res.json();
  } catch (e) {
    data = { message: await res.text() };
  }

  const token = findToken(data);

  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (token) {
    const maxAge = 7 * 24 * 60 * 60; // 7 days
    const encoded = encodeURIComponent(token);
    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    const cookie = `mastra_jwt=${encoded}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secureFlag}`;
    headers['Set-Cookie'] = cookie;
  }

  return new Response(JSON.stringify(data), { status: res.status, headers });
}
