import { MastraClient } from "@mastra/client-js";

/**
 * Returns the configured Mastra base URL.
 *
 * Prefers the MASTRA_BASE_URL environment variable; if unset returns
 * 'http://localhost:4111' to support local development (non‑TLS).
 *
 * @returns The base URL to use for Mastra API requests.
 */
export function getMastraBaseUrl(): string {
  // prefer an explicit env var; allow http in local dev so local dev with no TLS works
  return process.env.MASTRA_BASE_URL ?? 'http://localhost:4111';
}

// only include Authorization when a service-level JWT_TOKEN exists in the environment
const serviceHeaders: Record<string,string> = {};
if (process.env.JWT_TOKEN) {
  serviceHeaders.Authorization = `Bearer ${process.env.JWT_TOKEN}`;
}

export const mastraClient = new MastraClient({
  baseUrl: getMastraBaseUrl(),
  headers: serviceHeaders,
});

/**
 * Create a MastraClient configured for a specific user's token.
 *
 * @param token - Optional user JWT to include as an `Authorization: Bearer <token>` header.
 * @returns A MastraClient instance using getMastraBaseUrl() and headers that include the bearer token when provided.
 */
export function createMastraClient(token?: string) {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return new MastraClient({
    baseUrl: getMastraBaseUrl(),
    headers,
  });
}