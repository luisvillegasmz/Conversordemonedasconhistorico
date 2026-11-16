import { z } from 'zod';

// Schema for creating an alert
export const alertaCreateSchema = z.object({
  base: z.string().min(1, { message: 'Base es requerida' }),
  destino: z.string().min(1, { message: 'Destino es requerido' }),
  condicion: z.enum(['mayor', 'menor']),
  valor: z.number().positive({ message: 'Valor debe ser positivo' }),
  activa: z.boolean().optional(),
});

// Schema for updating an alert (partial)
export const alertaUpdateSchema = z.object({
  condicion: z.enum(['mayor', 'menor']).optional(),
  valor: z.number().positive().optional(),
  activa: z.boolean().optional(),
});
