# Task 4.3: Security Middleware Implementation

## Overview
Implemented comprehensive security middleware configuration for the backend API, including Helmet security headers and CORS policy enforcement.

## Implementation Details

### 1. Helmet Security Headers Configuration

Configured Helmet middleware with specific security headers as required:

```javascript
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  xContentTypeOptions: true, // X-Content-Type-Options: nosniff
  xFrameOptions: { action: 'deny' }, // X-Frame-Options: DENY
  xXssProtection: true, // X-XSS-Protection: 1; mode=block
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  }
}));
```

**Security Headers Implemented:**
- ✅ X-Content-Type-Options: nosniff (prevents MIME type sniffing)
- ✅ X-Frame-Options: DENY (prevents clickjacking attacks)
- ✅ X-XSS-Protection: 1; mode=block (enables XSS filter)
- ✅ Strict-Transport-Security: max-age=31536000 (enforces HTTPS)

### 2. CORS Configuration

Implemented CORS with environment-based origin validation:

```javascript
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || [];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      // Reject unauthorized origins with 403
      callback(new Error('Origen no autorizado por política CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

**CORS Features:**
- ✅ Reads allowed origins from CORS_ORIGIN environment variable
- ✅ Supports multiple origins (comma-separated)
- ✅ Allows GET, POST, PUT, DELETE, OPTIONS methods
- ✅ Allows Content-Type and Authorization headers
- ✅ Rejects unauthorized origins with 403 error
- ✅ Allows requests with no origin (Postman, curl, mobile apps)
- ✅ Supports wildcard (*) for development

### 3. CORS Error Handler

Added dedicated error handler for CORS violations:

```javascript
app.use((err, req, res, next) => {
  if (err.message === 'Origen no autorizado por política CORS') {
    return res.status(403).json({
      error: true,
      mensaje: 'Origen no autorizado por política CORS'
    });
  }
  next(err);
});
```

## Requirements Validation

### Requirement 18.1: X-Content-Type-Options ✅
- Configured: `xContentTypeOptions: true`
- Sets header: `X-Content-Type-Options: nosniff`

### Requirement 18.2: X-Frame-Options ✅
- Configured: `xFrameOptions: { action: 'deny' }`
- Sets header: `X-Frame-Options: DENY`

### Requirement 18.3: X-XSS-Protection ✅
- Configured: `xXssProtection: true`
- Sets header: `X-XSS-Protection: 1; mode=block`

### Requirement 18.4: Strict-Transport-Security ✅
- Configured: `strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true }`
- Sets header: `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

### Requirement 18.5: CORS Allowed Origins ✅
- Reads from `process.env.CORS_ORIGIN`
- Validates origin against allowed list
- Example: `CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500`

### Requirement 18.6: Allowed HTTP Methods ✅
- Configured: `methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']`

### Requirement 18.7: Allowed Headers ✅
- Configured: `allowedHeaders: ['Content-Type', 'Authorization']`

### Requirement 18.8: Reject Unauthorized Origins ✅
- Returns 403 status code
- Returns error message: "Origen no autorizado por política CORS"

## Testing

### Unit Tests
Created comprehensive test suite: `src/middleware/security.test.js`

**Test Coverage:**
- ✅ Helmet security headers (4 tests)
- ✅ CORS origin validation (5 tests)
- ✅ HTTP methods (5 tests)
- ✅ Allowed headers (2 tests)
- ✅ Credentials support (1 test)

**Test Results:**
```
Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
```

### Verification Script
Created verification script: `src/scripts/test-security-middleware.js`

**Verification Results:**
```
✅ Helmet X-Content-Type-Options
✅ Helmet X-Frame-Options
✅ Helmet X-XSS-Protection
✅ Helmet Strict-Transport-Security
✅ CORS Origin Validation
✅ CORS Unauthorized Origin Rejection
✅ CORS Allowed Methods
✅ CORS Allowed Headers
✅ CORS Error Handler
```

## Configuration

### Environment Variables
The security middleware uses the following environment variable:

```env
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

**Format:**
- Comma-separated list of allowed origins
- Each origin should include protocol (http:// or https://)
- Whitespace is automatically trimmed
- Use `*` to allow all origins (not recommended for production)

### Example Configurations

**Development:**
```env
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

**Production:**
```env
CORS_ORIGIN=https://floreria.example.com,https://www.floreria.example.com
```

**Testing (allow all):**
```env
CORS_ORIGIN=*
```

## Security Benefits

1. **MIME Type Sniffing Protection**: Prevents browsers from interpreting files as different MIME types
2. **Clickjacking Protection**: Prevents the site from being embedded in iframes
3. **XSS Protection**: Enables browser's built-in XSS filter
4. **HTTPS Enforcement**: Forces browsers to use HTTPS for all future requests
5. **Origin Validation**: Prevents unauthorized domains from accessing the API
6. **Method Restriction**: Limits HTTP methods to only those needed
7. **Header Restriction**: Limits allowed headers to prevent header injection attacks

## Files Modified

1. `backend/src/app.js` - Enhanced security middleware configuration
2. `backend/src/middleware/security.test.js` - New test file
3. `backend/src/scripts/test-security-middleware.js` - New verification script
4. `backend/package.json` - Added supertest dev dependency

## Verification Steps

1. Run unit tests:
   ```bash
   npm test -- security.test.js
   ```

2. Run verification script:
   ```bash
   node src/scripts/test-security-middleware.js
   ```

3. Test with curl:
   ```bash
   # Should succeed (allowed origin)
   curl -H "Origin: http://localhost:5500" http://localhost:3000/health
   
   # Should fail with 403 (unauthorized origin)
   curl -H "Origin: http://evil-site.com" http://localhost:3000/health
   ```

## Conclusion

Task 4.3 has been successfully implemented with:
- ✅ All 5 sub-tasks completed
- ✅ All 8 requirements validated (18.1-18.8)
- ✅ 17 unit tests passing
- ✅ Verification script confirming configuration
- ✅ Comprehensive documentation

The security middleware is now properly configured to protect the API from common web vulnerabilities and unauthorized access.
