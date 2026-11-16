import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import middleware from '../../proxy';

/** Helper to create a NextRequest with optional cookies */
function createRequest(url: string, cookie?: string): NextRequest {
  const headers = new Headers();
  if (cookie) {
    headers.set('cookie', cookie);
  }
  // NextRequest expects a URL and init object
  return new NextRequest(url, { headers });
}

describe('Middleware authentication redirects', () => {
  it('redirects unauthenticated user from a protected route to /login', async () => {
    const req = createRequest('http://localhost/favoritos');
    const res = await middleware(req);
    expect(res.status).toBe(307); // Redirect
    const location = res.headers.get('location') ?? '';
    expect(location).toContain('/login');
    // should preserve intended path in query param
    expect(new URL(location, 'http://localhost').searchParams.get('redireccion')).toBe('/favoritos');
  });

  it('allows authenticated user to access protected route', async () => {
    const req = createRequest('http://localhost/alertas', 'sesion=abc123');
    const res = await middleware(req);
    expect(res.status).toBe(200); // NextResponse.next() resolves with 200
  });

  it('redirects authenticated user away from /login to home', async () => {
    const req = createRequest('http://localhost/login', 'sesion=abc123');
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/');
  });

  it('permits unauthenticated user to view /login', async () => {
    const req = createRequest('http://localhost/login');
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });
});
