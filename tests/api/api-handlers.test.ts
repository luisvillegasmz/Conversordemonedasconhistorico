import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getTasas } from "@/app/api/tasas/route";
import { GET as getHistorico } from "@/app/api/tasas/historico/route";
import { GET as getFavoritos } from "@/app/api/favoritos/route";
import { DELETE as deleteFavorito } from "@/app/api/favoritos/[id]/route";
import { GET as getYo } from "@/app/api/auth/yo/route";

// Simulación de la capa de Firebase Admin SDK
vi.mock("@/src/lib/firebase/admin", () => ({
  getAdminAuth: () => ({
    verifySessionCookie: vi.fn().mockImplementation((cookie: string) => {
      if (cookie === "sesion-valida") {
        return Promise.resolve({
          uid: "usr_12345",
          email: "usuario@ejemplo.com",
          rol: "usuario",
        });
      }
      return Promise.reject(new Error("Cookie expirada"));
    }),
    verifyIdToken: vi.fn().mockImplementation((token: string) => {
      if (token === "token-valido") {
        return Promise.resolve({
          uid: "usr_12345",
          email: "usuario@ejemplo.com",
          rol: "usuario",
        });
      }
      return Promise.reject(new Error("Token inválido"));
    }),
  }),
  getAdminDb: () => ({
    collection: vi.fn(),
  }),
}));

describe("API REST Handlers (Vitest)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Validación 400: Devuelve 400 cuando se solicita una moneda no permitida", async () => {
    const req = new Request("http://localhost:3000/api/tasas?base=MONEDA_FALSA");
    const response = await getTasas(req);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(data.detalles).toBeDefined();
  });

  it("Validación 400: Devuelve 400 cuando el rango de días en histórico excede 365 días", async () => {
    const req = new Request(
      "http://localhost:3000/api/tasas/historico?base=USD&destino=EUR&dias=400"
    );
    const response = await getHistorico(req);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it("Autenticación 401: Devuelve 401 cuando falta sesión o token en /api/auth/yo", async () => {
    const req = new Request("http://localhost:3000/api/auth/yo");
    const response = await getYo(req);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain("inicio de sesión");
  });

  it("Autenticación 401: Devuelve 401 en /api/favoritos sin credenciales", async () => {
    const req = new Request("http://localhost:3000/api/favoritos");
    const response = await getFavoritos(req);

    expect(response.status).toBe(401);
  });

  it("Éxito 200: Devuelve datos del usuario con token de autorización Bearer", async () => {
    const req = new Request("http://localhost:3000/api/auth/yo", {
      headers: {
        Authorization: "Bearer token-valido",
      },
    });
    const response = await getYo(req);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.usuario.uid).toBe("usr_12345");
    expect(data.usuario.correo).toBe("usuario@ejemplo.com");
  });

  it("Autorización / 404: Devuelve 404 al intentar eliminar un favorito inexistente", async () => {
    const req = new Request("http://localhost:3000/api/favoritos/PAR_INEXISTENTE", {
      method: "DELETE",
      headers: {
        Authorization: "Bearer token-valido",
      },
    });
    const response = await deleteFavorito(req, {
      params: Promise.resolve({ id: "PAR_INEXISTENTE" }),
    });

    expect(response.status).toBe(404);
  });
});
