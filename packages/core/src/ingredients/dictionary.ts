// Ingredient dictionary, weighted toward Nigerian / West African staples. Each
// entry maps a canonical key to the aliases/spellings that should normalise to
// it. The canonicaliser (./canonicalise.ts) consults this so "titus", "frozen
// fish", "mackerel" all collapse to `fish`, and "ata rodo", "rodo", "scotch
// bonnet" collapse to `pepper`.
//
// Keep canonical keys lowercase, singular, space-free where natural. Add freely
// — this is the product's local-knowledge moat and is meant to grow.

export const INGREDIENT_ALIASES: Record<string, readonly string[]> = {
  // Grains & swallow
  rice: ['rice', 'white rice', 'ofada', 'ofada rice', 'basmati', 'jollof rice'],
  yam: ['yam', 'puna yam', 'water yam'],
  plantain: ['plantain', 'plantains', 'dodo', 'boli', 'unripe plantain', 'ripe plantain'],
  beans: ['beans', 'bean', 'black eyed beans', 'brown beans', 'oloyin', 'honey beans'],
  garri: ['garri', 'gari', 'eba'],
  semovita: ['semovita', 'semo', 'semolina'],
  'pounded yam': ['pounded yam', 'poundo', 'poundo yam'],
  amala: ['amala', 'elubo'],
  fufu: ['fufu', 'akpu'],
  spaghetti: ['spaghetti', 'pasta', 'macaroni'],
  flour: ['flour', 'plain flour', 'all purpose flour'],
  bread: ['bread', 'agege bread', 'sliced bread'],
  noodles: ['noodles', 'indomie', 'instant noodles'],

  // Proteins
  chicken: ['chicken', 'chicken breast', 'whole chicken', 'chicken thighs'],
  beef: ['beef', 'meat', 'cow meat', 'red meat'],
  goat: ['goat', 'goat meat', 'asun'],
  fish: ['fish', 'titus', 'mackerel', 'frozen fish', 'catfish', 'tilapia', 'panla', 'stockfish', 'dried fish'],
  turkey: ['turkey'],
  egg: ['egg', 'eggs'],
  'pomo': ['pomo', 'kpomo', 'cow skin'],
  shaki: ['shaki', 'tripe', 'towel'],
  liver: ['liver'],
  gizzard: ['gizzard', 'gizzards'],
  prawns: ['prawns', 'shrimp', 'shrimps'],
  snail: ['snail', 'snails'],
  sausage: ['sausage', 'sausages', 'hot dog'],
  'crayfish': ['crayfish', 'cray fish', 'ground crayfish'],

  // Vegetables & aromatics
  tomato: ['tomato', 'tomatoes', 'fresh tomato', 'tin tomato', 'tinned tomato', 'tomato paste'],
  pepper: ['pepper', 'peppers', 'rodo', 'ata rodo', 'scotch bonnet', 'tatashe', 'red pepper', 'bell pepper', 'shombo'],
  onion: ['onion', 'onions', 'red onion'],
  garlic: ['garlic'],
  ginger: ['ginger'],
  'efo': ['efo', 'spinach', 'green', 'greens', 'efo tete', 'water leaf', 'shoko'],
  ugu: ['ugu', 'ugwu', 'pumpkin leaf', 'pumpkin leaves'],
  'bitter leaf': ['bitter leaf', 'bitterleaf', 'onugbu'],
  'scent leaf': ['scent leaf', 'efirin', 'basil'],
  okra: ['okra', 'okro', 'lady finger'],
  carrot: ['carrot', 'carrots'],
  cabbage: ['cabbage'],
  'green beans': ['green beans', 'green bean'],
  sweetcorn: ['sweetcorn', 'sweet corn', 'corn'],
  potato: ['potato', 'potatoes', 'irish potato'],
  'sweet potato': ['sweet potato', 'sweet potatoes'],
  cucumber: ['cucumber'],
  lettuce: ['lettuce'],

  // Soup bases & thickeners
  egusi: ['egusi', 'melon', 'melon seed', 'melon seeds'],
  ogbono: ['ogbono', 'ogbolo'],
  'palm oil': ['palm oil', 'red oil', 'epo pupa'],
  'vegetable oil': ['vegetable oil', 'oil', 'cooking oil', 'groundnut oil'],
  'locust beans': ['locust beans', 'iru', 'dawadawa'],
  'banga': ['banga', 'palm fruit', 'palm nut'],

  // Seasoning & pantry
  'seasoning cube': ['seasoning cube', 'maggi', 'knorr', 'bouillon', 'stock cube', 'seasoning'],
  salt: ['salt'],
  curry: ['curry', 'curry powder'],
  thyme: ['thyme'],
  'groundnut': ['groundnut', 'peanut', 'peanuts', 'groundnuts'],
  'coconut': ['coconut', 'coconut milk'],
  butter: ['butter', 'margarine'],
  milk: ['milk', 'evaporated milk', 'powdered milk'],
  sugar: ['sugar'],
  'yeast': ['yeast'],
  vinegar: ['vinegar'],
} as const;
