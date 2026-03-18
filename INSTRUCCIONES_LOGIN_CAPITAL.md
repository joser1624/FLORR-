# Instrucciones para Probar el Sistema de Capital

## ✅ Estado Actual

- ✅ Backend corriendo en http://localhost:3000
- ✅ Tablas de capital creadas
- ✅ Usuario administrador creado
- ✅ Endpoint `/api/capital` funcionando correctamente

## 👤 Credenciales de Administrador

```
Email: admin@encantoseternos.com
Contraseña: admin123
```

## 🚀 Pasos para Probar

### Opción 1: Iniciar Sesión Normalmente

1. Abre el navegador
2. Ve a: `file:///C:/Users/josea/Documents/floreria/pages/admin/login.html`
3. Ingresa las credenciales:
   - Email: `admin@encantoseternos.com`
   - Contraseña: `admin123`
4. Click en "Iniciar sesión"
5. Serás redirigido al dashboard
6. Verás el card de Capital con los datos actuales

### Opción 2: Usar Token Directamente (Para Pruebas Rápidas)

Si ya tienes el dashboard abierto:

1. Abre la consola del navegador (F12)
2. Pega estos comandos:

```javascript
localStorage.setItem('ee_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzcsImVtYWlsIjoiYWRtaW5AZW5jYW50b3NldGVybm9zLmNvbSIsInJvbCI6ImFkbWluIiwibm9tYnJlIjoiQWRtaW5pc3RyYWRvciIsImlhdCI6MTc3Mzg0OTg0OSwiZXhwIjoxNzczOTM2MjQ5fQ.h-IoWNcNIcxysMzl6ByTUj1WLFC9rngemSJY67_Wxgo');

localStorage.setItem('ee_user', JSON.stringify({
  id: 37,
  nombre: 'Administrador',
  email: 'admin@encantoseternos.com',
  rol: 'admin'
}));

location.reload();
```

3. La página se recargará y estarás autenticado

## 📊 Datos Actuales del Capital

Según la última consulta:

```
Capital Actual: S/ 8,290.00

Desglose:
- Capital Inicial: S/ 10,000.00
- Ingresos:        S/    490.00  (ventas cerradas)
- Gastos:          S/  2,200.00  (gastos operativos)
- Aportes:         S/      0.00  (sin aportes aún)
- Retiros:         S/      0.00  (sin retiros aún)

Cálculo: 10,000 + 490 - 2,200 + 0 - 0 = 8,290
```

## 🧪 Pruebas a Realizar

### 1. Ver Capital en Dashboard

- ✅ Verifica que el card de capital aparece
- ✅ Verifica que muestra S/ 8,290.00
- ✅ Verifica que el desglose es correcto
- ✅ Verifica que aparecen los 3 botones (admin):
  - + Aporte
  - - Retiro
  - 📋 Historial

### 2. Registrar un Aporte

1. Click en `+ Aporte`
2. Llenar:
   - Monto: `1000`
   - Descripción: `Aporte de capital para expansión`
   - Fecha: (hoy por defecto)
3. Click en `Registrar Aporte`
4. Verificar:
   - Toast de éxito
   - Capital aumenta a S/ 9,290.00
   - Aportes muestra S/ 1,000.00

### 3. Registrar un Retiro

1. Click en `- Retiro`
2. Llenar:
   - Monto: `500`
   - Descripción: `Retiro personal`
   - Fecha: (hoy por defecto)
3. Click en `Registrar Retiro`
4. Verificar:
   - Toast de éxito
   - Capital disminuye a S/ 8,790.00
   - Retiros muestra S/ 500.00

### 4. Ver Historial

1. Click en `📋 Historial`
2. Verificar:
   - Modal se abre
   - Muestra los 2 movimientos registrados
   - Filtros funcionan (Todos / Aportes / Retiros)

## 🔧 Solución de Problemas

### Error: "Failed to fetch"

**Causa:** El backend no está corriendo o hay problema de CORS

**Solución:**
```bash
cd backend
npm start
```

### Error: "Token inválido"

**Causa:** El token expiró (dura 24 horas)

**Solución:** Volver a iniciar sesión

### No aparecen los botones de Aporte/Retiro

**Causa:** El usuario no es administrador

**Solución:** Verificar que iniciaste sesión con `admin@encantoseternos.com`

### Capital no se actualiza

**Causa:** Caché del navegador

**Solución:** Hard refresh (Ctrl+F5) o limpiar caché

## 📝 Notas Importantes

1. El token JWT expira en 24 horas
2. Solo usuarios con rol 'admin' pueden registrar aportes/retiros
3. Todos los usuarios autenticados pueden ver el capital
4. El capital se actualiza automáticamente al:
   - Cerrar una caja (suma ingresos)
   - Registrar un gasto (resta gastos)
   - Registrar un aporte (suma aportes)
   - Registrar un retiro (resta retiros)

## 🎯 Próximos Pasos

Una vez que hayas probado todo:

1. Registra algunos aportes y retiros de prueba
2. Verifica que el historial funciona
3. Prueba los filtros
4. Cierra una caja y verifica que los ingresos aumentan
5. Registra un gasto y verifica que los gastos aumentan

## 📞 Comandos Útiles

### Ver usuarios en la base de datos
```bash
cd backend
node -e "const {query} = require('./src/config/database'); query('SELECT id, nombre, email, rol FROM usuarios').then(r => console.log(r.rows)).finally(() => process.exit())"
```

### Ver movimientos de capital
```bash
node -e "const {query} = require('./src/config/database'); query('SELECT * FROM movimientos_capital ORDER BY fecha DESC').then(r => console.log(r.rows)).finally(() => process.exit())"
```

### Ver capital inicial
```bash
node -e "const {query} = require('./src/config/database'); query('SELECT * FROM configuracion WHERE clave = ''capital_inicial''').then(r => console.log(r.rows)).finally(() => process.exit())"
```

---

**¡Todo listo para probar!** 🎉

Inicia sesión con las credenciales de administrador y prueba el sistema de capital.
