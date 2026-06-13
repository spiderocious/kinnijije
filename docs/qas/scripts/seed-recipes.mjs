// Phase 2 seed — creates the admin user and seeds a tested subset of real
// Nigerian / West African recipes THROUGH THE ADMIN API (the Phase-2 point:
// content is created via the admin path, not hardcoded in app code).
//
// Usage:
//   node docs/qas/scripts/seed-recipes.mjs
//
// Env (optional):
//   API=http://localhost:9093/api/v1   MONGO=mongodb://127.0.0.1:27017/kinnijije
//   ADMIN_EMAIL=admin@kinnijije.app     ADMIN_PASSWORD=Password123!
//
// Requires: the backend running, Mongo running, and `mongosh` on PATH (used once
// to promote the seed account to role=admin, which the public API can't do).

import { execSync } from 'node:child_process';

const API = process.env.API ?? 'http://localhost:9093/api/v1';
const MONGO = process.env.MONGO ?? 'mongodb://127.0.0.1:27017/kinnijije';
const EMAIL = process.env.ADMIN_EMAIL ?? 'admin@kinnijije.app';
const PASSWORD = process.env.ADMIN_PASSWORD ?? 'Password123!';

async function call(method, path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(json.error ?? json)}`);
  }
  return json.data ?? json;
}

async function ensureAdmin() {
  // Register (ignore "already exists"), then promote to admin in Mongo, then log in.
  try {
    await call('POST', '/auth/register', { email: EMAIL, name: 'KinniJije Admin', password: PASSWORD });
    console.log(`✓ registered ${EMAIL}`);
  } catch (err) {
    if (!String(err.message).includes('409') && !String(err.message).includes('conflict')) throw err;
    console.log(`• ${EMAIL} already exists`);
  }

  execSync(
    `mongosh "${MONGO}" --quiet --eval 'db.users.updateOne({email:"${EMAIL}"},{$set:{role:"admin"}})'`,
    { stdio: 'pipe' },
  );
  console.log('✓ promoted to admin');

  const { tokens } = await call('POST', '/auth/login', { email: EMAIL, password: PASSWORD });
  return tokens.access_token;
}

async function seedRecipe(token, recipe) {
  const { recipe: created } = await call('POST', '/admin/recipes', recipe, token);
  await call('POST', `/admin/recipes/${created.id}/publish`, undefined, token);
  console.log(`  ✓ ${recipe.name}`);
  return created.id;
}

const RECIPES = [
  {
    name: 'Jollof Rice',
    source: 'seed',
    cuisines: ['Nigerian', 'West African'],
    difficulty: 'medium',
    cookTimeMinutes: 50,
    serves: 4,
    ingredients: [
      { name: 'rice', quantity: '3 cups' },
      { name: 'tomatoes', quantity: '6 large' },
      { name: 'red pepper', quantity: '3 tatashe' },
      { name: 'scotch bonnet', quantity: '1' },
      { name: 'onion', quantity: '2' },
      { name: 'vegetable oil', quantity: '1 cup' },
      { name: 'seasoning cube', quantity: '3' },
    ],
    steps: [
      { heading: 'Blend the base', description: 'Blend tomatoes, red pepper, scotch bonnet and one onion until smooth.', estMinutes: 5 },
      { heading: 'Fry the base', description: 'Heat the oil, slice the second onion and fry, then add the blend. Fry until the oil floats and the raw smell is gone.', estMinutes: 20 },
      { heading: 'Cook the rice', description: 'Add washed rice, stock and seasoning. Cover with foil and lid, cook on low until tender, stirring once.', estMinutes: 25 },
    ],
  },
  {
    name: 'Egusi Soup',
    source: 'seed',
    cuisines: ['Nigerian'],
    difficulty: 'medium',
    cookTimeMinutes: 60,
    serves: 6,
    ingredients: [
      { name: 'egusi', quantity: '2 cups' },
      { name: 'palm oil', quantity: '1 cup' },
      { name: 'ugu', quantity: '2 handfuls' },
      { name: 'beef', quantity: '500g' },
      { name: 'fish', quantity: '300g' },
      { name: 'crayfish', quantity: '3 tbsp' },
      { name: 'scotch bonnet', quantity: '2' },
      { name: 'onion', quantity: '1' },
    ],
    steps: [
      { heading: 'Boil the meat', description: 'Season and boil the beef with onion until tender; keep the stock.', estMinutes: 25 },
      { heading: 'Fry egusi', description: 'Heat palm oil, add blended egusi paste and fry, stirring, until it clumps and the oil rises.', estMinutes: 15 },
      { heading: 'Simmer', description: 'Add stock, crayfish, pepper, fish and meat. Simmer, then stir in the ugu and cook 5 more minutes.', estMinutes: 20 },
    ],
  },
  {
    name: 'Efo Riro',
    source: 'seed',
    cuisines: ['Nigerian', 'West African'],
    difficulty: 'medium',
    cookTimeMinutes: 45,
    serves: 5,
    ingredients: [
      { name: 'efo', quantity: '2 bunches' },
      { name: 'palm oil', quantity: '3/4 cup' },
      { name: 'red pepper', quantity: '3 tatashe' },
      { name: 'scotch bonnet', quantity: '2' },
      { name: 'locust beans', quantity: '2 tbsp' },
      { name: 'fish', quantity: '300g' },
      { name: 'seasoning cube', quantity: '2' },
    ],
    steps: [
      { heading: 'Bleach the oil', description: 'Heat palm oil briefly, then add the blended pepper and fry down.', estMinutes: 15 },
      { heading: 'Add proteins', description: 'Stir in locust beans, fish and seasoning; simmer to combine.', estMinutes: 15 },
      { heading: 'Fold in greens', description: 'Add the washed, chopped efo and cook just until wilted — do not overcook.', estMinutes: 8 },
    ],
  },
  {
    name: 'Fried Rice',
    source: 'seed',
    cuisines: ['Nigerian'],
    difficulty: 'medium',
    cookTimeMinutes: 45,
    serves: 5,
    ingredients: [
      { name: 'rice', quantity: '3 cups' },
      { name: 'carrot', quantity: '2' },
      { name: 'green beans', quantity: '1 cup' },
      { name: 'sweetcorn', quantity: '1 cup' },
      { name: 'liver', quantity: '200g' },
      { name: 'vegetable oil', quantity: '1/3 cup' },
      { name: 'curry', quantity: '1 tbsp' },
    ],
    steps: [
      { heading: 'Parboil rice', description: 'Parboil the rice in seasoned stock until just underdone; drain.', estMinutes: 15 },
      { heading: 'Prep veg', description: 'Dice carrots and green beans small; cook the liver and cube it.', estMinutes: 10 },
      { heading: 'Stir-fry', description: 'On high heat, stir-fry the veg in oil with curry, then fold in the rice and liver.', estMinutes: 12 },
    ],
  },
  {
    name: 'Beans and Plantain',
    source: 'seed',
    cuisines: ['Nigerian'],
    difficulty: 'easy',
    cookTimeMinutes: 60,
    serves: 4,
    ingredients: [
      { name: 'beans', quantity: '2 cups' },
      { name: 'plantain', quantity: '3 ripe' },
      { name: 'palm oil', quantity: '1/2 cup' },
      { name: 'red pepper', quantity: '2' },
      { name: 'onion', quantity: '1' },
    ],
    steps: [
      { heading: 'Cook the beans', description: 'Boil the beans until soft, topping up water as needed.', estMinutes: 40 },
      { heading: 'Make the sauce', description: 'Fry onion and pepper in palm oil, then stir into the beans and season.', estMinutes: 10 },
      { heading: 'Fry plantain', description: 'Fry the ripe plantain (dodo) until golden and serve alongside.', estMinutes: 8 },
    ],
  },
  {
    name: 'Moin Moin',
    source: 'seed',
    cuisines: ['Nigerian'],
    difficulty: 'involved',
    cookTimeMinutes: 75,
    serves: 6,
    ingredients: [
      { name: 'beans', quantity: '3 cups peeled' },
      { name: 'red pepper', quantity: '2 tatashe' },
      { name: 'scotch bonnet', quantity: '1' },
      { name: 'vegetable oil', quantity: '1/2 cup' },
      { name: 'egg', quantity: '3 boiled' },
      { name: 'onion', quantity: '1' },
    ],
    steps: [
      { heading: 'Blend', description: 'Blend peeled beans with pepper, onion and a little water into a smooth, pourable batter.', estMinutes: 10 },
      { heading: 'Season', description: 'Beat in the oil and seasoning until light; fold in sliced boiled egg.', estMinutes: 8 },
      { heading: 'Steam', description: 'Pour into wraps or cups and steam until set, about 45–55 minutes.', estMinutes: 50 },
    ],
  },
  {
    name: 'Pepper Soup (Catfish)',
    source: 'seed',
    cuisines: ['Nigerian'],
    difficulty: 'easy',
    cookTimeMinutes: 35,
    serves: 4,
    ingredients: [
      { name: 'fish', quantity: '1 large catfish' },
      { name: 'scotch bonnet', quantity: '2' },
      { name: 'scent leaf', quantity: '1 handful' },
      { name: 'onion', quantity: '1' },
      { name: 'crayfish', quantity: '2 tbsp' },
      { name: 'seasoning cube', quantity: '2' },
    ],
    steps: [
      { heading: 'Build the broth', description: 'Bring water to a boil with onion, crayfish, pepper, pepper-soup spice and seasoning.', estMinutes: 12 },
      { heading: 'Add the fish', description: 'Slide in the cleaned catfish and simmer gently so it stays whole.', estMinutes: 15 },
      { heading: 'Finish', description: 'Stir in torn scent leaf and turn off the heat.', estMinutes: 3 },
    ],
  },
  {
    name: 'Ewa Agoyin',
    source: 'seed',
    cuisines: ['Nigerian'],
    difficulty: 'medium',
    cookTimeMinutes: 80,
    serves: 5,
    ingredients: [
      { name: 'beans', quantity: '3 cups' },
      { name: 'palm oil', quantity: '1 cup' },
      { name: 'red pepper', quantity: '4 dried' },
      { name: 'onion', quantity: '3' },
      { name: 'locust beans', quantity: '2 tbsp' },
    ],
    steps: [
      { heading: 'Mash the beans', description: 'Cook the beans until very soft and mash to a paste.', estMinutes: 50 },
      { heading: 'Burn the sauce', description: 'Slow-fry sliced onion in palm oil until very dark, add ground dried pepper and locust beans for the signature agoyin sauce.', estMinutes: 25 },
      { heading: 'Serve', description: 'Top the mashed beans with the dark pepper sauce.', estMinutes: 2 },
    ],
  },
  {
    name: 'Yam Pottage (Asaro)',
    source: 'seed',
    cuisines: ['Nigerian'],
    difficulty: 'easy',
    cookTimeMinutes: 45,
    serves: 4,
    ingredients: [
      { name: 'yam', quantity: '1 medium tuber' },
      { name: 'palm oil', quantity: '1/2 cup' },
      { name: 'red pepper', quantity: '3' },
      { name: 'fish', quantity: '200g dried' },
      { name: 'onion', quantity: '1' },
      { name: 'ugu', quantity: '1 handful' },
    ],
    steps: [
      { heading: 'Boil the yam', description: 'Peel, cube and boil the yam with pepper, onion and palm oil.', estMinutes: 20 },
      { heading: 'Mash slightly', description: 'When soft, mash some of the yam to thicken the pottage; add the dried fish.', estMinutes: 10 },
      { heading: 'Finish', description: 'Stir in chopped ugu and cook 3 more minutes.', estMinutes: 5 },
    ],
  },
  {
    name: 'Chicken Stew',
    source: 'seed',
    cuisines: ['Nigerian', 'West African'],
    difficulty: 'easy',
    cookTimeMinutes: 50,
    serves: 6,
    ingredients: [
      { name: 'chicken', quantity: '1 whole, cut' },
      { name: 'tomatoes', quantity: '6' },
      { name: 'red pepper', quantity: '3 tatashe' },
      { name: 'scotch bonnet', quantity: '2' },
      { name: 'onion', quantity: '2' },
      { name: 'vegetable oil', quantity: '1 cup' },
    ],
    steps: [
      { heading: 'Cook the chicken', description: 'Season and boil the chicken with onion; reserve the stock.', estMinutes: 20 },
      { heading: 'Fry the base', description: 'Blend and fry tomatoes, pepper and onion in oil until thick and the oil floats.', estMinutes: 20 },
      { heading: 'Combine', description: 'Add the chicken and a little stock; simmer to marry the flavours.', estMinutes: 10 },
    ],
  },
  {
    name: 'Gizdodo',
    source: 'seed',
    cuisines: ['Nigerian'],
    difficulty: 'medium',
    cookTimeMinutes: 40,
    serves: 4,
    ingredients: [
      { name: 'gizzard', quantity: '400g' },
      { name: 'plantain', quantity: '3 ripe' },
      { name: 'red pepper', quantity: '2 tatashe' },
      { name: 'scotch bonnet', quantity: '1' },
      { name: 'onion', quantity: '1' },
      { name: 'vegetable oil', quantity: 'for frying' },
    ],
    steps: [
      { heading: 'Cook gizzard', description: 'Season and boil the gizzards until tender, then fry lightly.', estMinutes: 18 },
      { heading: 'Fry plantain', description: 'Dice and fry the ripe plantain until golden.', estMinutes: 8 },
      { heading: 'Toss in sauce', description: 'Make a quick pepper sauce, then toss the gizzard and dodo through it.', estMinutes: 10 },
    ],
  },
  {
    name: 'Indomie Stir-fry (Nigerian)',
    source: 'seed',
    cuisines: ['Nigerian'],
    difficulty: 'easy',
    cookTimeMinutes: 20,
    serves: 2,
    ingredients: [
      { name: 'noodles', quantity: '2 packs' },
      { name: 'egg', quantity: '2' },
      { name: 'carrot', quantity: '1' },
      { name: 'cabbage', quantity: '1/4 head' },
      { name: 'scotch bonnet', quantity: '1' },
      { name: 'onion', quantity: '1' },
    ],
    steps: [
      { heading: 'Boil noodles', description: 'Boil the noodles briefly, drain and set aside.', estMinutes: 5 },
      { heading: 'Stir-fry veg', description: 'Fry onion, pepper, shredded carrot and cabbage on high heat.', estMinutes: 6 },
      { heading: 'Combine', description: 'Push veg aside, scramble the eggs, then fold in the noodles and seasoning.', estMinutes: 5 },
    ],
  },
];

async function main() {
  console.log(`Seeding via ${API}`);
  const token = await ensureAdmin();
  console.log(`\nSeeding ${RECIPES.length} recipes:`);
  for (const recipe of RECIPES) {
    try {
      await seedRecipe(token, recipe);
    } catch (err) {
      console.error(`  ✗ ${recipe.name}: ${err.message}`);
    }
  }
  console.log(`\nDone. Admin login: ${EMAIL} / ${PASSWORD}`);
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
