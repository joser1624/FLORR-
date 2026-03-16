/**
 * Test script for role-based authorization middleware
 * Tests Requirements 2.4, 2.5, 2.6
 */

const { requireRole } = require('../middleware/auth');

// Mock request and response objects
const createMockReq = (user) => ({
  user: user
});

const createMockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

let testsPassed = 0;
let testsFailed = 0;

const runTest = (testName, testFn) => {
  console.log(`\n${testName}`);
  try {
    const result = testFn();
    if (result) {
      console.log('   ✓ PASS');
      testsPassed++;
    } else {
      console.log('   ✗ FAIL');
      testsFailed++;
    }
  } catch (error) {
    console.log(`   ✗ FAIL: ${error.message}`);
    testsFailed++;
  }
};

console.log('Testing Role-Based Authorization Middleware\n');
console.log('='.repeat(60));

// Test 1: No authenticated user (should return 401)
runTest('1. No authenticated user returns 401', () => {
  const middleware = requireRole('admin');
  const req = createMockReq(null);
  const res = createMockRes();
  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };
  
  middleware(req, res, mockNext);
  
  console.log(`   Status: ${res.statusCode}`);
  console.log(`   Message: ${res.body?.mensaje}`);
  return res.statusCode === 401 && 
         res.body?.mensaje === 'Usuario no autenticado' &&
         !nextCalled;
});

// Test 2: Admin accessing admin-only route (Requirement 2.4)
runTest('2. Admin can access admin-only routes', () => {
  const middleware = requireRole('admin');
  const req = createMockReq({ id: 1, rol: 'admin', nombre: 'Admin User' });
  const res = createMockRes();
  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };
  
  middleware(req, res, mockNext);
  
  console.log(`   Next called: ${nextCalled}`);
  return nextCalled && !res.statusCode;
});

// Test 3: Empleado accessing admin-only route (Requirement 2.4)
runTest('3. Empleado denied access to admin-only routes (403)', () => {
  const middleware = requireRole('admin');
  const req = createMockReq({ id: 2, rol: 'empleado', nombre: 'Employee' });
  const res = createMockRes();
  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };
  
  middleware(req, res, mockNext);
  
  console.log(`   Status: ${res.statusCode}`);
  console.log(`   Message: ${res.body?.mensaje}`);
  return res.statusCode === 403 && 
         res.body?.mensaje === 'No tienes permisos para acceder a este recurso' &&
         !nextCalled;
});

// Test 4: Duena accessing admin-only route (Requirement 2.4)
runTest('4. Duena denied access to admin-only routes (403)', () => {
  const middleware = requireRole('admin');
  const req = createMockReq({ id: 3, rol: 'duena', nombre: 'Owner' });
  const res = createMockRes();
  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };
  
  middleware(req, res, mockNext);
  
  console.log(`   Status: ${res.statusCode}`);
  console.log(`   Message: ${res.body?.mensaje}`);
  return res.statusCode === 403 && !nextCalled;
});

// Test 5: Admin accessing empleado route (Requirement 2.5)
runTest('5. Admin can access empleado routes', () => {
  const middleware = requireRole('empleado');
  const req = createMockReq({ id: 1, rol: 'admin', nombre: 'Admin User' });
  const res = createMockRes();
  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };
  
  middleware(req, res, mockNext);
  
  console.log(`   Next called: ${nextCalled}`);
  return nextCalled && !res.statusCode;
});

// Test 6: Empleado accessing empleado route (Requirement 2.5)
runTest('6. Empleado can access empleado routes', () => {
  const middleware = requireRole('empleado');
  const req = createMockReq({ id: 2, rol: 'empleado', nombre: 'Employee' });
  const res = createMockRes();
  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };
  
  middleware(req, res, mockNext);
  
  console.log(`   Next called: ${nextCalled}`);
  return nextCalled && !res.statusCode;
});

// Test 7: Duena accessing empleado route (Requirement 2.5)
runTest('7. Duena denied access to empleado routes (403)', () => {
  const middleware = requireRole('empleado');
  const req = createMockReq({ id: 3, rol: 'duena', nombre: 'Owner' });
  const res = createMockRes();
  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };
  
  middleware(req, res, mockNext);
  
  console.log(`   Status: ${res.statusCode}`);
  return res.statusCode === 403 && !nextCalled;
});

// Test 8: Admin accessing duena route (Requirement 2.6)
runTest('8. Admin can access duena routes', () => {
  const middleware = requireRole('duena');
  const req = createMockReq({ id: 1, rol: 'admin', nombre: 'Admin User' });
  const res = createMockRes();
  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };
  
  middleware(req, res, mockNext);
  
  console.log(`   Next called: ${nextCalled}`);
  return nextCalled && !res.statusCode;
});

// Test 9: Duena accessing duena route (Requirement 2.6)
runTest('9. Duena can access duena routes', () => {
  const middleware = requireRole('duena');
  const req = createMockReq({ id: 3, rol: 'duena', nombre: 'Owner' });
  const res = createMockRes();
  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };
  
  middleware(req, res, mockNext);
  
  console.log(`   Next called: ${nextCalled}`);
  return nextCalled && !res.statusCode;
});

// Test 10: Empleado accessing duena route (Requirement 2.6)
runTest('10. Empleado denied access to duena routes (403)', () => {
  const middleware = requireRole('duena');
  const req = createMockReq({ id: 2, rol: 'empleado', nombre: 'Employee' });
  const res = createMockRes();
  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };
  
  middleware(req, res, mockNext);
  
  console.log(`   Status: ${res.statusCode}`);
  return res.statusCode === 403 && !nextCalled;
});

// Test 11: Multiple roles support (array)
runTest('11. Multiple roles support - empleado accessing [empleado, duena] route', () => {
  const middleware = requireRole(['empleado', 'duena']);
  const req = createMockReq({ id: 2, rol: 'empleado', nombre: 'Employee' });
  const res = createMockRes();
  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };
  
  middleware(req, res, mockNext);
  
  console.log(`   Next called: ${nextCalled}`);
  return nextCalled && !res.statusCode;
});

// Test 12: Multiple roles support - duena accessing [empleado, duena] route
runTest('12. Multiple roles support - duena accessing [empleado, duena] route', () => {
  const middleware = requireRole(['empleado', 'duena']);
  const req = createMockReq({ id: 3, rol: 'duena', nombre: 'Owner' });
  const res = createMockRes();
  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };
  
  middleware(req, res, mockNext);
  
  console.log(`   Next called: ${nextCalled}`);
  return nextCalled && !res.statusCode;
});

// Test 13: Multiple roles support - admin accessing [empleado, duena] route
runTest('13. Multiple roles support - admin accessing [empleado, duena] route', () => {
  const middleware = requireRole(['empleado', 'duena']);
  const req = createMockReq({ id: 1, rol: 'admin', nombre: 'Admin User' });
  const res = createMockRes();
  let nextCalled = false;
  const mockNext = () => { nextCalled = true; };
  
  middleware(req, res, mockNext);
  
  console.log(`   Next called: ${nextCalled}`);
  return nextCalled && !res.statusCode;
});

console.log('\n' + '='.repeat(60));
console.log(`\nTest Results: ${testsPassed} passed, ${testsFailed} failed`);
console.log(`Total: ${testsPassed + testsFailed} tests\n`);

if (testsFailed === 0) {
  console.log('✓ All tests passed!\n');
  process.exit(0);
} else {
  console.log('✗ Some tests failed!\n');
  process.exit(1);
}
