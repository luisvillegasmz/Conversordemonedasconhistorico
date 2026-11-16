import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as postFavoritos, GET as getFavoritos } from "@/app/api/favoritos/route";
import { DELETE as deleteFavorito } from "@/app/api/favoritos/[id]/route";

// Simular capa de Firebase Admin para la sesión
vi.mock("@/src/lib/firebase/admin", () => ({
  getAdminAuth: () => ({
    verifyIdToken: vi.fn().mockImplementation((token: string) => {
      if (token === "token-integracion") {
        return Promise.resolve({
          uid: "uid-integracion-test",
          email: "integracion@test.com",
          rol: "usuario",
        });
      }
      return Promise.reject(new Error("Token no válido"));
    }),
    verifySessionCookie: vi.fn(),
  }),
  getAdminDb: () => ({
    collection: vi.fn(),
  }),
}));

describe("Prueba de Integración: Ruta -> Servicio -> Repositorio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Recorre el flujo completo de creación, consulta y eliminación de un par favorito", async () => {
    const authHeader = { Authorization: "Bearer token-integracion" };

    // 1. Crear un par favorito USD -> JPY
    const postReq = new Request("http://localhost:3000/api/favoritos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
      body: JSON.stringify({ base: "USD", destino: "JPY" }),
    });

    const postRes = await postFavoritos(postReq);
    expect(postRes.status).toBe(201);
    const postData = await postRes.json();
    expect(postData.favorito).toBeDefined();
    expect(postData.favorito.base).toBe("USD");
    expect(postData.favorito.destino).toBe("JPY");

    // 2. Consultar lista y verificar que el favorito creado esté presente
    const getReq = new Request("http://localhost:3000/api/favoritos", {
      headers: authHeader,
    });
    const getRes = await getFavoritos(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.items).toBeDefined();
    const existe = getData.items.some(
      (item: { base: string; destino: string }) => item.base === "USD" && item.destino === "JPY"
    );
    expect(existe).toBe(true);

    // 3. Intento de duplicado debe responder con 409 Conflicto
    const dupReq = new Request("http://localhost:3000/api/favoritos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
      body: JSON.stringify({ base: "USD", destino: "JPY" }),
    });
    const dupRes = await postFavoritos(dupReq);
    expect(dupRes.status).toBe(409);

    // 4. Eliminar el par favorito recién creado
    const deleteReq = new Request("http://localhost:3000/api/favoritos/USD_JPY", {
      method: "DELETE",
      headers: authHeader,
    });
    const deleteRes = await deleteFavorito(deleteReq, {
      params: Promise.resolve({ id: "USD_JPY" }),
    });
    expect(deleteRes.status).toBe(204);
  });
});
