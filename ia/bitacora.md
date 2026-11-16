# Bitácora de IA — Conversor de Monedas

Registro de cada sesión en que se usó un asistente de IA en este proyecto.
Columnas: **Propósito** (qué se le pidió), **Evidencia** (qué produjo),
**Validación** (cómo se comprobó), **Decisión** (aceptar / modificar / rechazar).

---

## Formato de entrada

```
### 2026-11-16 — <título corto de la sesión>

**Propósito:** …
**Herramienta:** Claude Code / Claude.ai / otra
**Generó / modificó:** lista de archivos o fragmentos
**Validación:** npm run lint · npm run test · revisión manual · otra
**Decisión:** aceptado / modificado (qué se cambió) / rechazado (por qué)
**Notas:** observaciones adicionales
```

---

## Sesiones

### 2026-11-16 — Configuración inicial de IA (primer commit)

**Propósito:** Diseñar y versionar la configuración de IA del proyecto antes
de escribir código (requisito sección 15 del enunciado).
**Herramienta:** Claude.ai
**Generó / modificó:**

- `CLAUDE.md` — reglas del proyecto, restricciones de seguridad, calidad del código
- `ia/bitacora.md` — este archivo
- `ia/pruebas-restricciones.md` — plan de evidencias de las restricciones
  **Validación:** revisión manual del contenido contra la sección 15 del enunciado.
  **Decisión:** aceptado con ajustes menores (actualizar fecha, nombre del repositorio).
  **Notas:** primera entrada; no se generó código fuente todavía.
