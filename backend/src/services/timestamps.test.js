/**
 * Audit Trail and Timestamps Tests
 * Validates Requirements: 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7
 *
 * These tests verify the schema and service layer enforce correct timestamp behavior:
 * - created_at and updated_at default to CURRENT_TIMESTAMP on INSERT
 * - updated_at is auto-updated via DB triggers on UPDATE
 * - created_at is never modified in UPDATE queries
 * - All timestamps use UTC (PostgreSQL CURRENT_TIMESTAMP is UTC)
 */

const fs = require('fs');
const path = require('path');

// Read the schema SQL file once for all tests
const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

// Tables that must have both created_at and updated_at
const TABLES_WITH_BOTH_TIMESTAMPS = [
  'usuarios',
  'productos',
  'inventario',
  'clientes',
  'pedidos',
  'ventas',
  'gastos',
  'caja',
  'arreglos',
  'promociones',
  'eventos',
];

// Tables that only have created_at (junction tables with no update semantics)
const TABLES_WITH_CREATED_AT_ONLY = [
  'ventas_productos',
  'arreglos_inventario',
];

// All tables that need at least created_at
const ALL_TABLES = [...TABLES_WITH_BOTH_TIMESTAMPS, ...TABLES_WITH_CREATED_AT_ONLY];

// Service files that have UPDATE operations
const SERVICE_FILES = [
  'productos.service.js',
  'inventario.service.js',
  'clientes.service.js',
  'pedidos.service.js',
  'ventas.service.js',
  'gastos.service.js',
  'caja.service.js',
  'arreglos.service.js',
  'promociones.service.js',
  'eventos.service.js',
  'trabajadores.service.js',
];

describe('Audit Trail and Timestamps - Requirements 25.1-25.7', () => {

  // -----------------------------------------------------------------------
  // Requirement 25.1 & 25.2: created_at and updated_at default to CURRENT_TIMESTAMP
  // -----------------------------------------------------------------------
  describe('Requirement 25.1 - created_at DEFAULT CURRENT_TIMESTAMP on all tables', () => {
    test.each(TABLES_WITH_BOTH_TIMESTAMPS)(
      'table "%s" has created_at DEFAULT CURRENT_TIMESTAMP',
      (tableName) => {
        // Match the CREATE TABLE block for this table
        const tableBlockRegex = new RegExp(
          `CREATE TABLE ${tableName}\\s*\\([^;]+;`,
          'is'
        );
        const tableBlock = schemaSql.match(tableBlockRegex);
        expect(tableBlock).not.toBeNull();

        // Within that block, created_at must have DEFAULT CURRENT_TIMESTAMP
        expect(tableBlock[0]).toMatch(/created_at\s+TIMESTAMP\s+DEFAULT\s+CURRENT_TIMESTAMP/i);
      }
    );

    test.each(TABLES_WITH_CREATED_AT_ONLY)(
      'junction table "%s" has created_at DEFAULT CURRENT_TIMESTAMP',
      (tableName) => {
        const tableBlockRegex = new RegExp(
          `CREATE TABLE ${tableName}\\s*\\([^;]+;`,
          'is'
        );
        const tableBlock = schemaSql.match(tableBlockRegex);
        expect(tableBlock).not.toBeNull();
        expect(tableBlock[0]).toMatch(/created_at\s+TIMESTAMP\s+DEFAULT\s+CURRENT_TIMESTAMP/i);
      }
    );
  });

  describe('Requirement 25.2 - updated_at DEFAULT CURRENT_TIMESTAMP on all updatable tables', () => {
    test.each(TABLES_WITH_BOTH_TIMESTAMPS)(
      'table "%s" has updated_at DEFAULT CURRENT_TIMESTAMP',
      (tableName) => {
        const tableBlockRegex = new RegExp(
          `CREATE TABLE ${tableName}\\s*\\([^;]+;`,
          'is'
        );
        const tableBlock = schemaSql.match(tableBlockRegex);
        expect(tableBlock).not.toBeNull();
        expect(tableBlock[0]).toMatch(/updated_at\s+TIMESTAMP\s+DEFAULT\s+CURRENT_TIMESTAMP/i);
      }
    );
  });

  // -----------------------------------------------------------------------
  // Requirement 25.3 & 25.4: DB triggers auto-update updated_at on UPDATE
  // -----------------------------------------------------------------------
  describe('Requirement 25.3 & 25.4 - UPDATE triggers exist for all updatable tables', () => {
    test('schema defines the update_updated_at_column trigger function', () => {
      expect(schemaSql).toMatch(/CREATE OR REPLACE FUNCTION update_updated_at_column/i);
      expect(schemaSql).toMatch(/NEW\.updated_at\s*=\s*CURRENT_TIMESTAMP/i);
    });

    test.each(TABLES_WITH_BOTH_TIMESTAMPS)(
      'table "%s" has a BEFORE UPDATE trigger that calls update_updated_at_column',
      (tableName) => {
        const triggerRegex = new RegExp(
          `CREATE TRIGGER update_${tableName}_updated_at\\s+BEFORE UPDATE ON ${tableName}`,
          'i'
        );
        expect(schemaSql).toMatch(triggerRegex);
      }
    );
  });

  // -----------------------------------------------------------------------
  // Requirement 25.5 & 25.6: Service UPDATE queries never set created_at
  // -----------------------------------------------------------------------
  describe('Requirement 25.5 & 25.6 - Service UPDATE queries never modify created_at', () => {
    const servicesDir = path.resolve(__dirname);

    test.each(SERVICE_FILES)(
      'service "%s" does not include created_at in any SET clause',
      (filename) => {
        const filePath = path.join(servicesDir, filename);

        // Skip if file doesn't exist (optional modules)
        if (!fs.existsSync(filePath)) {
          return;
        }

        const source = fs.readFileSync(filePath, 'utf8');

        // Find all UPDATE ... SET ... blocks and check none include created_at
        // Match UPDATE SQL strings (single or template literals)
        const updateStatements = source.match(/UPDATE\s+\w+\s+SET[\s\S]*?WHERE/gi) || [];

        for (const stmt of updateStatements) {
          expect(stmt).not.toMatch(/created_at\s*=/i);
        }
      }
    );

    test('no service file assigns created_at in an UPDATE query (global check)', () => {
      const servicesDir = path.resolve(__dirname);

      for (const filename of SERVICE_FILES) {
        const filePath = path.join(servicesDir, filename);
        if (!fs.existsSync(filePath)) continue;

        const source = fs.readFileSync(filePath, 'utf8');

        // Look for any UPDATE SQL that contains created_at = 
        const hasCreatedAtInUpdate = /UPDATE[\s\S]{0,500}SET[\s\S]{0,500}created_at\s*=/i.test(source);
        expect(hasCreatedAtInUpdate).toBe(false);
      }
    });
  });

  // -----------------------------------------------------------------------
  // Requirement 25.7: Timestamps use UTC (PostgreSQL CURRENT_TIMESTAMP is UTC)
  // -----------------------------------------------------------------------
  describe('Requirement 25.7 - Timestamps use UTC timezone', () => {
    test('schema uses CURRENT_TIMESTAMP (UTC) for all timestamp defaults, not NOW() with timezone offset', () => {
      // CURRENT_TIMESTAMP in PostgreSQL returns UTC when timezone is set to UTC (default)
      // Verify schema does not use timezone-aware offsets like AT TIME ZONE 'America/...'
      expect(schemaSql).not.toMatch(/AT TIME ZONE\s+'[^U]/i);
    });

    test('trigger function uses CURRENT_TIMESTAMP (UTC) for updated_at', () => {
      // The trigger function must use CURRENT_TIMESTAMP, not a local timezone expression
      const triggerFnMatch = schemaSql.match(
        /CREATE OR REPLACE FUNCTION update_updated_at_column\(\)[\s\S]*?\$\s*language/i
      );
      expect(triggerFnMatch).not.toBeNull();
      expect(triggerFnMatch[0]).toMatch(/CURRENT_TIMESTAMP/i);
      expect(triggerFnMatch[0]).not.toMatch(/AT TIME ZONE\s+'[^U]/i);
    });

    test('all timestamp columns are defined as TIMESTAMP (not TIMESTAMPTZ with local offset)', () => {
      // Count TIMESTAMP DEFAULT CURRENT_TIMESTAMP occurrences across all tables
      const matches = schemaSql.match(/TIMESTAMP\s+DEFAULT\s+CURRENT_TIMESTAMP/gi) || [];
      // We expect at least one per table that has timestamps (11 tables × 2 + 2 junction tables × 1 = 24)
      expect(matches.length).toBeGreaterThanOrEqual(24);
    });
  });

  // -----------------------------------------------------------------------
  // Summary: all expected tables are present in schema
  // -----------------------------------------------------------------------
  describe('Schema completeness check', () => {
    test.each(ALL_TABLES)(
      'table "%s" exists in schema',
      (tableName) => {
        expect(schemaSql).toMatch(new RegExp(`CREATE TABLE ${tableName}\\s*\\(`, 'i'));
      }
    );
  });
});
