# 🌸 Florería Encantos Eternos - Resumen del Proyecto

## 📋 Descripción General

Sistema completo de gestión para florería ubicada en Sicuani, Cusco, Perú. Incluye sitio web público con catálogo de productos y panel administrativo para gestión interna.

**Ubicación**: Sicuani, Cusco, Perú  
**Nombre**: Encantos Eternos  
**Contacto**: WhatsApp +51 972 542 802

---

## 🎨 Características del Diseño

### Paleta de Colores
- **Tema dominante**: Rosa (toda la página)
- **Colores principales**: 
  - Rosa claro: `#FFF5F9`
  - Rosa oscuro: `#D4186A`
  - Rosa suave: `#FFE8F3`
- **Gradientes**: Tonos rosa/morado en toda la interfaz
- **Modo oscuro**: Disponible con tonos rosados adaptados

### Interfaz Pública
- Diseño responsive (móvil y escritorio)
- Animaciones suaves y efectos visuales
- Composición floral animada en hero
- Chips de categorías con iconos
- Cards de productos con efecto shimmer
- Badges de stock vibrantes
- Botones premium con efectos hover

---

## 🌐 Sitio Web Público (index.html)

### Secciones Principales

#### 1. Hero / Portada
- Título principal con gradiente rosa
- Descripción de la florería
- Botones de acción (Ver catálogo, Diseña tu arreglo)
- Composición floral animada con CSS puro
- Estadísticas en tiempo real
- Efecto de click con flores explosivas

#### 2. Catálogo de Productos
- **Filtros por categoría**: Todos, Ramos, Arreglos, Peluches, Cajas sorpresa, Globos
- **Chips animados** con iconos y efectos hover
- **Cards de productos** con:
  - Imagen/emoji del producto
  - Nombre y descripción
  - Precio con gradiente
  - Badge de stock (Disponible ✓ / Quedan pocos ⚠ / Agotado 🚫)
  - Botón "Pedir por WhatsApp"
- **Paginación** con botones animados
- **Publicación controlada**: Solo muestra productos marcados como "publicado" desde el admin
- **Actualización automática**: Polling cada 10 segundos

#### 3. Laboratorio de Flores
- **Creador de arreglos personalizados**
- **Filtros por tipo**: Todos, Flores, Materiales, Accesorios
- **Badges de stock en tiempo real**:
  - ✓ Disponible (verde) - 20+ unidades
  - ⚠ Quedan pocos (amarillo) - 10-19 unidades
  - ⚠ Últimos (naranja) - 1-9 unidades
  - ✗ Agotado (rojo) - 0 unidades
- **Selector de cantidad** con botones +/-
- **Resumen en tiempo real** con:
  - Lista de items seleccionados
  - Precio estimado con margen
  - Botón para pedir por WhatsApp
  - Botón para limpiar selección
- **Integración con inventario** del backend

#### 4. Promociones y Eventos
- Cards de promociones activas
- Descuentos especiales
- Fechas de vigencia
- Promociones doradas destacadas

#### 5. Métodos de Pago
- Efectivo
- Yape
- Plin
- Transferencia bancaria
- Tarjetas

#### 6. Contacto
- Información de ubicación
- Horarios de atención
- Redes sociales
- Botón flotante de WhatsApp

#### 7. Footer
- Enlaces rápidos
- Información de la empresa
- Copyright

---

## 🔐 Panel Administrativo

### Módulos Disponibles

#### 1. Dashboard
- Estadísticas en tiempo real
- Ventas del día/mes
- Productos más vendidos
- Gráficos de rendimiento
- Estado de caja
- Alertas de stock bajo

#### 2. Productos
- CRUD completo de productos
- Campos: nombre, descripción, categoría, precio, costo, stock
- **Columna "Publicado"**: Control de visibilidad en sitio público
  - Botón toggle visual (👁 Visible / 🚫 Oculto)
  - Actualización en tiempo real
- Cálculo automático de margen de ganancia
- Filtros y búsqueda

#### 3. Inventario
- Gestión de flores y materiales
- Control de stock
- Tipos: flores, materiales, accesorios
- Alertas de stock bajo
- Historial de movimientos

#### 4. Ventas
- Registro de ventas
- Selección de productos
- Cálculo automático de totales
- Métodos de pago
- Impresión de tickets
- Historial completo

#### 5. Pedidos
- Gestión de pedidos de clientes
- Estados: pendiente, en proceso, completado, cancelado
- Fechas de entrega
- Notas especiales
- Seguimiento completo

#### 6. Clientes
- Base de datos de clientes
- Información de contacto
- Historial de compras
- Preferencias

#### 7. Trabajadores
- Gestión de empleados
- Roles: admin, empleado, dueña
- Permisos diferenciados
- Horarios y turnos

#### 8. Gastos
- Registro de gastos operativos
- Categorías de gastos
- Reportes mensuales
- Control de egresos

#### 9. Caja
- Apertura y cierre de caja
- Movimientos diarios
- Arqueo de caja
- Reportes de efectivo

#### 10. Arreglos
- Catálogo de arreglos predefinidos
- Recetas con inventario
- Costos y precios
- Imágenes

#### 11. Promociones
- Creación de promociones
- Descuentos y ofertas
- Fechas de vigencia
- Promociones especiales

#### 12. Eventos
- Calendario de eventos
- Fechas especiales
- Planificación de inventario

#### 13. Reportes
- Reportes de ventas
- Reportes de gastos
- Reportes de inventario
- Reportes de caja
- Exportación a Excel/PDF

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica
- **CSS3**: 
  - Variables CSS personalizadas
  - Flexbox y Grid
  - Animaciones y transiciones
  - Modo oscuro
  - Diseño responsive
- **JavaScript Vanilla**: 
  - Fetch API para comunicación con backend
  - Manipulación del DOM
  - Eventos y listeners
  - LocalStorage para sesiones
- **Fuentes**: 
  - Playfair Display (títulos)
  - Poppins (textos)

### Backend
- **Node.js 18+**
- **Express.js 4.x**: Framework web
- **PostgreSQL 14+**: Base de datos
- **JWT**: Autenticación
- **bcryptjs**: Hash de contraseñas
- **helmet**: Seguridad HTTP
- **cors**: Cross-Origin Resource Sharing
- **morgan**: Logging de requests

### Base de Datos
- **PostgreSQL** con 13 tablas normalizadas
- **Relaciones**: Foreign keys y constraints
- **Índices**: Para optimización de consultas
- **Triggers**: Actualizaciones automáticas
- **Views**: Consultas comunes

---

## 📊 Estructura de la Base de Datos

### Tablas Principales

1. **usuarios** - Trabajadores del sistema
2. **productos** - Catálogo de productos (con campo `publicado`)
3. **inventario** - Flores y materiales
4. **clientes** - Base de datos de clientes
5. **pedidos** - Pedidos de clientes
6. **ventas** - Transacciones de venta
7. **ventas_productos** - Detalle de ventas
8. **gastos** - Gastos operativos
9. **caja** - Movimientos de caja diarios
10. **arreglos** - Arreglos predefinidos
11. **arreglos_inventario** - Recetas de arreglos
12. **promociones** - Promociones activas
13. **eventos** - Eventos especiales

---

## 🔌 API Backend

### Endpoints Principales

#### Autenticación
```
POST   /api/auth/login          # Iniciar sesión
GET    /api/auth/me             # Usuario actual
POST   /api/auth/logout         # Cerrar sesión
```

#### Módulos Core
```
GET    /api/dashboard           # Estadísticas
GET    /api/productos           # Listar productos
POST   /api/productos           # Crear producto
PUT    /api/productos/:id       # Actualizar producto (incluye campo publicado)
DELETE /api/productos/:id       # Eliminar producto

GET    /api/inventario          # Listar inventario
POST   /api/inventario          # Agregar item
PUT    /api/inventario/:id      # Actualizar item
DELETE /api/inventario/:id      # Eliminar item

GET    /api/ventas              # Listar ventas
POST   /api/ventas              # Registrar venta
GET    /api/ventas/:id          # Detalle de venta

GET    /api/pedidos             # Listar pedidos
POST   /api/pedidos             # Crear pedido
PUT    /api/pedidos/:id         # Actualizar pedido
DELETE /api/pedidos/:id         # Cancelar pedido

GET    /api/clientes            # Listar clientes
POST   /api/clientes            # Crear cliente
PUT    /api/clientes/:id        # Actualizar cliente
DELETE /api/clientes/:id        # Eliminar cliente

GET    /api/trabajadores        # Listar trabajadores
POST   /api/trabajadores        # Crear trabajador
PUT    /api/trabajadores/:id    # Actualizar trabajador
DELETE /api/trabajadores/:id    # Eliminar trabajador

GET    /api/gastos              # Listar gastos
POST   /api/gastos              # Registrar gasto
PUT    /api/gastos/:id          # Actualizar gasto
DELETE /api/gastos/:id          # Eliminar gasto

GET    /api/caja                # Estado de caja
POST   /api/caja/abrir          # Abrir caja
POST   /api/caja/cerrar         # Cerrar caja

GET    /api/reportes/ventas     # Reporte de ventas
GET    /api/reportes/gastos     # Reporte de gastos
GET    /api/reportes/inventario # Reporte de inventario

GET    /api/arreglos            # Listar arreglos
GET    /api/promociones         # Listar promociones
GET    /api/eventos             # Listar eventos
```

---

## 🔐 Credenciales de Prueba

| Email | Contraseña | Rol | Acceso |
|-------|-----------|-----|--------|
| admin@encantoseternos.com | admin123 | admin | Acceso completo |
| maria@floreria.com | password123 | admin | Acceso completo |
| ana@floreria.com | password123 | empleado | Ventas y pedidos |
| patricia@floreria.com | password123 | duena | Reportes y análisis |

---

## 🚀 Instalación y Ejecución

### 1. Requisitos Previos
- Node.js 18+
- PostgreSQL 14+
- Git

### 2. Clonar Repositorio
```bash
git clone https://github.com/joser1624/FLORR-.git
cd FLORR-
```

### 3. Configurar Base de Datos
```bash
# Crear base de datos
createdb floreria_system_core

# Ejecutar schema
psql -d floreria_system_core -f schema.sql

# Cargar datos de prueba
psql -d floreria_system_core -f seed.sql
```

### 4. Configurar Backend
```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales
DB_NAME=floreria_system_core
DB_USER=postgres
DB_PASSWORD=betojose243
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=tu-secreto-seguro
PORT=3000
```

### 5. Ejecutar Migración de Publicado
```bash
# Agregar columna publicado a productos
node src/scripts/add-publicado-column.js
```

### 6. Iniciar Backend
```bash
npm run dev
# Servidor en http://localhost:3000
```

### 7. Iniciar Frontend
```bash
# Opción 1: Python
python -m http.server 5500

# Opción 2: Node.js
npx http-server -p 5500

# Opción 3: VS Code Live Server
# Click derecho en index.html → Open with Live Server
```

### 8. Acceder al Sistema
- **Sitio público**: http://localhost:5500/index.html
- **Panel admin**: http://localhost:5500/pages/admin/login.html

---

## ✨ Características Destacadas

### Funcionalidades Únicas

1. **Control de Publicación**
   - Los productos pueden estar ocultos en el admin pero no publicados en el sitio público
   - Toggle visual para publicar/ocultar productos
   - Actualización en tiempo real sin recargar

2. **Laboratorio de Flores**
   - Creador interactivo de arreglos personalizados
   - Cálculo automático de precios con margen
   - Integración directa con WhatsApp
   - Filtros por tipo de producto
   - Badges de stock en tiempo real

3. **Diseño Rosa Dominante**
   - Toda la interfaz usa paleta rosa
   - Modo oscuro con tonos rosados
   - Animaciones suaves y elegantes
   - Efectos visuales modernos

4. **Integración WhatsApp**
   - Botón flotante en todas las páginas
   - Mensajes pre-formateados con detalles del producto
   - Envío directo desde el laboratorio de flores

5. **Responsive Completo**
   - Adaptado para móviles y tablets
   - Carrusel de productos en móvil
   - Navegación hamburguesa
   - Touch-friendly

6. **Animaciones CSS Puras**
   - Composición floral animada en hero
   - Flores orbitando y flotando
   - Efecto de explosión al hacer click
   - Shimmer en cards de productos

---

## 📈 Flujo de Trabajo

### Para el Cliente (Sitio Público)
1. Visita index.html
2. Navega por el catálogo de productos
3. Filtra por categoría
4. Ve productos disponibles (solo publicados)
5. Opción A: Pide un producto existente por WhatsApp
6. Opción B: Crea un arreglo personalizado en el laboratorio
7. Envía pedido por WhatsApp

### Para el Administrador
1. Login en panel admin
2. Ve dashboard con estadísticas
3. Gestiona productos (crear, editar, publicar/ocultar)
4. Controla inventario
5. Registra ventas
6. Gestiona pedidos
7. Controla caja
8. Genera reportes

### Para el Empleado
1. Login en panel admin
2. Acceso limitado a:
   - Ventas
   - Pedidos
   - Clientes
   - Inventario (solo lectura)

---

## 🔄 Actualizaciones Recientes

### Versión Actual (Rama: prueba3)

#### Mejoras Visuales
- ✅ Paleta rosa completa en toda la página
- ✅ Modo responsive mejorado
- ✅ Composición floral animada en hero
- ✅ Sección de productos rediseñada con efectos premium
- ✅ Contraste mejorado en modo oscuro

#### Funcionalidades
- ✅ Columna "publicado" en productos
- ✅ Control de visibilidad de productos en sitio público
- ✅ Filtrador por tipo en laboratorio de flores
- ✅ Badges de stock en tiempo real
- ✅ Actualización automática del catálogo

#### Correcciones
- ✅ Fix error costo.toFixed en laboratorio
- ✅ Fix sincronización de estado publicado
- ✅ Fix contraste de textos en modo oscuro

---

## 📝 Notas Importantes

### Configuración de Base de Datos
- **Nombre**: floreria_system_core
- **Usuario**: postgres
- **Contraseña**: betojose243
- **Puerto**: 5432

### Números de Contacto
- **WhatsApp**: +51 972 542 802

### Git
- **Rama principal**: main
- **Rama de desarrollo**: prueba3
- **NO hacer commit automático** (solo cuando el usuario lo indique)

### Backend
- No modificar a menos que sea necesario
- Usar endpoints existentes
- Validar datos antes de enviar

---

## 🎯 Próximas Mejoras Sugeridas

- [ ] Subida de imágenes reales para productos
- [ ] Integración con API de WhatsApp Business
- [ ] Notificaciones por email
- [ ] Generación de PDFs para reportes
- [ ] Sistema de cupones de descuento
- [ ] Programa de fidelización de clientes
- [ ] App móvil nativa
- [ ] Integración con pasarelas de pago
- [ ] Sistema de reservas online
- [ ] Chat en vivo

---

## 📞 Soporte

Para dudas o problemas:
1. Revisar documentación en carpeta `docs/`
2. Verificar logs del backend
3. Revisar consola del navegador
4. Contactar al equipo de desarrollo

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados  
© 2026 Florería Encantos Eternos

---

**Desarrollado con ❤️ para Florería Encantos Eternos**  
**Sicuani, Cusco, Perú 🇵🇪**

**Versión**: 1.0.0  
**Última actualización**: Marzo 2026  
**Estado**: ✅ Producción
