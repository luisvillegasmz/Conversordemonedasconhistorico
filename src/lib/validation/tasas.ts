import { z } from 'zod';

// Simple validation for query parameters used in the rates API.
export const tasasQuerySchema = z.object({
  base: z.string().min(1, { message: 'Base currency is required' }),
});
