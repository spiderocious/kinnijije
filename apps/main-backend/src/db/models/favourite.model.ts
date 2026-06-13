import { Schema, model, type InferSchemaType } from 'mongoose';

const favouriteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    // Frozen snapshot of the recipe at save time (AI recipes aren't permanent).
    savedSnapshot: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, strict: true },
);

favouriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export type FavouriteDoc = InferSchemaType<typeof favouriteSchema>;
export const FavouriteModel = model('Favourite', favouriteSchema);
