import { Schema, model, type InferSchemaType } from 'mongoose';

const featureFlagSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: true },
    description: { type: String, default: '' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: { createdAt: true, updatedAt: true }, strict: true },
);

export type FeatureFlagDoc = InferSchemaType<typeof featureFlagSchema>;
export const FeatureFlagModel = model('FeatureFlag', featureFlagSchema);
