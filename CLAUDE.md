# Conversor de Monedas — Configuración de IA

Proyecto **33 · Conversor de monedas con histórico** para la materia Desarrollo Web
(Tecnológico de Antioquia). Un solo repositorio Next.js con interfaz y API REST.

---

## Stack

- **Framework:** Next.js (App Router) · React · TypeScript
- **Validación:** Zod (un solo esquema, compartido entre cliente y servidor)
- **Auth:** Firebase Auth (SDK web en el navegador) + Admin SDK (solo en el servidor)
- **Base de datos:** Firestore (acceso solo desde la API, nunca desde el navegador)
- **API externa:** Frankfurter (tasas de cambio — solo se llama desde el servidor)
- **Despliegue:** Vercel
- **Pruebas:** Vitest + React Testing Library · Playwright (e2e)
- **Linting/formato:** ESLint con `eslint-config-next` y reglas `jsx-a11y` · Prettier

---

## Comandos esenciales

```bash
npm run dev          # Servidor de desarrollo (puerto 3000)
npm run build        # Build de producción
npm run start        # Servidor de producción local
npm run lint         # ESLint (debe pasar sin advertencias)
npm run test         # Vitest (unitarias + componentes)
npm run test:e2e     # Playwright
npm run type-check   # tsc --noEmit
```

Antes de hacer un commit todos los comandos anteriores deben pasar sin errores.

---

## Estructura del proyecto

```
app/
├── layout.tsx · loading.tsx · error.tsx · not-found.tsx
├── (inicio)/page.tsx          # Conversor principal
├── historico/page.tsx
├── favoritos/page.tsx
├── alertas/page.tsx
└── api/                       # Route Handlers — la API REST
    └── auth/sesion/route.ts
src/
├── components/                # UI reutilizable y accesible
├── hooks/                     # useDebounce, usePolling…
├── schemas/                   # Esquemas Zod (cliente y servidor comparten)
├── services/                  # Lógica de negocio pura (sin efectos)
├── repositories/              # Acceso a Firestore (único lugar)
└── lib/                       # firebase-client, firebase-admin, auth, errores
tests/
ia/                            # Bitácora y evidencias de la configuración de IA
openapi.yaml
bruno/                         # Colección de solicitudes HTTP
```

---

## Reglas de calidad del código

1. **TypeScript estricto:** `strict: true` en `tsconfig.json`. Sin `any` ni `@ts-ignore`.
2. **Componentes:** servidor por defecto; `"use client"` solo cuando hay estado, efectos
   o eventos del navegador.
3. **Validación:** toda entrada del usuario pasa por un esquema Zod antes de llegar
   a la lógica de negocio o a Firestore.
4. **Errores:** los Route Handlers devuelven siempre `{ error: string }` con el código
   HTTP correcto; nunca exponen stack traces ni mensajes internos.
5. **Accesibilidad:** HTML semántico, un solo `<h1>` por página, `<label>` en cada
   campo, foco visible, contraste AA mínimo. Cero `<div onClick>`.
6. **Pruebas:** cada servicio tiene prueba unitaria; los flujos críticos tienen prueba e2e.
7. **Sin advertencias de ESLint** al hacer `npm run lint`.

---

## Convenciones

- Nombres de archivos: `kebab-case`.
- Componentes React: `PascalCase` en el archivo y en la exportación.
- Variables de entorno del servidor: `FIREBASE_*`. Variables públicas: `NEXT_PUBLIC_FIREBASE_*`.
- Commits: formato `tipo(alcance): descripción` (Conventional Commits).
  Tipos válidos: `feat`, `fix`, `chore`, `test`, `docs`, `refactor`, `style`.

---

## ⛔ Restricciones de seguridad — lo que la IA NO puede hacer

Estas reglas son obligatorias y deben demostrarse en la sustentación.

| Restricción | Motivo |
|---|---|
| **No leer `.env`, `.env.local`, `.env.*`** | Contienen claves privadas y credenciales |
| **No leer ni generar archivos de claves** (`serviceAccountKey.json`, `*.pem`, `*.key`) | Seguridad del proyecto |
| **No salir de la carpeta del proyecto** (sin `../` ni rutas absolutas fuera de la raíz) | Aislamiento |
| **No ejecutar comandos con efecto externo** (`vercel deploy`, `git push`, `firebase deploy`, `curl` a APIs externas) sin aprobación explícita del desarrollador | Control de despliegues |
| **No modificar** `package.json` ni `tsconfig.json` sin pedir permiso | Cambios de dependencias pueden romper el proyecto |
| **No agregar dependencias** sin que el desarrollador lo apruebe (`npm install …`) | Control de la cadena de suministro |
| **No tocar `firestore.rules`** sin revisión manual | Regla de Firestore: `allow read, write: if false` |

> Si la IA necesita ver una variable de entorno para entender el código, el desarrollador
> le muestra **solo el nombre** de la variable, nunca el valor.

---

## ✅ Lo que la IA puede hacer sin pedir permiso

- Leer y editar cualquier archivo de código fuente dentro del proyecto.
- Ejecutar `npm run lint`, `npm run test`, `npm run type-check`, `npm run build`.
- Crear, mover o eliminar archivos dentro de `src/`, `app/`, `tests/`, `bruno/`, `ia/`.
- Generar documentación (`openapi.yaml`, `README.md`, `CALIDAD.md`).

---

## Bitácora de IA

Cada sesión de trabajo con la IA queda registrada en `ia/bitacora.md` con:
- Fecha y propósito de la sesión.
- Qué generó o modificó la IA.
- Cómo se validó el resultado (pruebas, revisión manual, lint).
- Decisiones tomadas (aceptar, modificar o rechazar la sugerencia).
