import { z } from 'zod';

// Validation schema for creating a favorite pair.
export const favoritoCreateSchema = z.object({
  base: z.string().min(1, { message: 'Base currency is required' }),
  destino: z.string().min(1, { message: 'Destination currency is required' }),
});
