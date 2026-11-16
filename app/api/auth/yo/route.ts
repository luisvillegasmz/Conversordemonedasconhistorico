import { NextResponse } from 'next/server';
import { verifySessionCookie } from '@/src/lib/firebase/session';
import { getAdminAuth } from '@/src/lib/firebase/admin';
import type { NextRequest } from 'next/server';

/**
 * GET /api/auth/yo
 * Returns the authenticated user's info (uid, email, custom claims "rol").
 * Supports authentication via HttpOnly session cookie (`sesion`) or
 * Bearer token in the `Authorization` header.
 */
export async function GET(req: Request) {
  try {
    // Try session cookie first
    const cookieHeader = req.headers.get('cookie') ?? '';
    const match = cookieHeader.match(/(?:^|; )sesion=([^;]+)/);
    const sessionCookie = match ? match[1] : null;

    let decoded: any;
    if (sessionCookie) {
      decoded = await verifySessionCookie(sessionCookie, true);
    } else {
      // Fallback to Bearer token
      const authHeader = req.headers.get('authorization') ?? '';
      const bearerMatch = authHeader.match(/^Bearer\s+(.*)$/i);
      const token = bearerMatch ? bearerMatch[1] : null;
      if (!token) {
        return NextResponse.json({ error: 'Se requiere inicio de sesión' }, { status: 401 });
      }
      const auth = getAdminAuth();
      decoded = await auth.verifyIdToken(token);
    }

    const { uid, email, rol } = decoded as any;
    const userInfo = {
      uid,
      correo: email ?? null,
      rol: rol ?? null,
    };
    // Return payload under the key "usuario" as expected by the tests
    return NextResponse.json({ usuario: userInfo }, { status: 200 });
  } catch (err) {
    console.error('Auth verify error', err);
    return NextResponse.json({ error: 'Sesión inválida o expirada' }, { status: 401 });
  }
}
