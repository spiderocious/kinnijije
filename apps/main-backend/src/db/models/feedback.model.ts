import { Schema, model, type InferSchemaType } from 'mongoose';

const targetSchema = new Schema(
  {
    kind: { type: String, enum: ['step', 'ingredient'], required: true },
    index: { type: Number, required: true },
  },
  { _id: false },
);

const feedbackSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true, index: true },
    target: { type: targetSchema, required: true },
    note: { type: String },
    status: { type: String, enum: ['open', 'reviewed'], default: 'open', index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, strict: true },
);

export type FeedbackDoc = InferSchemaType<typeof feedbackSchema>;
export const FeedbackModel = model('Feedback', feedbackSchema);
