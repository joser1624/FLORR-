# Solución: Botones de Aporte y Retiro no aparecen

## 🔍 Problema

Los botones "+ Aporte" y "- Retiro" no aparecen en el card de Capital del Negocio. Solo aparece el botón "Ver Historial".

## 🎯 Causa

El usuario no está siendo reconocido como administrador. Los botones solo aparecen si `user.rol === 'admin'`.

## ✅ Solución

### Opción 1: Cerrar sesión e iniciar sesión nuevamente

1. Abre la consola del navegador (F12)
2. Ejecuta:
```javascript
localStorage.clear();
location.reload();
```

3. Inicia sesión con las credenciales de administrador:
   - Email: `admin@encantoseternos.com`
   - Contraseña: `admin123`

4. Verás los 3 botones en el card de Capital

### Opción 2: Establecer manualmente el usuario admin (para pruebas rápidas)

1. Abre la consola del navegador (F12) en el dashboard
2. Pega estos comandos:

```javascript
localStorage.setItem('ee_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzcsImVtYWlsIjoiYWRtaW5AZW5jYW50b3NldGVybm9zLmNvbSIsInJvbCI6ImFkbWluIiwibm9tYnJlIjoiQWRtaW5pc3RyYWRvciIsImlhdCI6MTc3Mzg1MDQ4NCwiZXhwIjoxNzczOTM2ODg0fQ.Qd0pmz_NcDciZSE8_vPpr217vXDebDBwlkCJYkIfLao');

localStorage.setItem('ee_user', JSON.stringify({
  id: 37,
  nombre: 'Administrador',
  email: 'admin@encantoseternos.com',
  rol: 'admin',
  cargo: 'Administrador'
}));

location.reload();
```

3. La página se recargará y verás los 3 botones

### Opción 3: Verificar el usuario actual

Para verificar qué usuario está logueado:

```javascript
console.log('Token:', localStorage.getItem('ee_token'));
console.log('Usuario:', JSON.parse(localStorage.getItem('ee_user')));
```

Deberías ver:
```javascript
{
  id: 37,
  nombre: 'Administrador',
  email: 'admin@encantoseternos.com',
  rol: 'admin',  // <-- Esto debe ser 'admin'
  cargo: 'Administrador'
}
```

## 🎨 Resultado Esperado

Después de iniciar sesión como administrador, deberías ver:

```
┌─────────────────────────────────────────────────────────┐
│  💰 Capital del Negocio                                 │
│                                    [+ Aporte] [- Retiro] │
│  S/ 8,290.00                       [📋 Historial]       │
│  ─────────────────────────────────────────────────────  │
│  Capital    + Ingresos  - Gastos   + Aportes  - Retiros│
│  Inicial                                                │
│  S/ 10,000  S/ 490      S/ 2,200   S/ 0.00    S/ 0.00  │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Verificación del Código

El código que determina qué botones mostrar está en `dashboard.html`:

```javascript
function renderCapital(data) {
  // ... código de renderizado ...
  
  const user = Auth.getUser(); // Obtiene usuario de localStorage
  const botonesContainer = document.getElementById('capital-botones');
  
  if (user && user.rol === 'admin') {
    // ADMINISTRADOR: 3 botones
    botonesContainer.innerHTML = `
      <button ... onclick="Modal.open('modal-aporte')">+ Aporte</button>
      <button ... onclick="Modal.open('modal-retiro')">- Retiro</button>
      <button ... onclick="abrirHistorialCapital()">📋 Historial</button>
    `;
  } else {
    // EMPLEADO: 1 botón
    botonesContainer.innerHTML = `
      <button ... onclick="abrirHistorialCapital()">📋 Ver Historial</button>
    `;
  }
}
```

## 📝 Notas

- El token JWT expira en 24 horas
- Si el token expira, debes volver a iniciar sesión
- Solo usuarios con `rol: 'admin'` ven los botones de Aporte y Retiro
- Todos los usuarios autenticados pueden ver el capital y el historial

## 🎯 Usuarios Disponibles

### Administrador (acceso completo)
- Email: `admin@encantoseternos.com`
- Contraseña: `admin123`
- Rol: `admin`
- ✅ Ve los 3 botones

### Empleados (solo lectura)
- Email: `maria@encantoseternos.com`
- Email: `carlos@encantoseternos.com`
- Email: `ana@encantoseternos.com`
- Rol: `empleado`
- ❌ Solo ven el botón de Historial

---

**Recomendación:** Usa la Opción 1 (cerrar sesión e iniciar sesión nuevamente) para asegurarte de que todo funcione correctamente.
