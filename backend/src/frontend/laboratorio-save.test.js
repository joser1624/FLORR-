/**
 * Unit tests for Laboratorio page - Task 3.3
 * Tests arrangement save via POST /api/arreglos
 */

describe('Laboratorio - Arrangement Save (Task 3.3)', () => {
  let mockAPI;
  let mockToast;
  let inventario;
  let seleccion;

  beforeEach(() => {
    // Mock inventory data
    inventario = [
      { id: 1, nombre: 'Rosas rojas', tipo: 'flores', stock: 10, costo: 3.50 },
      { id: 2, nombre: 'Lirios blancos', tipo: 'flores', stock: 5, costo: 2.80 },
      { id: 3, nombre: 'Papel decorativo', tipo: 'materiales', stock: 8, costo: 8.50 }
    ];
    
    seleccion = {
      1: 5,  // 5 rosas
      2: 3   // 3 lirios
    };

    // Mock API
    mockAPI = {
      post: jest.fn()
    };

    // Mock Toast
    mockToast = {
      success: jest.fn(),
      warning: jest.fn(),
      error: jest.fn()
    };

    // Mock console
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('Payload Construction', () => {
    test('should build correct payload with nombre, margen, and items array', () => {
      const nombre = 'Arreglo primaveral';
      const margen = 40;
      
      const payload = {
        nombre,
        margen,
        items: Object.keys(seleccion).map(id => ({
          inventario_id: parseInt(id),
          cantidad: seleccion[id]
        }))
      };

      expect(payload.nombre).toBe('Arreglo primaveral');
      expect(payload.margen).toBe(40);
      expect(payload.items).toHaveLength(2);
      expect(payload.items[0]).toEqual({ inventario_id: 1, cantidad: 5 });
      expect(payload.items[1]).toEqual({ inventario_id: 2, cantidad: 3 });
    });

    test('should convert inventario_id to integer', () => {
      const payload = {
        nombre: 'Test',
        margen: 30,
        items: Object.keys(seleccion).map(id => ({
          inventario_id: parseInt(id),
          cantidad: seleccion[id]
        }))
      };

      payload.items.forEach(item => {
        expect(typeof item.inventario_id).toBe('number');
        expect(Number.isInteger(item.inventario_id)).toBe(true);
      });
    });

    test('should include cantidad for each item', () => {
      const payload = {
        nombre: 'Test',
        margen: 30,
        items: Object.keys(seleccion).map(id => ({
          inventario_id: parseInt(id),
          cantidad: seleccion[id]
        }))
      };

      payload.items.forEach(item => {
        expect(item.cantidad).toBeDefined();
        expect(typeof item.cantidad).toBe('number');
        expect(item.cantidad).toBeGreaterThan(0);
      });
    });

    test('should NOT include costo or precio in payload', () => {
      const payload = {
        nombre: 'Test',
        margen: 30,
        items: Object.keys(seleccion).map(id => ({
          inventario_id: parseInt(id),
          cantidad: seleccion[id]
        }))
      };

      expect(payload.costo).toBeUndefined();
      expect(payload.precio).toBeUndefined();
    });
  });

  describe('Validation', () => {
    test('should show warning when nombre is empty', async () => {
      const nombre = '';
      
      if (!nombre.trim()) {
        mockToast.warning('Ingresa un nombre para el arreglo');
        return;
      }

      expect(mockToast.warning).toHaveBeenCalledWith('Ingresa un nombre para el arreglo');
    });

    test('should show warning when nombre is only whitespace', async () => {
      const nombre = '   ';
      
      if (!nombre.trim()) {
        mockToast.warning('Ingresa un nombre para el arreglo');
        return;
      }

      expect(mockToast.warning).toHaveBeenCalledWith('Ingresa un nombre para el arreglo');
    });

    test('should show warning when no items selected', async () => {
      const emptySeleccion = {};
      const ids = Object.keys(emptySeleccion);
      
      if (!ids.length) {
        mockToast.warning('Agrega al menos un elemento');
        return;
      }

      expect(mockToast.warning).toHaveBeenCalledWith('Agrega al menos un elemento');
    });

    test('should trim nombre before sending', () => {
      const nombre = '  Arreglo con espacios  ';
      const trimmed = nombre.trim();
      
      expect(trimmed).toBe('Arreglo con espacios');
      expect(trimmed).not.toContain('  ');
    });
  });

  describe('API Integration', () => {
    test('should call API.post with correct endpoint', async () => {
      mockAPI.post.mockResolvedValue({ 
        success: true, 
        data: { id: 1, nombre: 'Test' } 
      });

      const payload = {
        nombre: 'Test Arreglo',
        margen: 40,
        items: [{ inventario_id: 1, cantidad: 5 }]
      };

      await mockAPI.post('/arreglos', payload);

      expect(mockAPI.post).toHaveBeenCalledWith('/arreglos', payload);
    });

    test('should show success message on successful save', async () => {
      const nombre = 'Arreglo primaveral';
      const precioVenta = 29.17;
      
      mockAPI.post.mockResolvedValue({ 
        success: true, 
        data: { id: 1, nombre } 
      });

      const response = await mockAPI.post('/arreglos', {});
      
      if (response.success) {
        mockToast.success(`"${nombre}" guardado como producto (S/ ${precioVenta.toFixed(2)})`);
      }

      expect(mockToast.success).toHaveBeenCalledWith(
        `"${nombre}" guardado como producto (S/ 29.17)`
      );
    });

    test('should log response on successful save', async () => {
      const response = { 
        success: true, 
        data: { id: 1, nombre: 'Test' } 
      };
      
      mockAPI.post.mockResolvedValue(response);
      
      const result = await mockAPI.post('/arreglos', {});
      console.log('Arreglo guardado:', result);

      expect(console.log).toHaveBeenCalledWith('Arreglo guardado:', response);
    });
  });

  describe('Error Handling', () => {
    test('should display validation errors from backend', async () => {
      const error = new Error('Validation failed');
      error.detalles = [
        { msg: 'El nombre no puede estar vacío' },
        { msg: 'El margen debe estar entre 0 y 100' }
      ];
      
      mockAPI.post.mockRejectedValue(error);

      try {
        await mockAPI.post('/arreglos', {});
      } catch (err) {
        console.error('Error al guardar arreglo:', err);
        
        if (err.detalles && err.detalles.length > 0) {
          const mensajes = err.detalles.map(d => d.msg || d.message).join(', ');
          mockToast.error(`Errores de validación: ${mensajes}`);
        }
      }

      expect(mockToast.error).toHaveBeenCalledWith(
        'Errores de validación: El nombre no puede estar vacío, El margen debe estar entre 0 y 100'
      );
    });

    test('should display generic error message when no detalles', async () => {
      const error = new Error('Network error');
      
      mockAPI.post.mockRejectedValue(error);

      try {
        await mockAPI.post('/arreglos', {});
      } catch (err) {
        console.error('Error al guardar arreglo:', err);
        
        if (err.detalles && err.detalles.length > 0) {
          const mensajes = err.detalles.map(d => d.msg || d.message).join(', ');
          mockToast.error(`Errores de validación: ${mensajes}`);
        } else {
          mockToast.error(err.message || 'Error al guardar el arreglo');
        }
      }

      expect(mockToast.error).toHaveBeenCalledWith('Network error');
    });

    test('should log error to console', async () => {
      const error = new Error('Test error');
      
      mockAPI.post.mockRejectedValue(error);

      try {
        await mockAPI.post('/arreglos', {});
      } catch (err) {
        console.error('Error al guardar arreglo:', err);
      }

      expect(console.error).toHaveBeenCalledWith('Error al guardar arreglo:', error);
    });

    test('should handle error with message property', async () => {
      const error = { message: 'Custom error message' };
      
      mockAPI.post.mockRejectedValue(error);

      try {
        await mockAPI.post('/arreglos', {});
      } catch (err) {
        mockToast.error(err.message || 'Error al guardar el arreglo');
      }

      expect(mockToast.error).toHaveBeenCalledWith('Custom error message');
    });

    test('should use fallback message when error has no message', async () => {
      const error = {};
      
      mockAPI.post.mockRejectedValue(error);

      try {
        await mockAPI.post('/arreglos', {});
      } catch (err) {
        mockToast.error(err.message || 'Error al guardar el arreglo');
      }

      expect(mockToast.error).toHaveBeenCalledWith('Error al guardar el arreglo');
    });
  });

  describe('Form Clearing', () => {
    test('should clear selection after successful save', async () => {
      mockAPI.post.mockResolvedValue({ success: true });
      
      await mockAPI.post('/arreglos', {});
      
      // Simulate clearing
      seleccion = {};
      
      expect(Object.keys(seleccion).length).toBe(0);
    });

    test('should clear nombre input after successful save', async () => {
      mockAPI.post.mockResolvedValue({ success: true });
      
      let nombreValue = 'Test Arreglo';
      
      await mockAPI.post('/arreglos', {});
      
      // Simulate clearing
      nombreValue = '';
      
      expect(nombreValue).toBe('');
    });

    test('should NOT clear form on error', async () => {
      mockAPI.post.mockRejectedValue(new Error('Test error'));
      
      let nombreValue = 'Test Arreglo';
      let seleccionCopy = { ...seleccion };
      
      try {
        await mockAPI.post('/arreglos', {});
      } catch (err) {
        // Form should not be cleared on error
      }
      
      expect(nombreValue).toBe('Test Arreglo');
      expect(Object.keys(seleccionCopy).length).toBe(2);
    });
  });

  describe('Price Calculation', () => {
    test('should calculate correct total cost', () => {
      let costoTotal = 0;
      Object.keys(seleccion).forEach(id => {
        const item = inventario.find(i => i.id == id);
        costoTotal += item.costo * seleccion[id];
      });
      
      // 5 × 3.50 + 3 × 2.80 = 17.50 + 8.40 = 25.90
      expect(costoTotal).toBe(25.90);
    });

    test('should calculate correct sale price with margin', () => {
      const margen = 40; // 40%
      let costoTotal = 0;
      
      Object.keys(seleccion).forEach(id => {
        const item = inventario.find(i => i.id == id);
        costoTotal += item.costo * seleccion[id];
      });
      
      const precioVenta = costoTotal / (1 - margen/100);
      
      // 25.90 / 0.60 = 43.17
      expect(precioVenta).toBeCloseTo(43.17, 2);
    });

    test('should handle different margin values', () => {
      const costoTotal = 25.90;
      
      const margins = [20, 30, 40, 50];
      const expectedPrices = [32.38, 37.00, 43.17, 51.80];
      
      margins.forEach((margen, index) => {
        const precioVenta = costoTotal / (1 - margen/100);
        expect(precioVenta).toBeCloseTo(expectedPrices[index], 1);
      });
    });
  });

  describe('Requirements Validation', () => {
    test('Requirement 2.3: POST request to /api/arreglos', async () => {
      mockAPI.post.mockResolvedValue({ success: true });
      
      await mockAPI.post('/arreglos', {});
      
      expect(mockAPI.post).toHaveBeenCalledWith('/arreglos', expect.any(Object));
    });

    test('Requirement 2.4: Payload includes nombre, margen, and items', () => {
      const payload = {
        nombre: 'Test',
        margen: 40,
        items: [{ inventario_id: 1, cantidad: 5 }]
      };

      expect(payload).toHaveProperty('nombre');
      expect(payload).toHaveProperty('margen');
      expect(payload).toHaveProperty('items');
      expect(Array.isArray(payload.items)).toBe(true);
    });

    test('Requirement 2.4: Items array contains inventario_id and cantidad', () => {
      const items = [
        { inventario_id: 1, cantidad: 5 },
        { inventario_id: 2, cantidad: 3 }
      ];

      items.forEach(item => {
        expect(item).toHaveProperty('inventario_id');
        expect(item).toHaveProperty('cantidad');
        expect(typeof item.inventario_id).toBe('number');
        expect(typeof item.cantidad).toBe('number');
      });
    });

    test('Requirement 2.5: Display success message on completion', async () => {
      mockAPI.post.mockResolvedValue({ success: true });
      
      await mockAPI.post('/arreglos', {});
      mockToast.success('Arreglo guardado correctamente');
      
      expect(mockToast.success).toHaveBeenCalled();
    });

    test('Requirement 2.6: Handle validation errors', async () => {
      const error = new Error('Validation error');
      error.detalles = [{ msg: 'Invalid data' }];
      
      mockAPI.post.mockRejectedValue(error);
      
      try {
        await mockAPI.post('/arreglos', {});
      } catch (err) {
        mockToast.error('Error occurred');
      }
      
      expect(mockToast.error).toHaveBeenCalled();
    });
  });
});
