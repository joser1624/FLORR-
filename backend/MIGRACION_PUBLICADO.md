# Migración: Columna "publicado" en productos

## ¿Qué hace este script?

Agrega la columna `publicado` (tipo BOOLEAN) a la tabla `productos` en la base de datos.

- **Valor por defecto**: `TRUE` (todos los productos existentes quedan publicados)
- **Propósito**: Controlar qué productos se muestran en el catálogo público (`index.html`)

## Cómo ejecutar

Desde la carpeta `backend/`:

```bash
node src/scripts/add-publicado-column.js
```

## Verificación

Después de ejecutar, puedes verificar en PostgreSQL:

```sql
-- Ver la estructura de la tabla
\d productos

-- Ver productos publicados
SELECT id, nombre, publicado FROM productos;
```

## Uso en el sistema

1. **Admin (`productos.html`)**: 
   - Columna "Publicado" con botón toggle 👁/🚫
   - Click para publicar/ocultar productos del catálogo público

2. **Público (`index.html`)**: 
   - Solo muestra productos con `publicado = true`
   - Se actualiza automáticamente cada 10 segundos

## Rollback (si necesitas revertir)

```sql
ALTER TABLE productos DROP COLUMN publicado;
```

## Notas

- El script es idempotente: puedes ejecutarlo múltiples veces sin problemas
- Si la columna ya existe, solo muestra un mensaje y termina
- No afecta datos existentes (todos quedan publicados por defecto)
