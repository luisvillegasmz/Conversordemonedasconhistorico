import { NextResponse } from 'next/server';
import { createSessionCookie, clearSessionCookieHeader, SESSION_EXPIRES_IN } from '@/src/lib/firebase/session';
import type { NextRequest } from 'next/server';

/** POST /api/auth/sesion
 *  Body: { idToken: string }
 *  Returns 204 and sets HttpOnly session cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = (await import('@/src/lib/validation/auth')).loginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
    }
    const { idToken } = parseResult.data;
    const sessionCookie = await createSessionCookie(idToken);
    const response = new NextResponse(null, { status: 204 });
    const maxAge = SESSION_EXPIRES_IN;
    response.headers.set(
      'Set-Cookie',
      `sesion=${sessionCookie}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`,
    );
    return response;
  } catch (err) {
    console.error('Auth session creation error', err);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

/** DELETE /api/auth/sesion
 *  Clears the session cookie.
 */
export async function DELETE() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Set-Cookie', clearSessionCookieHeader());
  return response;
}
