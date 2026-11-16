import { cookies } from "next/headers";
import { getAdminAuth } from "./firebase/admin";
import { UnauthorizedError, ForbiddenError } from "./errors";

export interface UsuarioAutenticado {
  uid: string;
  correo: string | null;
  rol: "usuario" | "admin";
}

const NOMBRE_COOKIE_SESION = "sesion";
// 5 días en milisegundos
export const TIEMPO_EXPIRACION_SESION_MS = 5 * 24 * 60 * 60 * 1000;

/**
 * Valida que la petición coincida con el origen esperado (CSRF protection)
 */
export function validarCSRF(req: Request): void {
  const method = req.method.toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");

    if (origin && host) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        throw new ForbiddenError("Origen de solicitud no autorizado (CSRF detectado)");
      }
    }
  }
}

/**
 * Obtiene el usuario autenticado a través de la cookie de sesión o el header Authorization.
 * Si no está autenticado, lanza UnauthorizedError.
 */
export async function requerirUsuario(req: Request): Promise<UsuarioAutenticado> {
  validarCSRF(req);

  let sessionCookie: string | null = null;

  // 1. Intentar leer cookie HttpOnly desde el request
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${NOMBRE_COOKIE_SESION}=`));
    if (match) {
      sessionCookie = match.split("=")[1];
    }
  }

  // 2. Intentar leer Authorization: Bearer <token> (útil para pruebas con Bruno/Postman)
  const authHeader = req.headers.get("authorization");
  let bearerToken: string | null = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    bearerToken = authHeader.substring(7).trim();
  }

  const adminAuth = getAdminAuth();

  try {
    if (sessionCookie) {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      return {
        uid: decodedClaims.uid,
        correo: decodedClaims.email || null,
        rol: (decodedClaims.rol as "usuario" | "admin") || "usuario",
      };
    }

    if (bearerToken) {
      const decodedToken = await adminAuth.verifyIdToken(bearerToken, true);
      return {
        uid: decodedToken.uid,
        correo: decodedToken.email || null,
        rol: (decodedToken.rol as "usuario" | "admin") || "usuario",
      };
    }
  } catch (error: any) {
    throw new UnauthorizedError(
      error?.code === "auth/session-cookie-expired"
        ? "La sesión ha expirado"
        : "Credenciales de sesión inválidas o expiradas"
    );
  }

  throw new UnauthorizedError("Se requiere inicio de sesión para acceder a este recurso");
}

/**
 * Obtiene el usuario actual si existe, sin lanzar excepción si no está autenticado.
 */
export async function obtenerUsuarioOpcional(req: Request): Promise<UsuarioAutenticado | null> {
  try {
    return await requerirUsuario(req);
  } catch {
    return null;
  }
}

/**
 * Obtiene el usuario en Server Components a través de cookies()
 */
export async function obtenerUsuarioServidor(): Promise<UsuarioAutenticado | null> {
  try {
    const cookieStore = await cookies();
    const sesion = cookieStore.get(NOMBRE_COOKIE_SESION)?.value;
    if (!sesion) return null;

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifySessionCookie(sesion, true);
    return {
      uid: decoded.uid,
      correo: decoded.email || null,
      rol: (decoded.rol as "usuario" | "admin") || "usuario",
    };
  } catch {
    return null;
  }
}
