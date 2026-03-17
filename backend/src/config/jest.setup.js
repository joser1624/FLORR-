/**
 * Jest global setup - runs after each test file's framework is initialized.
 * Closes the PostgreSQL pool after all tests in a file complete,
 * preventing "open handles" warnings from pg's keep-alive connections.
 *
 * Only closes the real pool when the database module was NOT mocked
 * (i.e., in tests that actually import the real pool).
 */
afterAll(async () => {
  try {
    // Access the module cache directly to avoid triggering a fresh require
    const dbModule = jest.requireActual('./database');
    if (dbModule && dbModule.pool) {
      await dbModule.pool.end();
    }
  } catch {
    // Module was mocked or already closed — nothing to do
  }
});
