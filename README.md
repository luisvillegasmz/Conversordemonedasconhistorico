# Conversor de Monedas con Histórico

Este proyecto es una aplicación **full‑stack** construida con **Next.js 13 (App Router)**, **TypeScript**, **Tailwind CSS** y **Firebase** (Authentication + Firestore). Permite:

* Convertir divisas en tiempo real usando tasas del Banco Central Europeo.
* Guardar pares de divisas favoritos.
* Crear y gestionar **alertas** de tipo "cuando la tasa alcance un valor objetivo".
* Consultar un **histórico** de tasas mediante gráficos interactivos.
* Ejecutar tareas programadas (cron) para actualizar tasas y evaluar alertas.

---

## Tabla de contenidos
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Scripts NPM](#scripts-npm)
- [Endpoints API](#endpoints-api)
- [Cron jobs (Vercel)](#cron-jobs-vercel)
- [Pruebas](#pruebas)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Calidad & métricas](#calidad--métricas)

---

## Instalación
```bash
git clone <repo-url>
cd Conversordemonedasconhistorico
npm install
```

Copia el archivo de ejemplo de variables de entorno y rellénalo con tus credenciales:
```bash
cp .env.example .env.local
# edit .env.local
``` 

## Variables de entorno
| Variable | Uso | Comentario |
|----------|-----|------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Cliente | Clave API de Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Cliente | Dominio de Auth |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Cliente | ID del proyecto |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Cliente | App ID |
| `FIREBASE_PROJECT_ID` | Servidor | Id del proyecto (privado) |
| `FIREBASE_CLIENT_EMAIL` | Servidor | Email de la cuenta de servicio |
| `FIREBASE_PRIVATE_KEY` | Servidor | Clave privada (escapada con `\n`) |
| `CRON_SECRET` | Servidor | Token usado por Vercel para proteger los endpoints `/api/cron/*` |

## Scripts NPM
| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo (Next.js) |
| `npm run build` | Compila la aplicación para producción |
| `npm start` | Ejecuta la versión compilada |
| `npm test` | Ejecuta la suite de pruebas con Vitest |
| `npm run lint` | Lint con ESLint (auto‑fix) |
| `npm run lighthouse` | Ejecuta Lighthouse contra `http://localhost:3000` |

## Endpoints API
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/auth/yo` | Devuelve información del usuario autenticado (uid, email, rol). |
| `GET` | `/api/alertas` | Lista y evalúa todas las alertas del usuario (también evalúa en cada petición). |
| `POST` | `/api/alertas` | Crea una nueva alerta. |
| `PATCH` | `/api/alertas/:id` | Actualiza `condicion`, `valor` o `activa` de una alerta. |
| `DELETE` | `/api/alertas/:id` | Elimina la alerta. |
| `GET` | `/api/tasas/historico?base=USD&destino=EUR&dias=30` | Histórico de tasas por rango de días. |
| `GET` | `/api/tasas?base=USD&destino=EUR` | Tasas actuales. |
| `GET` | `/api/favoritos` | Lista los pares favoritos del usuario. |
| `POST` | `/api/favoritos` | Añade un par favorito. |
| `DELETE` | `/api/favoritos/:id` | Elimina un favorito. |
| `GET` | `/api/cron/tasas` | Cron protegido que actualiza las tasas (programado daily). |
| `GET` | `/api/cron/alertas` | Cron protegido que evalúa todas las alertas (programado hourly). |

## Cron jobs (Vercel)
Definidos en `vercel.json`:
```json
"crons": [
  { "path": "/api/cron/tasas",   "schedule": "0 0 * * *",   "timezone": "America/Chicago" },
  { "path": "/api/cron/alertas", "schedule": "0 * * * *",   "timezone": "America/Chicago" }
]
```
Ambos endpoints requieren el header `Authorization: Bearer <CRON_SECRET>`.

## Pruebas
```bash
npm test
```
La suite incluye pruebas unitarias, de integración y de componentes. Todos los tests pasan (`29 passed`).

## Despliegue en Vercel
1. Conecta el repositorio a Vercel.
2. En **Project Settings → Environment Variables**, agrega todas las variables listadas arriba.
3. Asegúrate de que `CRON_SECRET` sea el mismo valor que en `.env.local`.
4. Vercel detectará automáticamente `next.config.js` y `vercel.json` y activará los cron jobs.

## Calidad & métricas
- **Lighthouse**: objetivo LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
- **Accesibilidad**: pasa `axe` con nivel AA.
- **ESLint**: sin warnings (`npm run lint`).
- **Tip**: ejecutar `npm run lighthouse` después de `npm run build` para validar métricas.

---

## Contribuir
1. Fork este repositorio.
2. Crea una rama `feature/tu‑funcionalidad`.
3. Ejecuta `npm test` y verifica que todo siga pasando.
4. Abre un Pull Request.

---

© 2026 Conversor de Monedas – Licencia MIT