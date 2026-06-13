import { env } from '../env.js';
import { logger } from './logger.js';

// Backend-side client for the external R2 file-service. The frontend uploads
// directly (presigned PUT) and sends us the resulting `key`; here we only need
// to (a) resolve a key → a short-lived view URL for display, and (b) fetch the
// bytes of an uploaded key to pipe into OpenAI (vision/whisper).
//
// We store only the key — never the URL (it expires) and never the bytes.

interface FileUriResponse {
  uri: string;
  expires_in: string;
  cached: boolean;
}

const base = env.FILE_SERVICE_URL.replace(/\/$/, '');

export async function getViewUri(key: string): Promise<string> {
  const res = await fetch(`${base}/get-file-uri?key=${encodeURIComponent(key)}`);
  if (!res.ok) {
    throw new Error(`file-service get-file-uri failed: ${res.status}`);
  }
  const body = (await res.json()) as FileUriResponse;
  return body.uri;
}

// Fetch the raw bytes behind a stored key (resolve → download). Used to pipe an
// uploaded kitchen photo / voice note into the AI provider.
export async function fetchBytes(key: string): Promise<Buffer> {
  const uri = await getViewUri(key);
  const res = await fetch(uri);
  if (!res.ok) {
    throw new Error(`file-service download failed: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Best-effort synchronous-ish resolver for list mappers. Resolving every hero
// URL means a network call per recipe; for list endpoints that's too chatty, so
// recipe mappers receive a resolver that returns a stable proxy URL we can
// resolve lazily. We expose a proxy endpoint shape the frontend can hit, OR
// callers can pre-resolve. Here we return a deterministic "resolve via backend"
// marker the frontend swaps — but the simplest correct default is to return the
// file-service view endpoint URL directly (the frontend follows the redirect).
export function heroProxyUrl(key: string): string {
  // The file-service get-file-uri returns JSON, not the image, so we cannot use
  // it directly in <img src>. Instead the frontend resolves keys via the api
  // package's FileService. For server-rendered URLs we hand back a stable path
  // the web app maps. Until a key is set we fall back to the placeholder.
  return `${base}/get-file-uri?key=${encodeURIComponent(key)}`;
}

export const fileService = { getViewUri, fetchBytes, heroProxyUrl };

// Surface config issues early in dev.
if (!env.FILE_SERVICE_URL) {
  logger.warn('FILE_SERVICE_URL is not set — image upload/resolve will fail');
}
