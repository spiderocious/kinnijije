import { Schema, model, type InferSchemaType } from 'mongoose';

const aiAuditSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    kind: { type: String, enum: ['vision', 'whisper', 'parse', 'generate'], required: true, index: true },
    promptKey: { type: String, default: null },
    promptVersion: { type: Number, default: null },
    provider: { type: String, required: true },
    model: { type: String, required: true },
    input: { type: Schema.Types.Mixed },
    rawOutput: { type: Schema.Types.Mixed },
    parsedOutput: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['ok', 'error'], required: true, index: true },
    errorMessage: { type: String, default: null },
    latencyMs: { type: Number, default: 0 },
    costEstimateUsd: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, strict: true },
);

export type AiAuditDoc = InferSchemaType<typeof aiAuditSchema>;
export const AiAuditModel = model('AiAudit', aiAuditSchema);
