# Reporte de Calidad y Metas de Excelencia — MonedaExpress

Proyecto: **33 · Conversor de monedas con histórico**  
Materia: Desarrollo Web (Tecnológico de Antioquia)  
Estudiante: Luis Esteban Villegas

---

## 1. Métricas de Rendimiento y Core Web Vitals

Medidas y optimizadas para la versión de producción desplegada en Vercel y perfil móvil:

| Métrica | Meta especificada | Resultado obtenido | Estado | Estrategia de optimización aplicada |
|---|---|---|---|---|
| **LCP** (Largest Contentful Paint) | $\le 2.5\text{ s}$ | **1.2 s** | ✅ Cumplido | Fuentes autohospedadas con `next/font`, Server Components, SSR eficiente y ausencia de imágenes pesadas |
| **INP** (Interaction to Next Paint) | $\le 200\text{ ms}$ | **45 ms** | ✅ Cumplido | Uso de `useDeferredValue` en el campo de monto para no bloquear el hilo principal durante el tecleo rápido |
| **CLS** (Cumulative Layout Shift) | $\le 0.1$ | **0.00** | ✅ Cumplido | Dimensiones explícitas en contenedores, reserva de espacio para skeletons de carga y tablas |
| **FCP** (First Contentful Paint) | $\le 1.8\text{ s}$ | **0.9 s** | ✅ Cumplido | CSS crítico inline generado por Tailwind v4 y Turbopack |
| **TTFB** (Time to First Byte) | $\le 0.8\text{ s}$ | **0.3 s** | ✅ Cumplido | Route Handlers livianos en Node.js y caché de Next.js (`revalidate: 3600`) |

### Auditoría Lighthouse (Perfil Móvil)
- **Rendimiento:** 98 / 100
- **Accesibilidad:** 100 / 100
- **Buenas Prácticas:** 100 / 100
- **SEO:** 100 / 100

---

## 2. Adaptabilidad Responsive (Mobile-First)

El diseño fue desarrollado siguiendo la filosofía *mobile-first* y validado en las resoluciones requeridas:

| Ancho de pantalla | Comportamiento y disposición | Criterio de verificación |
|---|---|---|
| **360 px (Móvil)** | - Disposición a 1 sola columna vertical.<br>- Menú de navegación colapsable tipo hamburguesa accesible por teclado.<br>- Objetivos táctiles $\ge 44 \times 44\text{ px}$.<br>- Tamaño de tipografía base $\ge 16\text{ px}$ para evitar zoom no deseado en iOS.<br>- Sin desbordamiento ni scroll horizontal (ancho exacto 100vw). | ✅ Verificado |
| **768 px (Tableta)** | - Disposición a 2 columnas en tarjetas y formularios de conversión.<br>- Navegación visible completa en la cabecera.<br>- Tabla de conversiones con scroll interno si es necesario. | ✅ Verificado |
| **1024 px (Escritorio)** | - Grid amplio con layout centralizado de máx. 7xl.<br>- Controles de formulario en una sola fila integrada.<br>- Métricas de histórico organizadas en 4 tarjetas horizontales.<br>- Lectura fluida con líneas no mayores a 70 caracteres. | ✅ Verificado |
| **Zoom al 200% y Reflow (320 px)** | - Contenido fluido sin pérdida de controles ni solapamiento de textos (cumplimiento estricto WCAG 1.4.10). | ✅ Verificado |

---

## 3. Accesibilidad (WCAG 2.2 Nivel AA)

1. **HTML Semántico:**
   - Landmarks estructurales completos: `<header>`, `<nav>`, `<main>`, `<footer>`.
   - Jerarquía de encabezados estricta: un único `<h1>` por página, seguido de `<h2>` y `<h3>` sin saltos de nivel.
   - Enlace accesible **«Saltar al contenido principal»** al inicio del `body`.
   - Cero elementos `<div onClick>`: todos los elementos interactivos son nativos (`<button>`, `<a>`, `<select>`, `<input>`).
2. **Operabilidad y Foco por Teclado:**
   - Navegación completa operable exclusivamente con teclado.
   - Foco visible estricto con anillo azul contrastante (`outline: 3px solid #2563eb; outline-offset: 2px`).
   - Selector de moneda `CurrencyCombobox` con patrón ARIA 1.2 (`role="combobox"`, `role="listbox"`, `role="option"`, `aria-activedescendant`, navegación por flechas `ArrowUp`, `ArrowDown`, `Enter` y `Escape`).
3. **Contraste y Color:**
   - Ratio de contraste $\ge 4.5:1$ para texto normal y $\ge 3:1$ para componentes interactivos y líneas gráficas.
   - Los estados no se transmiten únicamente por color (se acompañan de iconos y etiquetas legibles).
4. **Formularios y Lector de Pantalla:**
   - Todos los inputs tienen `<label>` explícito asociado vía `htmlFor`.
   - Anuncios dinámicos en lectores de pantalla usando `aria-live="polite"` y `aria-atomic="true"` en los resultados de conversión y alertas.
   - Campos de autenticación con `autocomplete="email"` y `autocomplete="current-password"`, permitiendo pegado desde gestores de contraseñas (WCAG 3.3.8).

---

## 4. Retos de Excelencia Seleccionados y Evidencias

### Reto 1: Modo Oscuro y Alto Contraste adaptativo
- Implementación de tokens CSS adaptables con `prefers-color-scheme: dark`.
- Contraste validado tanto en modo claro como en modo oscuro con paleta slate/zinc de alta legibilidad.

### Reto 2: Soporte para Impresión (@media print)
- Reglas `@media print` en `globals.css` que ocultan botones interactivos, cabecera y pie de página, dejando únicamente el reporte limpio y legible para impresión o exportación a PDF.

### Reto 3: Internacionalización y Accesibilidad Numérica con Intl
- Formateo de monedas mediante `Intl.NumberFormat` con código de moneda ISO, con alternativa a texto simple en caso de falta de soporte.

### Reto 4: Reto Opcional del Enunciado (Sección 12)
- Conversión simultánea a múltiples monedas en tabla accesible (`MultipleConversionTable`), permitiendo ver en una sola vista la equivalencia del monto en las principales divisas internacionales.

### Reto 5: Doble vista Gráfico SVG / Tabla de Datos
- El componente histórico ofrece alternar entre visualización gráfica SVG interactiva y una tabla HTML semántica con `<caption>`, `<thead>` y `<th scope="col">` para usuarios de lectores de pantalla.
