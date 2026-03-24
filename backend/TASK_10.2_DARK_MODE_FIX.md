# Corrección de Modo Oscuro y Responsive - Solicitudes de Gastos

## Problema Identificado
Las cards de solicitudes de gastos en `caja.html` tenían colores hardcodeados en estilos inline que no se adaptaban al modo oscuro, haciendo que los textos fueran ilegibles. Además, el diseño no era completamente responsive en dispositivos móviles.

## Solución Implementada

### 1. Refactorización de HTML
- Eliminados todos los estilos inline con colores hardcodeados
- Reemplazados por clases CSS semánticas
- Estructura HTML simplificada y más mantenible

### 2. Sistema de Clases CSS
Creadas clases específicas para cada estado:
- `.solicitud-card-pendiente` - Fondo gris con opacidad adaptable
- `.solicitud-card-aprobada` - Fondo verde con opacidad adaptable  
- `.solicitud-card-rechazada` - Fondo rojo con opacidad adaptable

### 3. Variables CSS Utilizadas
- `var(--bg-card)` - Fondo de cards (se adapta automáticamente)
- `var(--gris-600)`, `var(--gris-700)`, etc. - Textos que cambian en dark mode
- `var(--success)`, `var(--danger)` - Colores semánticos
- `var(--shadow-sm)`, `var(--shadow-xs)` - Sombras adaptables

### 4. Modo Oscuro
- Backgrounds con mayor opacidad para mejor contraste
- Textos usando variables que invierten en dark mode
- Colores de estado más brillantes para legibilidad

### 5. Responsive Design

#### Tablets (≤1024px)
- Grid cambia a 2 columnas: tiempo + detalles
- Acciones se mueven abajo en fila horizontal

#### Móviles (≤768px)
- Grid de 1 columna
- Time box horizontal con hora a la izquierda
- Detalles en grid de 2 columnas
- Acciones en columna vertical

#### Móviles pequeños (≤480px)
- Detalles en 1 columna
- Time box vertical centrado
- Padding reducido

## Archivos Modificados
- `pages/admin/caja.html`
  - Función `renderSolicitudes()` (línea ~1492)
  - Nuevos estilos CSS (línea ~200-450)

## Resultado
✅ Textos legibles en modo claro y oscuro
✅ Diseño responsive en todos los dispositivos
✅ Código más mantenible con clases CSS
✅ Mejor contraste y accesibilidad
