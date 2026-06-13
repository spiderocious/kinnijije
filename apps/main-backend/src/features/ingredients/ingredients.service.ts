import { aiExtractFromImages, aiParseIngredients, aiTranscribe } from '../../ai/index.js';
import { AppError } from '@lib/errors.js';
import { fetchBytes, heroProxyUrl } from '@lib/file-service.js';
import { HTTP_STATUS } from '@shared/constants/http-status.js';
import { repos } from '../../repositories/index.js';

// Photo extraction: the frontend has already uploaded the image(s) to R2 and
// sends us the keys. We fetch the bytes, run vision, KEEP the extraction record
// (key + result + audit link) so the user/admin can see what was uploaded.
export async function extractFromPhoto(input: {
  userId: string;
  keys: string[];
}): Promise<{ extractionId: string; ingredients: string[]; inputUrls: string[] }> {
  const images = await Promise.all(input.keys.map((k) => fetchBytes(k)));
  const result = await aiExtractFromImages(images, input.userId);
  if (!result.ok || !result.data) {
    throw new AppError('extraction_failed', 'Could not read ingredients from the photo', HTTP_STATUS.BAD_GATEWAY);
  }
  const created = await repos.extractions.create({
    userId: input.userId,
    kind: 'photo',
    inputKeys: input.keys,
    extractedIngredients: result.data,
    aiAuditId: result.auditId,
  });
  return {
    extractionId: created.id,
    ingredients: result.data,
    inputUrls: input.keys.map(heroProxyUrl),
  };
}

// Voice extraction: frontend uploads the audio to R2, sends the key. We
// transcribe (Whisper) then parse (GPT) → keep the extraction record.
export async function extractFromVoice(input: {
  userId: string;
  key: string;
}): Promise<{ extractionId: string; transcript: string; ingredients: string[]; inputUrl: string }> {
  const audio = await fetchBytes(input.key);
  const transcription = await aiTranscribe(audio, input.userId);
  if (!transcription.ok || transcription.data === undefined) {
    throw new AppError('extraction_failed', 'Could not transcribe the voice note', HTTP_STATUS.BAD_GATEWAY);
  }
  const parsed = await aiParseIngredients(transcription.data, input.userId);
  const ingredients = parsed.ok && parsed.data ? parsed.data : [];

  const created = await repos.extractions.create({
    userId: input.userId,
    kind: 'voice',
    inputKeys: [input.key],
    transcript: transcription.data,
    extractedIngredients: ingredients,
    aiAuditId: parsed.auditId,
  });
  return {
    extractionId: created.id,
    transcript: transcription.data,
    ingredients,
    inputUrl: heroProxyUrl(input.key),
  };
}
