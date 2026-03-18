# Fix - Error al Eliminar Ítems del Inventario

## Problema Original
Al intentar eliminar un ítem del inventario, se mostraba:
```
DELETE http://localhost:3000/api/inventario/121 500 (Internal Server Error)
Error al eliminar ítem: Error: Error interno del servidor
```

## Causa Raíz
El ítem del inventario que se intentaba eliminar estaba siendo usado en la tabla `arreglos_inventario` (recetas de arreglos florales). La base de datos tiene una restricción de clave foránea:

```sql
CREATE TABLE arreglos_inventario (
    ...
    inventario_id INTEGER NOT NULL REFERENCES inventario(id) ON DELETE RESTRICT,
    ...
);
```

La restricción `ON DELETE RESTRICT` **impide** eliminar un ítem del inventario si está siendo referenciado en algún arreglo floral.

## Solución Implementada

### 1. Backend - Validación Proactiva (inventario.service.js)

Mejoré el método `delete()` para:
- ✅ Verificar si el ítem está siendo usado antes de intentar eliminarlo
- ✅ Contar cuántos arreglos lo están usando
- ✅ Lanzar un error descriptivo con información útil
- ✅ Manejar errores de restricción de clave foránea (código 23503)

```javascript
async delete(id) {
  try {
    // Verificar si el ítem está siendo usado en arreglos
    const checkUsage = await query(
      'SELECT COUNT(*) as count FROM arreglos_inventario WHERE inventario_id = $1',
      [id]
    );
    
    const usageCount = parseInt(checkUsage.rows[0].count);
    
    if (usageCount > 0) {
      throw new Error(`No se puede eliminar este ítem porque está siendo usado en ${usageCount} arreglo(s) floral(es). Primero debes eliminar o modificar esos arreglos.`);
    }
    
    const result = await query('DELETE FROM inventario WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Item no encontrado');
    }
    
    return result.rows[0];
  } catch (error) {
    // Si es un error de restricción de clave foránea, dar un mensaje más claro
    if (error.code === '23503') {
      throw new Error('No se puede eliminar este ítem porque está siendo usado en otros registros del sistema.');
    }
    throw error;
  }
}
```

### 2. Frontend - Mejor Manejo de Errores (inventario.html)

Mejoré la función `eliminarItem()` para mostrar el mensaje de error específico del backend:

```javascript
async function eliminarItem(id) {
  const item = items.find(i => i.id === id);
  Modal.confirm(`¿Eliminar "${item?.nombre}"?`, async () => {
    try {
      await API.delete('/inventario/' + id);
      Toast.success('Ítem eliminado');
      await cargarInventario();
    } catch (error) {
      console.error('Error al eliminar ítem:', error);
      // Muestra el mensaje descriptivo del backend
      Toast.error(error.message || 'Error al eliminar el ítem');
    }
  });
}
```

## Mensajes de Error Mejorados

### Antes:
```
❌ Error interno del servidor
```

### Después:
```
✅ No se puede eliminar este ítem porque está siendo usado en 3 arreglo(s) floral(es). 
   Primero debes eliminar o modificar esos arreglos.
```

O si es otro tipo de restricción:
```
✅ No se puede eliminar este ítem porque está siendo usado en otros registros del sistema.
```

## Flujo de Validación

1. Usuario hace clic en 🗑️ "Eliminar"
2. Se muestra confirmación: "¿Eliminar [nombre del ítem]?"
3. Usuario confirma
4. Backend verifica si el ítem está en uso:
   - ✅ **No está en uso** → Se elimina correctamente
   - ❌ **Está en uso** → Se muestra mensaje descriptivo con el número de arreglos que lo usan
5. Frontend muestra el resultado (éxito o error descriptivo)

## Casos de Uso

### Caso 1: Ítem NO usado en arreglos
```
Usuario elimina "Rosas rojas" (no usado en arreglos)
→ ✅ Éxito: "Ítem eliminado"
```

### Caso 2: Ítem usado en arreglos
```
Usuario elimina "Rosas rojas" (usado en 3 arreglos)
→ ❌ Error: "No se puede eliminar este ítem porque está siendo usado en 3 arreglo(s) floral(es). 
            Primero debes eliminar o modificar esos arreglos."
```

### Caso 3: Ítem no existe
```
Usuario intenta eliminar ítem con ID inexistente
→ ❌ Error: "Item no encontrado"
```

## Beneficios

1. ✅ **Mensajes claros**: El usuario sabe exactamente por qué no puede eliminar el ítem
2. ✅ **Información útil**: Se indica cuántos arreglos están usando el ítem
3. ✅ **Guía de acción**: Se sugiere qué hacer (eliminar o modificar los arreglos primero)
4. ✅ **Prevención proactiva**: Se verifica antes de intentar eliminar
5. ✅ **Integridad de datos**: Se mantiene la consistencia de la base de datos
6. ✅ **Mejor UX**: El usuario no ve errores genéricos de servidor

## Restricciones de Base de Datos

La tabla `arreglos_inventario` protege la integridad referencial:

```sql
inventario_id INTEGER NOT NULL REFERENCES inventario(id) ON DELETE RESTRICT
```

Esto significa:
- ❌ No puedes eliminar un ítem del inventario si está en algún arreglo
- ✅ Debes primero eliminar o modificar los arreglos que lo usan
- ✅ Esto previene datos huérfanos y mantiene la consistencia

## Alternativas Futuras (Opcional)

Si en el futuro quieres permitir eliminar ítems usados en arreglos, podrías:

1. **Cambiar a CASCADE**: Eliminar automáticamente las referencias
   ```sql
   ON DELETE CASCADE
   ```
   ⚠️ Esto eliminaría automáticamente las recetas de los arreglos

2. **Cambiar a SET NULL**: Poner NULL en las referencias
   ```sql
   ON DELETE SET NULL
   ```
   ⚠️ Esto requeriría permitir NULL en inventario_id

3. **Soft Delete**: Marcar como "inactivo" en lugar de eliminar
   ```sql
   ALTER TABLE inventario ADD COLUMN activo BOOLEAN DEFAULT true;
   ```
   ✅ Recomendado para mantener historial

## Estado
🟢 **RESUELTO** - Ahora se muestran mensajes de error descriptivos cuando no se puede eliminar un ítem.
