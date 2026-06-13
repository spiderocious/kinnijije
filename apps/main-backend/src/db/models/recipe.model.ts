import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const ingredientSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: String },
    approximate: { type: Boolean, default: false },
    canonicalKey: { type: String, required: true },
  },
  { _id: false },
);

const stepSchema = new Schema(
  {
    index: { type: Number, required: true },
    heading: { type: String, required: true },
    description: { type: String, required: true },
    estMinutes: { type: Number },
  },
  { _id: false },
);

const recipeSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    source: { type: String, enum: ['seed', 'ai'], required: true, index: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    name: { type: String, required: true },
    cuisines: { type: [String], default: [] },
    difficulty: { type: String, enum: ['easy', 'medium', 'involved'], required: true },
    cookTimeMinutes: { type: Number, required: true },
    serves: { type: Number, required: true, default: 4 },
    heroImageKey: { type: String, default: null },
    heroImageKind: {
      type: String,
      enum: ['photo', 'generated', 'placeholder'],
      default: 'placeholder',
    },
    ingredients: { type: [ingredientSchema], default: [] },
    steps: { type: [stepSchema], default: [] },
    searchKeys: { type: [String], default: [], index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    sourceAuditId: { type: Schema.Types.ObjectId, ref: 'AiAudit', default: null },
  },
  { timestamps: true, strict: true },
);

export type RecipeDoc = InferSchemaType<typeof recipeSchema>;
export type RecipeHydrated = HydratedDocument<RecipeDoc>;
export const RecipeModel = model('Recipe', recipeSchema);
