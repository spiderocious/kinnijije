// Frontend client for the external R2 file-service. The frontend uploads files
// DIRECTLY to storage via a presigned URL and keeps only the returned `key`
// (the backend stores the key, never bytes). See docs/services/file-service.
//
// Flow:
//   1. getUploadUri(ext) → { key, uri }
//   2. PUT the File to `uri` (straight to storage)
//   3. send `key` to the backend
//   4. getViewUri(key) when you need to display the file

const DEFAULT_BASE = 'https://go-file-service-production.up.railway.app';

export interface UploadTarget {
  key: string;
  uri: string;
  expiresIn: string;
}

export interface FileServiceOptions {
  baseUrl?: string;
}

export class FileService {
  private readonly base: string;

  constructor(opts: FileServiceOptions = {}) {
    this.base = (opts.baseUrl ?? DEFAULT_BASE).replace(/\/$/, '');
  }

  /** Step 1: get a presigned upload URL + the permanent key. */
  async getUploadUri(ext: string): Promise<UploadTarget> {
    const safeExt = ext.replace(/[^a-z0-9]/gi, '');
    const res = await fetch(`${this.base}/get-upload-uri?ext=${encodeURIComponent(safeExt)}`);
    if (!res.ok) throw new Error(`file-service get-upload-uri failed: ${res.status}`);
    const body = (await res.json()) as { key: string; uri: string; expires_in: string };
    return { key: body.key, uri: body.uri, expiresIn: body.expires_in };
  }

  /** Step 2: upload a file (or blob) directly to storage. Returns the key. */
  async upload(file: Blob, ext: string): Promise<string> {
    const target = await this.getUploadUri(ext);
    const put = await fetch(target.uri, {
      method: 'PUT',
      body: file,
      headers: file.type ? { 'Content-Type': file.type } : {},
    });
    if (!put.ok) throw new Error(`file-service upload failed: ${put.status}`);
    return target.key;
  }

  /** Step 4: resolve a key → a short-lived (1h) view URL for <img src> etc. */
  async getViewUri(key: string): Promise<string> {
    const res = await fetch(`${this.base}/get-file-uri?key=${encodeURIComponent(key)}`);
    if (!res.ok) throw new Error(`file-service get-file-uri failed: ${res.status}`);
    const body = (await res.json()) as { uri: string };
    return body.uri;
  }
}

export const fileService = new FileService();
