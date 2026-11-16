import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getAlertas } from '@/app/api/alertas/route';
import { POST as postAlerta } from '@/app/api/alertas/route';
import { PATCH as patchAlerta } from '@/app/api/alertas/[id]/route';
import { DELETE as deleteAlerta } from '@/app/api/alertas/[id]/route';

// Mock Firebase Admin SDK
vi.mock('@/src/lib/firebase/admin', () => ({
  getAdminAuth: () => ({
    verifySessionCookie: vi.fn().mockImplementation((cookie) => {
      if (cookie === 'sesion-valida') {
        return Promise.resolve({ uid: 'usr_12345', email: 'usuario@ejemplo.com', rol: 'usuario' });
      }
      return Promise.reject(new Error('Cookie expirada'));
    }),
    verifyIdToken: vi.fn().mockImplementation((token) => {
      if (token === 'token-valido') {
        return Promise.resolve({ uid: 'usr_12345', email: 'usuario@ejemplo.com', rol: 'usuario' });
      }
      return Promise.reject(new Error('Token inválido'));
    }),
  }),
  getAdminDb: () => ({ collection: vi.fn() }),
}));

// Mock alertasService methods
vi.mock('@/src/services/alertas.service', () => ({
  alertasService: {
    listarAlertas: vi.fn().mockResolvedValue([
      { id: 'alt_1', base: 'USD', destino: 'EUR', condicion: 'mayor', valor: 1.2, activa: true, creadaEn: '2023-01-01' },
    ]),
    crearAlerta: vi.fn().mockImplementation((_uid, datos) =>
      Promise.resolve({ id: 'alt_2', ...datos, creadaEn: new Date().toISOString() })
    ),
    actualizarAlerta: vi.fn().mockImplementation((_uid, _id, cambios) =>
      Promise.resolve({ id: 'alt_1', base: 'USD', destino: 'EUR', condicion: 'menor', valor: 1.0, activa: false, creadaEn: '2023-01-01', ...cambios })
    ),
    eliminarAlerta: vi.fn().mockResolvedValue(undefined),
    // Added mock for evaluarAlertasUsuario used by GET handler
    evaluarAlertasUsuario: vi.fn().mockResolvedValue([
      { id: 'alt_1', base: 'USD', destino: 'EUR', condicion: 'mayor', valor: 1.2, activa: true, creadaEn: '2023-01-01', tasaActual: 1.15, cumpleCondicion: false },
    ]),
  },
}));

describe('API Alertas (Vitest)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET devuelve 200 y lista de alertas autenticadas', async () => {
    const req = new Request('http://localhost:3000/api/alertas', {
      headers: { Authorization: 'Bearer token-valido' },
    });
    const res = await getAlertas(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items[0].id).toBe('alt_1');
  });

  it('POST crea alerta y devuelve 201', async () => {
    const body = {
      base: 'USD',
      destino: 'EUR',
      condicion: 'mayor',
      valor: 1.1,
    };
    const req = new Request('http://localhost:3000/api/alertas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token-valido' },
      body: JSON.stringify(body),
    });
    const res = await postAlerta(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.alerta).toMatchObject(body);
    expect(data.alerta.id).toBeDefined();
  });

  it('PATCH actualiza alerta y devuelve 200', async () => {
    const cambios = { condicion: 'menor', valor: 0.9 };
    const req = new Request('http://localhost:3000/api/alertas/alt_1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token-valido' },
      body: JSON.stringify(cambios),
    });
    const res = await patchAlerta(req, { params: Promise.resolve({ id: 'alt_1' }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.alerta.condicion).toBe('menor');
    expect(data.alerta.valor).toBe(0.9);
  });

  it('DELETE elimina alerta y devuelve 204', async () => {
    const req = new Request('http://localhost:3000/api/alertas/alt_1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer token-valido' },
    });
    const res = await deleteAlerta(req, { params: Promise.resolve({ id: 'alt_1' }) });
    expect(res.status).toBe(204);
  });

  it('GET sin autenticación devuelve 401', async () => {
    const req = new Request('http://localhost:3000/api/alertas');
    const res = await getAlertas(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('inicio de sesión');
  });
});