# Instrucciones para Ejecutar la Migración de Arqueo de Caja

## ⚠️ IMPORTANTE: Ejecutar antes de usar el sistema

Para que el sistema de arqueo de caja funcione correctamente, debes ejecutar el script de migración que agrega las columnas necesarias a la base de datos.

## Pasos para ejecutar la migración:

### 1. Asegúrate de que PostgreSQL esté corriendo

Verifica que el servicio de PostgreSQL esté activo en tu sistema.

### 2. Ejecuta el script de migración

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
cd backend
node src/scripts/add-caja-arqueo-columns.js
```

### 3. Verifica que la migración fue exitosa

Deberías ver un mensaje como:

```
✅ Migración completada exitosamente
✅ Columnas agregadas:
   - monto_cierre_fisico
   - diferencia_cierre
   - observaciones_diferencia
```

### 4. Inicia el servidor backend

```bash
npm run dev
```

## ¿Qué hace esta migración?

Agrega 3 nuevas columnas a la tabla `caja`:

- `monto_cierre_fisico` (DECIMAL): El dinero físico contado al cerrar
- `diferencia_cierre` (DECIMAL): La diferencia entre lo esperado y lo contado
- `observaciones_diferencia` (TEXT): Explicación de por qué hay diferencia

## Si ya ejecutaste la migración

Si ya ejecutaste el script anteriormente, no hay problema. El script detecta si las columnas ya existen y no las vuelve a crear.

## Problemas comunes

### Error: "Database query error: SASL: SCRAM-SERVER-FIRST-MESSAGE"

Esto significa que hay un problema con la conexión a PostgreSQL. Verifica:

1. Que PostgreSQL esté corriendo
2. Que las credenciales en `backend/.env` sean correctas:
   - DB_HOST=localhost
   - DB_PORT=5432
   - DB_NAME=floreria_system_core
   - DB_USER=postgres
   - DB_PASSWORD=betojose243

### Error: "relation 'caja' does not exist"

Esto significa que la tabla `caja` no existe. Primero debes ejecutar el script de inicialización de la base de datos:

```bash
node src/scripts/init-db.js
```

## Funcionalidad implementada

Una vez ejecutada la migración, el sistema podrá:

✅ Preguntar "¿Cuánto dinero físico contaste?" al cerrar caja
✅ Calcular automáticamente si hay faltante o sobrante
✅ Exigir explicación si hay diferencia
✅ Mostrar advertencia si la diferencia es mayor a S/ 10
✅ Guardar el estado del arqueo (cuadrado/faltante/sobrante)
✅ Mostrar historial con estados de arqueo

## Siguiente paso

Después de ejecutar la migración, puedes usar el sistema normalmente. Al cerrar la caja, el sistema te pedirá que ingreses el monto físico contado.
