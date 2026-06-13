import { Schema, model, type InferSchemaType } from 'mongoose';

const promptSchema = new Schema(
  {
    key: { type: String, enum: ['vision', 'parse', 'generate'], required: true, index: true },
    version: { type: Number, required: true },
    template: { type: String, required: true },
    notes: { type: String },
    active: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, strict: true },
);

promptSchema.index({ key: 1, version: 1 }, { unique: true });

export type PromptDoc = InferSchemaType<typeof promptSchema>;
export const PromptModel = model('Prompt', promptSchema);
