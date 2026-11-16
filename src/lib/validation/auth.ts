import { z } from 'zod';

// Schema for the login request body (POST /api/auth/sesion)
export const loginSchema = z.object({
  idToken: z.string().min(1, { message: 'idToken is required' }),
});
