# Integración Backend: Trabajadores

## ✅ Estado Actual

La sección `trabajadores.html` ahora está completamente integrada con el backend.

## 🔄 Cambios Realizados

### 1. Carga de Datos desde Backend

**Antes:**
```javascript
// Usaba datos mock hardcodeados
trabajadores = [
  { id:1, nombre:'Ana López', ... },
  { id:2, nombre:'María Quispe', ... }
];
```

**Ahora:**
```javascript
// Carga desde el backend
const response = await API.get('/trabajadores');
trabajadores = response.data || response;
```

### 2. Guardar Trabajador

**Antes:**
```javascript
// Agregaba al array local sin guardar en BD
trabajadores.push({ id: Date.now(), ...payload });
```

**Ahora:**
```javascript
// Guarda en el backend y recarga
await API.post('/trabajadores', payload);
await cargarTrabajadores(); // Recarga desde BD
```

### 3. Eliminar Trabajador (Nuevo)

**Antes:**
- No existía la funcionalidad

**Ahora:**
```javascript
// Desactiva el trabajador (soft delete)
await API.delete('/trabajadores/' + id);
await cargarTrabajadores(); // Recarga desde BD
```

### 4. Validaciones Mejoradas

**Agregadas:**
- ✅ Nombre obligatorio
- ✅ Email obligatorio
- ✅ Contraseña mínimo 6 caracteres
- ✅ Mensajes de error específicos

### 5. Interfaz Mejorada

**Cambios:**
- Muestra email del trabajador
- Badges de rol con colores (Admin, Empleado, Dueña)
- Botón "Desactivar" en lugar de "Editar"
- Filtra trabajadores inactivos (no los muestra)

## 📋 Endpoints Utilizados

### GET /api/trabajadores
```javascript
// Obtener todos los trabajadores activos
const response = await API.get('/trabajadores');

// Respuesta:
{
  success: true,
  data: [
    {
      id: 37,
      nombre: "Administrador",
      email: "admin@encantoseternos.com",
      telefono: "999999999",
      cargo: "Administrador",
      rol: "admin",
      fecha_ingreso: "2026-03-18",
      activo: true,
      created_at: "2026-03-18T...",
      updated_at: "2026-03-18T..."
    },
    ...
  ]
}
```

### POST /api/trabajadores
```javascript
// Crear nuevo trabajador
await API.post('/trabajadores', {
  nombre: "Juan Pérez",
  email: "juan@encantoseternos.com",
  password: "123456",
  telefono: "987654321",
  cargo: "Vendedor/a",
  rol: "empleado",
  fecha_ingreso: "2026-03-18"
});

// Respuesta:
{
  success: true,
  data: {
    id: 38,
    nombre: "Juan Pérez",
    ...
  }
}
```

### DELETE /api/trabajadores/:id
```javascript
// Desactivar trabajador (soft delete)
await API.delete('/trabajadores/38');

// Respuesta:
{
  success: true,
  message: "Trabajador desactivado correctamente"
}
```

## 🎨 Interfaz

### Card de Trabajador

```
┌─────────────────────────────────────────┐
│  [JP]  Juan Pérez                       │
│        [Vendedor/a]                     │
│                                         │
│  ✉️ juan@encantoseternos.com           │
│  📱 987 654 321                         │
│  📅 Desde 18 mar 2026                   │
│  🔑 Rol: [Empleado]                     │
│                                         │
│  [        Desactivar        ]           │
└─────────────────────────────────────────┘
```

### Modal Nuevo Trabajador

```
┌─────────────────────────────────────────┐
│ Nuevo trabajador                    [×] │
├─────────────────────────────────────────┤
│                                         │
│ Nombre completo: *                      │
│ [Juan Pérez                        ]   │
│                                         │
│ Teléfono:                               │
│ [987654321                         ]   │
│                                         │
│ Cargo: *          Fecha de ingreso:     │
│ [Vendedor/a ▼]    [2026-03-18]         │
│                                         │
│ Correo electrónico:                     │
│ [juan@encantoseternos.com          ]   │
│                                         │
│ Contraseña del sistema:                 │
│ [••••••                            ]   │
│                                         │
│ Rol en el sistema:                      │
│ [Empleado ▼]                           │
│                                         │
├─────────────────────────────────────────┤
│                    [Cancelar] [Guardar] │
└─────────────────────────────────────────┘
```

## 🔐 Roles Disponibles

### Admin
- Color: Verde
- Permisos: Acceso completo al sistema
- Puede: Gestionar trabajadores, ver reportes, configurar sistema

### Empleado
- Color: Azul
- Permisos: Operaciones diarias
- Puede: Registrar ventas, pedidos, gastos

### Dueña
- Color: Rosa
- Permisos: Reportes y estadísticas
- Puede: Ver reportes, dashboard, capital

## ✅ Validaciones

### Frontend
- ✅ Nombre no vacío
- ✅ Email no vacío
- ✅ Contraseña mínimo 6 caracteres
- ✅ Mensajes de error claros

### Backend
- ✅ Nombre requerido (string)
- ✅ Email válido (formato email)
- ✅ Contraseña mínimo 6 caracteres
- ✅ Rol válido (admin, empleado, duena)
- ✅ Teléfono opcional (formato válido)
- ✅ Fecha de ingreso opcional (formato ISO)

## 🔄 Flujo Completo

### Crear Trabajador

```
1. Usuario: Click en "+ Nuevo trabajador"
2. Frontend: Abre modal
3. Usuario: Llena formulario
4. Usuario: Click en "Guardar"
5. Frontend: Valida datos
6. Frontend: POST /api/trabajadores
7. Backend: Valida datos
8. Backend: Hash de contraseña (bcrypt)
9. Backend: INSERT en tabla usuarios
10. Backend: Retorna trabajador creado
11. Frontend: Muestra toast de éxito
12. Frontend: Recarga lista desde backend
13. Frontend: Muestra nuevo trabajador
```

### Desactivar Trabajador

```
1. Usuario: Click en "Desactivar"
2. Frontend: Muestra confirmación
3. Usuario: Confirma
4. Frontend: DELETE /api/trabajadores/:id
5. Backend: UPDATE usuarios SET activo = false
6. Backend: Retorna éxito
7. Frontend: Muestra toast de éxito
8. Frontend: Recarga lista desde backend
9. Frontend: Trabajador ya no aparece (filtrado)
```

## 📊 Datos Mostrados

### Por Trabajador
- ✅ Nombre completo
- ✅ Cargo (badge con color)
- ✅ Email
- ✅ Teléfono (formateado)
- ✅ Fecha de ingreso (formateada)
- ✅ Rol del sistema (badge con color)
- ✅ Avatar con iniciales

### Filtros
- ✅ Solo muestra trabajadores activos
- ✅ Oculta trabajadores desactivados

## 🐛 Manejo de Errores

### Sin Conexión al Backend
```javascript
catch (error) {
  console.error('Error al cargar trabajadores:', error);
  Toast.error('No se pudieron cargar los trabajadores');
  trabajadores = [];
}
```

### Error al Guardar
```javascript
catch (error) {
  console.error('Error al guardar trabajador:', error);
  Toast.error(error.message || 'Error al guardar el trabajador');
}
```

### Error al Eliminar
```javascript
catch (error) {
  console.error('Error al eliminar trabajador:', error);
  Toast.error(error.message || 'Error al desactivar el trabajador');
}
```

## 🔒 Seguridad

### Autenticación
- ✅ Todas las rutas requieren token JWT
- ✅ Solo administradores pueden acceder

### Autorización
- ✅ Solo rol 'admin' puede gestionar trabajadores
- ✅ Verificado en el backend (middleware)

### Contraseñas
- ✅ Hash con bcrypt (10 salt rounds)
- ✅ Nunca se retorna la contraseña
- ✅ Mínimo 6 caracteres

## 📝 Notas Importantes

1. **Soft Delete**: Los trabajadores no se eliminan, solo se desactivan (`activo = false`)
2. **Email Único**: El backend valida que el email no esté duplicado
3. **Contraseña**: Se requiere al crear, no se puede editar después (por ahora)
4. **Rol por Defecto**: Si no se especifica, es 'empleado'
5. **Fecha de Ingreso**: Opcional, se puede dejar vacía

## 🚀 Próximas Mejoras (Opcional)

1. Editar trabajador (actualizar datos)
2. Cambiar contraseña
3. Ver ventas por trabajador
4. Filtrar por cargo o rol
5. Buscar trabajadores
6. Reactivar trabajadores desactivados
7. Historial de cambios

---

**Implementado el:** 18 de marzo de 2026  
**Versión:** 1.0.0  
**Estado:** ✅ Completamente integrado con backend
**Archivo:** `pages/admin/trabajadores.html`
