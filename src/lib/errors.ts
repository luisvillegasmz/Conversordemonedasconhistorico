import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface DetalleError {
  campo: string;
  mensaje: string;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly detalles?: DetalleError[];

  constructor(mensaje: string, statusCode = 500, detalles?: DetalleError[]) {
    super(mensaje);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.detalles = detalles;
  }
}

export class BadRequestError extends ApiError {
  constructor(mensaje = "Solicitud inválida", detalles?: DetalleError[]) {
    super(mensaje, 400, detalles);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(mensaje = "No autenticado o sesión expirada") {
    super(mensaje, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(mensaje = "No tiene permisos para realizar esta acción") {
    super(mensaje, 403);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends ApiError {
  constructor(mensaje = "Recurso no encontrado") {
    super(mensaje, 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends ApiError {
  constructor(mensaje = "Conflicto con el recurso actual") {
    super(mensaje, 409);
    this.name = "ConflictError";
  }
}

export class BadGatewayError extends ApiError {
  constructor(mensaje = "Error al comunicarse con el servicio externo") {
    super(mensaje, 502);
    this.name = "BadGatewayError";
  }
}

export class GatewayTimeoutError extends ApiError {
  constructor(mensaje = "Tiempo de espera agotado al conectar con el servicio externo") {
    super(mensaje, 504);
    this.name = "GatewayTimeoutError";
  }
}

export function formatearZodError(error: ZodError): DetalleError[] {
  const issues: any[] = (error as any).issues || (error as any).errors || [];
  return issues.map((err: any) => ({
    campo: Array.isArray(err.path) ? err.path.join(".") : String(err.path || ""),
    mensaje: err.message,
  }));
}

export function manejar(
  handler: (req: Request, context?: any) => Promise<Response | NextResponse>
) {
  return async (req: Request, context?: any): Promise<Response> => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Error de validación en los datos proporcionados",
            detalles: formatearZodError(error),
          },
          { status: 400 }
        );
      }

      if (error instanceof ApiError) {
        const body: { error: string; detalles?: DetalleError[] } = {
          error: error.message,
        };
        if (error.detalles && error.detalles.length > 0) {
          body.detalles = error.detalles;
        }
        return NextResponse.json(body, { status: error.statusCode });
      }

      // Si es un error de Firestore ALREADY_EXISTS o Firebase auth
      if (error?.code === "ALREADY_EXISTS" || error?.code === 6) {
        return NextResponse.json(
          { error: "El recurso ya existe o genera un conflicto" },
          { status: 409 }
        );
      }

      if (
        error?.code === "auth/id-token-expired" ||
        error?.code === "auth/session-cookie-expired"
      ) {
        return NextResponse.json(
          { error: "La sesión ha expirado" },
          { status: 401 }
        );
      }

      // Error no controlado (500) sin exponer detalles internos
      console.error("[API_ERROR]", error?.message || error);
      return NextResponse.json(
        { error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  };
}
