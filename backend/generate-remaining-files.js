#!/usr/bin/env node

/**
 * Script to generate all remaining backend files
 * Run with: node generate-remaining-files.js
 */

const fs = require('fs');
const path = require('path');

// Module definitions
const modules = [
  {
    name: 'inventario',
    table: 'inventario',
    singular: 'item',
    plural: 'items',
    roles: ['admin', 'empleado', 'duena'],
    fields: ['nombre', 'tipo', 'stock', 'stock_min', 'unidad', 'costo']
  },
  {
    name: 'ventas',
    table: 'ventas',
    singular: 'venta',
    plural: 'ventas',
    roles: ['admin', 'empleado'],
    fields: ['fecha', 'total', 'metodo_pago', 'trabajador_id', 'cliente_id'],
    hasItems: true,
    itemsTable: 'ventas_productos'
  },
  {
    name: 'pedidos',
    table: 'pedidos',
    singular: 'pedido',
    plural: 'pedidos',
    roles: ['admin', 'empleado'],
    fields: ['cliente_id', 'cliente_nombre', 'cliente_telefono', 'direccion', 'fecha_entrega', 'descripcion', 'total', 'metodo_pago', 'estado', 'trabajador_id']
  },
  {
    name: 'clientes',
    table: 'clientes',
    singular: 'cliente',
    plural: 'clientes',
    roles: ['admin', 'empleado'],
    fields: ['nombre', 'telefono', 'direccion', 'email']
  },
  {
    name: 'trabajadores',
    table: 'usuarios',
    singular: 'trabajador',
    plural: 'trabajadores',
    roles: ['admin'],
    fields: ['nombre', 'email', 'password', 'telefono', 'cargo', 'rol', 'fecha_ingreso']
  },
  {
    name: 'gastos',
    table: 'gastos',
    singular: 'gasto',
    plural: 'gastos',
    roles: ['admin', 'duena'],
    fields: ['descripcion', 'categoria', 'monto', 'fecha']
  },
  {
    name: 'arreglos',
    table: 'arreglos',
    singular: 'arreglo',
    plural: 'arreglos',
    roles: ['admin', 'empleado', 'duena'],
    fields: ['nombre', 'margen', 'costo_total', 'precio_venta'],
    hasItems: true,
    itemsTable: 'arreglos_inventario'
  },
  {
    name: 'promociones',
    table: 'promociones',
    singular: 'promocion',
    plural: 'promociones',
    roles: ['admin', 'duena'],
    fields: ['titulo', 'descripcion', 'descuento', 'tipo', 'fecha_desde', 'fecha_hasta', 'activa']
  },
  {
    name: 'eventos',
    table: 'eventos',
    singular: 'evento',
    plural: 'eventos',
    roles: ['admin', 'duena'],
    fields: ['nombre', 'descripcion', 'emoji', 'fecha', 'color', 'activo']
  }
];

// Generate service file
function generateService(module) {
  return `const { query, getClient } = require('../config/database');

class ${capitalize(module.name)}Service {
  /**
   * Get all ${module.plural}
   */
  async getAll(filters = {}) {
    let queryText = 'SELECT * FROM ${module.table} WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Add filters as needed
    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get ${module.singular} by ID
   */
  async getById(id) {
    const result = await query(
      'SELECT * FROM ${module.table} WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Create ${module.singular}
   */
  async create(data) {
    const fields = ${JSON.stringify(module.fields)};
    const values = fields.map(f => data[f]);
    const placeholders = fields.map((_, i) => \`$\${i + 1}\`).join(', ');
    
    const result = await query(
      \`INSERT INTO ${module.table} (\${fields.join(', ')}) 
       VALUES (\${placeholders}) 
       RETURNING *\`,
      values
    );
    return result.rows[0];
  }

  /**
   * Update ${module.singular}
   */
  async update(id, data) {
    const fields = ${JSON.stringify(module.fields)};
    const setClause = fields.map((f, i) => \`\${f} = $\${i + 1}\`).join(', ');
    const values = [...fields.map(f => data[f]), id];
    
    const result = await query(
      \`UPDATE ${module.table} SET \${setClause} WHERE id = $\${fields.length + 1} RETURNING *\`,
      values
    );
    return result.rows[0];
  }

  /**
   * Delete ${module.singular}
   */
  async delete(id) {
    await query('DELETE FROM ${module.table} WHERE id = $1', [id]);
  }
}

module.exports = new ${capitalize(module.name)}Service();
`;
}

// Generate controller file
function generateController(module) {
  return `const ${module.name}Service = require('../services/${module.name}.service');

class ${capitalize(module.name)}Controller {
  /**
   * GET /api/${module.name}
   */
  async getAll(req, res, next) {
    try {
      const ${module.plural} = await ${module.name}Service.getAll(req.query);
      
      res.json({
        success: true,
        ${module.plural}
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/${module.name}/:id
   */
  async getById(req, res, next) {
    try {
      const ${module.singular} = await ${module.name}Service.getById(req.params.id);
      
      if (!${module.singular}) {
        return res.status(404).json({
          error: true,
          mensaje: '${capitalize(module.singular)} no encontrado'
        });
      }

      res.json({
        success: true,
        ${module.singular}
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/${module.name}
   */
  async create(req, res, next) {
    try {
      const ${module.singular} = await ${module.name}Service.create(req.body);
      
      res.status(201).json({
        success: true,
        ${module.singular},
        mensaje: '${capitalize(module.singular)} creado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/${module.name}/:id
   */
  async update(req, res, next) {
    try {
      const ${module.singular} = await ${module.name}Service.update(req.params.id, req.body);
      
      if (!${module.singular}) {
        return res.status(404).json({
          error: true,
          mensaje: '${capitalize(module.singular)} no encontrado'
        });
      }

      res.json({
        success: true,
        ${module.singular},
        mensaje: '${capitalize(module.singular)} actualizado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/${module.name}/:id
   */
  async delete(req, res, next) {
    try {
      await ${module.name}Service.delete(req.params.id);
      
      res.json({
        success: true,
        mensaje: '${capitalize(module.singular)} eliminado correctamente'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ${capitalize(module.name)}Controller();
`;
}

// Generate routes file
function generateRoutes(module) {
  const rolesStr = JSON.stringify(module.roles);
  return `const express = require('express');
const router = express.Router();
const ${module.name}Controller = require('../controllers/${module.name}.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', verifyToken, ${module.name}Controller.getAll.bind(${module.name}Controller));
router.get('/:id', verifyToken, ${module.name}Controller.getById.bind(${module.name}Controller));
router.post('/', verifyToken, requireRole(${rolesStr}), ${module.name}Controller.create.bind(${module.name}Controller));
router.put('/:id', verifyToken, requireRole(${rolesStr}), ${module.name}Controller.update.bind(${module.name}Controller));
router.delete('/:id', verifyToken, requireRole(${rolesStr}), ${module.name}Controller.delete.bind(${module.name}Controller));

module.exports = router;
`;
}

// Helper function
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Create directories if they don't exist
const dirs = ['src/services', 'src/controllers', 'src/routes'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate files for each module
console.log('🚀 Generating backend files...\n');

modules.forEach(module => {
  console.log(`📝 Generating ${module.name} module...`);
  
  // Generate service
  const servicePath = path.join('src', 'services', `${module.name}.service.js`);
  fs.writeFileSync(servicePath, generateService(module));
  console.log(`   ✅ Created ${servicePath}`);
  
  // Generate controller
  const controllerPath = path.join('src', 'controllers', `${module.name}.controller.js`);
  fs.writeFileSync(controllerPath, generateController(module));
  console.log(`   ✅ Created ${controllerPath}`);
  
  // Generate routes
  const routesPath = path.join('src', 'routes', `${module.name}.routes.js`);
  fs.writeFileSync(routesPath, generateRoutes(module));
  console.log(`   ✅ Created ${routesPath}`);
  
  console.log('');
});

console.log('✨ All files generated successfully!');
console.log('\n📋 Next steps:');
console.log('1. Review generated files');
console.log('2. Customize business logic as needed');
console.log('3. Run: npm install');
console.log('4. Run: npm run db:reset');
console.log('5. Run: npm run dev');
console.log('\n🎉 Happy coding!');
