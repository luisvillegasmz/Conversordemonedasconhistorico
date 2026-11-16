import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware that protects routes which require an authenticated session.
 * It checks for the `sesion` HttpOnly cookie. If missing, the user is
 * redirected to `/login` with a `redireccion` query param so the UI can
 * send them back after a successful login.
 *
 * Additionally, if an already‑authenticated user tries to access `/login`
 * we redirect them to the home page.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sesionCookie = request.cookies.get('sesion')?.value;

  // Define protected UI routes (add more here if needed).
  const protectedRoutes = [
    '/favoritos',
    '/alertas',
    '/historico', // optional: historic page may need auth
  ];

  const isProtected = protectedRoutes.some((p) => pathname.startsWith(p));

  // If the route is protected and there is no session cookie, redirect to login.
  if (isProtected && !sesionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redireccion', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If the user is already logged in and tries to open the login page, send them home.
  if (pathname === '/login' && sesionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Otherwise continue processing the request.
  return NextResponse.next();
}

/**
 * Matcher tells Next.js which paths this middleware runs on.
 */
export const config = {
  matcher: ['/favoritos/:path*', '/alertas/:path*', '/historico/:path*', '/login'],
};

export default middleware;
