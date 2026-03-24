# 📅 Sistema de Gestión de Eventos - Florería Encantos Eternos

## 🎯 Descripción General

Sistema 100% frontend para crear, editar y gestionar eventos especiales que se muestran automáticamente en la página principal del sitio web.

## 📁 Archivos Creados

### JavaScript Modular
1. **`js/storage.js`** - Manejo de localStorage
   - Guardar/obtener/actualizar/eliminar eventos
   - Filtrar eventos futuros
   - Validar duplicados por fecha

2. **`js/eventos.js`** - Lógica de negocio
   - Validaciones de datos
   - Cálculo de descuentos
   - Formateo de fechas
   - Generación automática de emojis

3. **`js/ui-eventos.js`** - Renderizado DOM
   - Cards para panel admin
   - Cards para página pública
   - Mensajes de éxito/error

### HTML
4. **`pages/admin/eventos.html`** - Panel administrativo completo
   - Formulario de creación/edición
   - Lista de eventos
   - Selección de productos
   - Preview de imágenes

5. **`index.html`** - Actualizado para usar localStorage

## 🚀 Características Implementadas

### ✅ Panel Administrativo (eventos.html)

#### Formulario de Evento
- ✅ Selector de fecha (solo fechas futuras)
- ✅ Nombre del evento (obligatorio)
- ✅ URL de imagen Cloudinary (con preview)
- ✅ Descripción opcional
- ✅ Precio original y precio con descuento
- ✅ Cálculo automático de descuento en %
- ✅ Selección múltiple de productos del inventario
- ✅ Buscador de productos por nombre
- ✅ Filtro por categoría de productos
- ✅ Contador de productos seleccionados
- ✅ Indicador visual de productos seleccionados

#### Gestión de Eventos
- ✅ Crear nuevo evento
- ✅ Editar evento existente
- ✅ Eliminar evento con confirmación
- ✅ Lista visual de todos los eventos
- ✅ Contador de eventos

#### Validaciones
- ✅ No permite fechas pasadas
- ✅ No permite eventos duplicados en la misma fecha
- ✅ Valida que precio final < precio original
- ✅ Valida URLs de imágenes
- ✅ Requiere al menos un producto seleccionado

### ✅ Página Pública (index.html)

#### Renderizado Automático
- ✅ Carga eventos desde localStorage
- ✅ Muestra solo eventos futuros
- ✅ Ordena por fecha más próxima
- ✅ Cards con diseño atractivo

#### Información Mostrada
- ✅ Imagen del evento
- ✅ Nombre y emoji
- ✅ Fecha formateada
- ✅ Badge de descuento
- ✅ Alerta de urgencia (últimos 7 días)
- ✅ Lista de productos incluidos
- ✅ Precio original tachado
- ✅ Precio final destacado
- ✅ Botón de WhatsApp

### ✅ Persistencia de Datos

#### localStorage
- ✅ Clave: `ee_eventos`
- ✅ Formato JSON estructurado
- ✅ Sin dependencia de backend
- ✅ Preparado para migración futura a API

#### Estructura de Datos
```javascript
{
  id: "1234567890",
  fecha: "2026-05-10",
  nombre: "Día de la Madre",
  imagen: "https://res.cloudinary.com/...",
  descripcion: "Honra a mamá...",
  emoji: "🌹",
  productos: [
    {id: 1, nombre: "Rosas rojas", precio: 85, categoria: "Ramos"}
  ],
  precioOriginal: 150,
  precioFinal: 120,
  activo: true,
  createdAt: 1234567890,
  updatedAt: 1234567890
}
```

## 🎨 Diseño y UX

### Panel Admin
- Interfaz limpia y profesional
- Formulario colapsable
- Preview de imágenes en tiempo real
- Cálculo de descuento en vivo
- Checkboxes visuales para productos
- Badges informativos (días restantes, descuento, productos)

### Página Pública
- Cards tipo ecommerce
- Responsive design
- Jerarquía visual clara
- Alertas de urgencia para eventos próximos
- Integración con WhatsApp

## 📱 Flujo de Uso

### Para la Dueña

1. **Crear Evento**
   - Ir a `pages/admin/eventos.html`
   - Clic en "+ Nuevo evento"
   - Llenar formulario:
     - Seleccionar fecha
     - Escribir nombre
     - Pegar URL de Cloudinary
     - Ingresar precios
     - Seleccionar productos:
       - Usar el buscador 🔍 para encontrar productos por nombre
       - Usar el filtro de categoría para ver solo productos de una categoría
       - Clic en "🔄 Limpiar" para resetear los filtros
       - Marcar checkboxes de los productos deseados
       - Ver contador de productos seleccionados
   - Clic en "Crear evento"

2. **Editar Evento**
   - Clic en botón ✏️ del evento
   - Modificar campos necesarios
   - Clic en "Actualizar evento"

3. **Eliminar Evento**
   - Clic en botón 🗑️ del evento
   - Confirmar eliminación

### Para el Cliente

1. Visitar `index.html`
2. Scroll a sección "Próximos eventos"
3. Ver eventos ordenados por fecha
4. Clic en card o botón WhatsApp
5. Enviar mensaje automático

## 🔧 Funciones Principales

### Storage.js
```javascript
Storage.guardarEventos(eventos)
Storage.obtenerEventos()
Storage.obtenerEventoPorId(id)
Storage.crearEvento(evento)
Storage.actualizarEvento(id, datos)
Storage.eliminarEvento(id)
Storage.obtenerEventosFuturos()
Storage.existeEventoEnFecha(fecha, idExcluir)
```

### Eventos.js
```javascript
Eventos.validar(datos)
Eventos.calcularDescuento(original, final)
Eventos.formatearFecha(fecha)
Eventos.diasRestantes(fecha)
Eventos.obtenerEmoji(nombreEvento)
Eventos.prepararDatos(formData)
```

### UIEventos.js
```javascript
UIEventos.renderizarListaAdmin(eventos, contenedor)
UIEventos.renderizarEventosPublicos(eventos, contenedor)
UIEventos.mostrarExito(mensaje)
UIEventos.mostrarError(mensaje)
```

### Funciones de Búsqueda y Filtrado (eventos.html)
```javascript
filtrarProductos()           // Filtra productos por búsqueda y categoría
limpiarFiltros()            // Resetea todos los filtros
toggleProducto()            // Selecciona/deselecciona un producto
actualizarProductosSeleccionados()  // Actualiza la UI de productos seleccionados
```

## 🔮 Preparado para el Futuro

### Migración a Backend
El código está estructurado para facilitar la migración:

```javascript
// Actual (localStorage)
const eventos = Storage.obtenerEventos();

// Futuro (API)
const eventos = await API.get('/eventos');
```

Solo necesitas:
1. Reemplazar llamadas a `Storage.*` por `API.*`
2. Mantener la misma estructura de datos
3. El resto del código funciona igual

### Extensiones Posibles
- ✅ Agregar campo "activo/inactivo"
- ✅ Filtros por categoría de evento
- ✅ Búsqueda de eventos
- ✅ Duplicar evento
- ✅ Exportar/importar eventos
- ✅ Estadísticas de eventos

## 🎯 Ventajas del Sistema

1. **Sin Backend**: Funciona completamente en el navegador
2. **Instantáneo**: Los cambios se ven inmediatamente
3. **Simple**: No requiere conocimientos técnicos avanzados
4. **Flexible**: Fácil de modificar y extender
5. **Modular**: Código organizado y reutilizable
6. **Responsive**: Funciona en móviles y desktop
7. **Preparado**: Listo para migrar a backend cuando sea necesario

## 📝 Notas Importantes

### Imágenes
- Las imágenes deben subirse a Cloudinary externamente
- Solo se maneja la URL en el sistema
- Se muestra preview antes de guardar
- Fallback a emoji si la imagen falla

### Productos
- Se cargan automáticamente del inventario
- Solo se muestran productos con stock > 0
- Se guardan como copia en el evento (no referencia)
- Permite selección múltiple
- Búsqueda en tiempo real por nombre o categoría
- Filtro por categoría con dropdown dinámico
- Botón para limpiar filtros
- Productos seleccionados se destacan con borde rosa
- Contador muestra cantidad de productos seleccionados

### Fechas
- Solo se permiten fechas futuras
- Se valida al crear y editar
- Eventos pasados no se muestran en index.html
- Formato: YYYY-MM-DD

### Precios
- Precio final debe ser menor al original
- Se calcula descuento automáticamente
- Formato: números con 2 decimales
- Moneda: Soles peruanos (S/)

## 🐛 Solución de Problemas

### No se muestran eventos en index.html
- Verificar que hay eventos creados en el panel admin
- Verificar que las fechas son futuras
- Abrir consola del navegador (F12) y buscar errores

### No se guardan los eventos
- Verificar que localStorage está habilitado
- Verificar que el navegador no está en modo incógnito
- Limpiar caché y recargar

### Las imágenes no se muestran
- Verificar que la URL de Cloudinary es correcta
- Verificar que la imagen es pública
- El sistema muestra emoji como fallback

## 📞 Soporte

Para dudas o problemas:
1. Revisar este documento
2. Verificar la consola del navegador (F12)
3. Contactar al desarrollador

---

**Sistema creado para Florería Encantos Eternos** 🌸
**Versión 1.0 - 2026**
