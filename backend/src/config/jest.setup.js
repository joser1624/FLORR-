/**
 * Jest global setup — runs after each test file's framework is initialized.
 *
 * Closes the real PostgreSQL pool after all tests in a file complete,
 * preventing "open handles" warnings from pg's keep-alive connections.
 *
 * Uses require.cache to access the exact pool instance that is active,
 * rather than requireActual (which creates a new module instance).
 * Only runs when the real database module is loaded (not mocked).
 */

// Close pool after tests complete
afterAll(async () => {
  try {
    const resolved = require.resolve('./database');
    const mod = require.cache[resolved];
    if (mod && mod.exports && mod.exports.pool) {
      // End the pool
      await mod.exports.pool.end();
    }
  } catch {
    // Module was mocked, not loaded, or pool already closed — nothing to do.
  }
});
