import { z } from 'zod';

// Validation for historical rates query parameters.
export const historicoQuerySchema = z.object({
  base: z.string().min(1, { message: 'Base currency is required' }),
  destino: z.string().min(1, { message: 'Destination currency is required' }),
  dias: z.coerce.number().int().min(1, { message: 'Days must be at least 1' }).max(365, { message: 'Days cannot exceed 365' }).optional().default(30),
});
