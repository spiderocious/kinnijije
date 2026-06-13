// Wire types shared across consumer features. Domain types come from
// @kinnijije/core; these describe app-specific response shapes.

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Photo/voice extraction responses.
export interface PhotoExtractionResult {
  extractionId: string;
  ingredients: string[];
  inputUrls: string[];
}

export interface VoiceExtractionResult {
  extractionId: string;
  transcript: string;
  ingredients: string[];
  inputUrl: string;
}
