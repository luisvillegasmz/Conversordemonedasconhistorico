import { getAdminAuth } from "./admin";

/** Expiration for the session cookie – 5 days */
export const SESSION_EXPIRES_IN = 5 * 24 * 60 * 60; // seconds

/** Create a Firebase session cookie from an ID token */
export async function createSessionCookie(idToken: string): Promise<string> {
  const auth = getAdminAuth();
  const expiresInMs = SESSION_EXPIRES_IN * 1000;
  return await auth.createSessionCookie(idToken, { expiresIn: expiresInMs });
}

/** Verify a session cookie, optionally checking revocation */
export async function verifySessionCookie(cookie: string, checkRevoked = true) {
  const auth = getAdminAuth();
  return await auth.verifySessionCookie(cookie, checkRevoked);
}

/** Clear the session cookie (set Max-Age=0) */
export function clearSessionCookieHeader(): string {
  return `sesion=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
