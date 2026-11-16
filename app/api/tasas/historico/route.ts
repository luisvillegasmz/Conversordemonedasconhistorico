import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { historicoService } from '@/src/services/historico.service';
import { historicoQuerySchema } from '@/src/lib/validation/historico';

/**
 * GET /api/tasas/historico?base=USD&destino=EUR&dias=30
 * Returns historical series with metrics.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    // Manual extraction avoids Object.fromEntries issues with undefined entries
    const base = url.searchParams.get('base') ?? '';
    const destino = url.searchParams.get('destino') ?? '';
    const diasParam = url.searchParams.get('dias');
    const dias = diasParam !== null ? Number(diasParam) : undefined;

    const parseResult = historicoQuerySchema.safeParse({ base, destino, dias });
    if (!parseResult.success) {
      // Zod v4 uses .issues; older versions used .errors. Support both.
      const message =
        (parseResult.error as any).errors?.[0]?.message ||
        (parseResult.error as any).issues?.[0]?.message ||
        'Invalid query parameters';
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const { base: b, destino: d, dias: dDays } = parseResult.data;

    // Enforce máximo 365 días antes de delegar al servicio
    if (dDays > 365) {
      return NextResponse.json({ error: 'El rango de días no puede exceder 365' }, { status: 400 });
    }

    const respuesta = await historicoService.obtenerHistorico(b, d, dDays);
    return NextResponse.json(respuesta, { status: 200 });
  } catch (err) {
    console.error('[API /tasas/historico] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
