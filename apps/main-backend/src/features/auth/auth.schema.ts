import { z } from 'zod';

export const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type LoginBody = z.infer<typeof LoginBody>;

export const RegisterBody = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
});
export type RegisterBody = z.infer<typeof RegisterBody>;

export const RefreshBody = z.object({
  refresh_token: z.string().min(1),
});
export type RefreshBody = z.infer<typeof RefreshBody>;
