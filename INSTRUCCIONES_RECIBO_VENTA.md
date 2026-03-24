# 🧾 Instrucciones para Probar el Recibo de Venta

## 🎯 Objetivo

El recibo de venta debe imprimirse en formato de ticket de supermercado (80mm de ancho), mostrando:
- Logo y datos de la empresa
- Información de la venta (número, fecha, hora)
- Lista de productos con cantidades y precios
- Total y método de pago
- Mensaje de agradecimiento

## 🧪 Cómo Probar

### Paso 1: Registrar una Venta

1. Ve a la página de **Ventas**
2. Haz clic en **"+ Nueva venta"**
3. Agrega productos a la venta
4. Selecciona método de pago
5. Haz clic en **"Registrar venta"**

### Paso 2: Generar el Recibo

1. En la tabla de ventas, busca la venta que acabas de crear
2. Haz clic en el botón **🖨️** (imprimir) en la columna de acciones
3. **Deberías ver:**
   - Un modal con la vista previa del recibo
   - El recibo con formato de ticket (80mm de ancho)
   - Todos los datos de la venta

### Paso 3: Imprimir el Recibo

1. En el modal del recibo, haz clic en **"🖨️ Imprimir"**
2. **Deberías ver:**
   - El diálogo de impresión del navegador
   - Solo el recibo visible (sin menús ni otros elementos)
   - Formato de 80mm de ancho

### Paso 4: Verificar en la Consola

Abre las DevTools (F12) y ve a la pestaña **Console**. Deberías ver:

```
🧾 Generando recibo para venta ID: 123
✅ Datos de venta cargados: {id: 123, ...}
📝 HTML del recibo generado (primeros 200 chars): <div class="recibo-container">...
✅ Recibo insertado en preview
✅ Recibo insertado en contenedor de impresión
Contenedor de impresión: <div id="recibo-print">...</div>
```

Cuando hagas clic en "Imprimir":
```
📄 Imprimiendo recibo...
Contenido del recibo: <div class="recibo-container">...
```

## 🎨 Formato del Recibo

El recibo debe verse así:

```
┌────────────────────────────────┐
│            🌸                  │
│      ENCANTOS ETERNOS          │
│      Florería y Regalos        │
│    Jr. Ejemplo 123, Lima       │
│      Tel: (01) 234-5678        │
├────────────────────────────────┤
│ Recibo: #000123                │
│ Fecha: 23/03/2026              │
│ Hora: 14:30                    │
│ Atendió: María García          │
├────────────────────────────────┤
│ PRODUCTOS                      │
│                                │
│ Rosas Rojas                    │
│   12 x S/ 5.00      S/ 60.00   │
│                                │
│ Girasoles                      │
│   6 x S/ 4.50       S/ 27.00   │
├────────────────────────────────┤
│ Subtotal:           S/ 87.00   │
│ Método de pago: Efectivo       │
├────────────────────────────────┤
│ TOTAL:              S/ 87.00   │
├────────────────────────────────┤
│   ¡Gracias por su compra!      │
│        Vuelva pronto           │
│                                │
│    WhatsApp: 987 654 321       │
│  www.encantoseternos.com       │
└────────────────────────────────┘
```

## ❌ Problemas Comunes

### Problema 1: No se muestra nada al imprimir

**Solución:**
1. Abre la consola (F12)
2. Busca errores en rojo
3. Verifica que veas los logs de "✅ Recibo insertado"
4. Si no ves los logs, comparte el error

### Problema 2: Se imprime toda la página

**Solución:**
- Los estilos `@media print` deberían ocultar todo excepto el recibo
- Verifica que el archivo `ventas.html` tenga los estilos actualizados
- Intenta hacer Ctrl+F5 para limpiar caché

### Problema 3: El recibo se ve muy grande

**Solución:**
- En el diálogo de impresión, selecciona:
  - Tamaño de papel: "80mm" o "Custom"
  - Orientación: Vertical
  - Márgenes: Ninguno
- O guarda como PDF y ajusta el tamaño

### Problema 4: Faltan productos o datos

**Solución:**
- Verifica en la consola que los datos de la venta se cargaron correctamente
- Busca el log: "✅ Datos de venta cargados"
- Verifica que la venta tenga productos asociados

## 🔍 Depuración Avanzada

Si el recibo no se muestra, ejecuta esto en la consola del navegador:

```javascript
// Verificar que el contenedor existe
console.log('Contenedor preview:', document.getElementById('recibo-preview'));
console.log('Contenedor print:', document.getElementById('recibo-print'));

// Ver el contenido
console.log('Contenido preview:', document.getElementById('recibo-preview').innerHTML);
console.log('Contenido print:', document.getElementById('recibo-print').innerHTML);

// Verificar estilos
const printEl = document.getElementById('recibo-print');
console.log('Display:', window.getComputedStyle(printEl).display);
console.log('Visibility:', window.getComputedStyle(printEl).visibility);
```

## 📱 Impresión en Impresora Térmica

Si tienes una impresora térmica de 80mm:

1. Configura la impresora en Windows
2. En el diálogo de impresión, selecciona tu impresora térmica
3. Ajusta el tamaño de papel a 80mm
4. Imprime

El recibo debería salir perfectamente formateado.

## 💾 Guardar como PDF

Si quieres guardar el recibo como PDF:

1. Haz clic en "🖨️ Imprimir"
2. En el diálogo de impresión, selecciona "Guardar como PDF"
3. Ajusta el tamaño de página a "Custom: 80mm x auto"
4. Guarda el archivo

## 🎨 Personalización

Para personalizar el recibo, edita la función `crearReciboHTML()` en `ventas.html`:

- **Logo:** Cambia el emoji 🌸 por tu logo
- **Datos de empresa:** Actualiza dirección, teléfono, etc.
- **Colores:** Modifica los estilos CSS en la sección `<style>`
- **Formato:** Ajusta el ancho, fuente, espaciado, etc.

---

**¿Necesitas ayuda?** Comparte lo que ves en la consola del navegador (F12 → Console).
