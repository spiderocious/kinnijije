import argon2 from 'argon2';

// Password hashing — argon2id with library defaults (sound for 2026). Kept
// behind this module so the algorithm is swappable in one place.

export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}
