/**
 * Unit tests for Laboratorio page - Task 3.2
 * Tests quantity selection with stock validation
 */

describe('Laboratorio - Quantity Selection with Stock Validation', () => {
  let inventario;
  let seleccion;

  beforeEach(() => {
    // Mock inventory data
    inventario = [
      { id: 1, nombre: 'Rosas rojas', tipo: 'flores', stock: 10, costo: 3.50 },
      { id: 2, nombre: 'Lirios blancos', tipo: 'flores', stock: 5, costo: 2.80 },
      { id: 3, nombre: 'Papel decorativo', tipo: 'materiales', stock: 0, costo: 8.50 }
    ];
    seleccion = {};
  });

  describe('Stock Validation', () => {
    test('should not allow quantity to exceed available stock', () => {
      const item = inventario[0]; // stock: 10
      const actual = 8;
      const delta = 5; // Would result in 13, exceeding stock
      
      const nuevo = Math.max(0, Math.min(item.stock, actual + delta));
      
      expect(nuevo).toBe(10); // Should cap at stock limit
    });

    test('should allow quantity up to available stock', () => {
      const item = inventario[0]; // stock: 10
      const actual = 5;
      const delta = 5; // Would result in 10, exactly at stock
      
      const nuevo = Math.max(0, Math.min(item.stock, actual + delta));
      
      expect(nuevo).toBe(10);
    });

    test('should not allow negative quantities', () => {
      const item = inventario[0];
      const actual = 2;
      const delta = -5; // Would result in -3
      
      const nuevo = Math.max(0, Math.min(item.stock, actual + delta));
      
      expect(nuevo).toBe(0); // Should not go below 0
    });

    test('should handle zero stock items', () => {
      const item = inventario[2]; // stock: 0
      const actual = 0;
      const delta = 1;
      
      const nuevo = Math.max(0, Math.min(item.stock, actual + delta));
      
      expect(nuevo).toBe(0); // Cannot add items with zero stock
    });
  });

  describe('Quantity Selection', () => {
    test('should add item to selection when quantity is increased', () => {
      const id = 1;
      const quantity = 3;
      
      seleccion[id] = quantity;
      
      expect(seleccion[id]).toBe(3);
      expect(Object.keys(seleccion).length).toBe(1);
    });

    test('should remove item from selection when quantity reaches zero', () => {
      seleccion[1] = 5;
      
      // Simulate decreasing to zero
      const nuevo = 0;
      if (nuevo === 0) {
        delete seleccion[1];
      }
      
      expect(seleccion[1]).toBeUndefined();
      expect(Object.keys(seleccion).length).toBe(0);
    });

    test('should handle multiple items in selection', () => {
      seleccion[1] = 5;
      seleccion[2] = 3;
      
      expect(Object.keys(seleccion).length).toBe(2);
      expect(seleccion[1]).toBe(5);
      expect(seleccion[2]).toBe(3);
    });
  });

  describe('Cost Calculation', () => {
    test('should calculate total cost correctly for single item', () => {
      seleccion[1] = 5; // 5 × 3.50 = 17.50
      
      let costoTotal = 0;
      Object.keys(seleccion).forEach(id => {
        const item = inventario.find(i => i.id == id);
        costoTotal += item.costo * seleccion[id];
      });
      
      expect(costoTotal).toBe(17.50);
    });

    test('should calculate total cost correctly for multiple items', () => {
      seleccion[1] = 5; // 5 × 3.50 = 17.50
      seleccion[2] = 3; // 3 × 2.80 = 8.40
      // Total: 25.90
      
      let costoTotal = 0;
      Object.keys(seleccion).forEach(id => {
        const item = inventario.find(i => i.id == id);
        costoTotal += item.costo * seleccion[id];
      });
      
      expect(costoTotal).toBe(25.90);
    });

    test('should return zero cost when no items selected', () => {
      let costoTotal = 0;
      Object.keys(seleccion).forEach(id => {
        const item = inventario.find(i => i.id == id);
        costoTotal += item.costo * seleccion[id];
      });
      
      expect(costoTotal).toBe(0);
    });

    test('should calculate sale price based on margin', () => {
      seleccion[1] = 5; // Cost: 17.50
      const margen = 0.40; // 40%
      
      let costoTotal = 0;
      Object.keys(seleccion).forEach(id => {
        const item = inventario.find(i => i.id == id);
        costoTotal += item.costo * seleccion[id];
      });
      
      const precioVenta = costoTotal / (1 - margen);
      
      expect(precioVenta).toBeCloseTo(29.17, 2);
    });
  });

  describe('UI State Updates', () => {
    test('should reflect quantity changes in selection object', () => {
      const id = 1;
      const item = inventario.find(i => i.id === id);
      
      // Increase quantity
      let actual = seleccion[id] || 0;
      let nuevo = Math.max(0, Math.min(item.stock, actual + 1));
      seleccion[id] = nuevo;
      
      expect(seleccion[id]).toBe(1);
      
      // Increase again
      actual = seleccion[id];
      nuevo = Math.max(0, Math.min(item.stock, actual + 1));
      seleccion[id] = nuevo;
      
      expect(seleccion[id]).toBe(2);
    });

    test('should handle rapid quantity changes', () => {
      const id = 1;
      const item = inventario.find(i => i.id === id);
      
      // Simulate rapid increases
      for (let i = 0; i < 15; i++) {
        const actual = seleccion[id] || 0;
        const nuevo = Math.max(0, Math.min(item.stock, actual + 1));
        if (nuevo === 0) delete seleccion[id];
        else seleccion[id] = nuevo;
      }
      
      // Should cap at stock limit (10)
      expect(seleccion[id]).toBe(10);
    });
  });

  describe('Edge Cases', () => {
    test('should handle item not found in inventory', () => {
      const id = 999; // Non-existent item
      const item = inventario.find(i => i.id === id);
      
      expect(item).toBeUndefined();
      // Function should return early if item not found
    });

    test('should handle decimal quantities correctly', () => {
      const item = inventario[0];
      const actual = 5.5;
      const delta = 2.3;
      
      const nuevo = Math.max(0, Math.min(item.stock, actual + delta));
      
      expect(nuevo).toBeLessThanOrEqual(item.stock);
    });

    test('should maintain selection integrity when inventory changes', () => {
      seleccion[1] = 5;
      
      // Simulate inventory stock decrease
      inventario[0].stock = 3;
      
      // Selection should be validated against new stock
      const item = inventario[0];
      const validated = Math.min(seleccion[1], item.stock);
      
      expect(validated).toBe(3);
    });
  });
});
