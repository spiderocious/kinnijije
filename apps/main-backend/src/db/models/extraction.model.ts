import { Schema, model, type InferSchemaType } from 'mongoose';

const extractionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind: { type: String, enum: ['photo', 'voice'], required: true },
    inputKeys: { type: [String], default: [] },
    transcript: { type: String },
    extractedIngredients: { type: [String], default: [] },
    aiAuditId: { type: Schema.Types.ObjectId, ref: 'AiAudit', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, strict: true },
);

export type ExtractionDoc = InferSchemaType<typeof extractionSchema>;
export const ExtractionModel = model('Extraction', extractionSchema);
