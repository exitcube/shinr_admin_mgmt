# Error Handling System

This document explains how to use the comprehensive error handling system in the Shinr User Management API.

## Overview

The error handling system provides:
- **Custom API Error Classes** for different types of errors
- **Global Error Handler** that catches all unhandled errors
- **Standardized Error Responses** with consistent format
- **Utility Functions** for common error handling patterns

## Error Classes

### Base Error Class
```typescript
import { APIError } from '../types/errors';

// Create a custom error
throw new APIError('Custom message', 400, 'CUSTOM_ERROR_CODE');
```

### Predefined Error Classes
```typescript
import { 
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  ConflictError,
  InternalServerError 
} from '../types/errors';

// Examples
throw new BadRequestError('Invalid input');
throw new NotFoundError('User not found', 'USER_NOT_FOUND');
throw new ValidationError('Email is required', 'REQUIRED_FIELD_MISSING');
```

## Using Error Classes in Routes

### Method 1: Using fastify.throwAPIError()
```typescript
// In your route handler
fastify.get('/users/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  
  if (!id || isNaN(Number(id))) {
    fastify.throwAPIError(
      new BadRequestError('Invalid user ID', 'INVALID_FORMAT')
    );
  }
  
  // Your logic here...
});
```

### Method 2: Direct throw
```typescript
// In your route handler
fastify.post('/users', async (request, reply) => {
  const { name, email } = request.body as { name?: string; email?: string };
  
  if (!name || !email) {
    throw new ValidationError('Name and email are required', 'REQUIRED_FIELD_MISSING');
  }
  
  // Your logic here...
});
```

## Error Response Format

All errors return a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/users/123",
    "method": "GET"
  }
}
```

## Utility Functions

### Database Operations
```typescript
import { safeQuery, findById } from '../utils/errorUtils';

// Safe database query
const users = await safeQuery(fastify, 'SELECT * FROM users WHERE active = $1', [true]);

// Find by ID with automatic error handling
const user = await findById(fastify, 'users', userId, 'User not found');
```

### Validation
```typescript
import { 
  validateRequiredFields, 
  validateNumericId, 
  validateEmail 
} from '../utils/errorUtils';

// Validate required fields
validateRequiredFields(fastify, request.body, ['name', 'email']);

// Validate numeric ID
const id = validateNumericId(fastify, request.params.id, 'Invalid user ID');

// Validate email
validateEmail(fastify, email);
```

### Response Helpers
```typescript
import { createSuccessResponse, createPaginatedResponse } from '../utils/errorUtils';

// Standard success response
return createSuccessResponse(user, 'User created successfully');

// Paginated response
return createPaginatedResponse(users, totalCount, page, limit);
```

## Error Codes

Use predefined error codes for consistency:

```typescript
import { ErrorCodes } from '../types/errors';

// Available error codes
ErrorCodes.USER_NOT_FOUND
ErrorCodes.VALIDATION_FAILED
ErrorCodes.DUPLICATE_ENTRY
ErrorCodes.INVALID_CREDENTIALS
// ... and many more
```

## Global Error Handler

The global error handler automatically catches:

- **Custom API Errors** - Your thrown APIError instances
- **Validation Errors** - Fastify validation errors
- **Database Errors** - TypeORM and PostgreSQL errors
- **404 Errors** - Route not found
- **Unhandled Errors** - Any other errors

## Example Route with Full Error Handling

```typescript
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { NotFoundError, ValidationError, ErrorCodes } from '../types/errors';
import { 
  validateRequiredFields, 
  validateNumericId, 
  safeQuery,
  createSuccessResponse 
} from '../utils/errorUtils';

export default async function usersRoute(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  // GET /users/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    // Validate ID
    const userId = validateNumericId(fastify, id, 'Invalid user ID');
    
    // Safe database query
    const result = await safeQuery(
      fastify, 
      'SELECT * FROM users WHERE id = $1', 
      [userId]
    );
    
    if (!result || result.length === 0) {
      fastify.throwAPIError(
        new NotFoundError('User not found', ErrorCodes.USER_NOT_FOUND)
      );
    }
    
    return createSuccessResponse(result[0]);
  });

  // POST /users
  fastify.post('/', async (request, reply) => {
    const body = request.body as any;
    
    // Validate required fields
    validateRequiredFields(fastify, body, ['name', 'email']);
    
    // Safe database insert
    const result = await safeQuery(
      fastify,
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [body.name, body.email]
    );
    
    return createSuccessResponse(result[0], 'User created successfully');
  });
}
```

## Testing Error Handling

### Test Custom Errors
```bash
# Test validation error
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}'  # Missing email

# Test not found error
curl http://localhost:3000/users/999999

# Test invalid ID
curl http://localhost:3000/users/invalid-id
```

### Test Unhandled Errors
```bash
# Test unhandled error route
curl http://localhost:3000/users/test/error
```

## Best Practices

1. **Always use custom error classes** instead of generic Error
2. **Use predefined error codes** for consistency
3. **Validate input early** in your route handlers
4. **Use utility functions** for common patterns
5. **Let the global handler** catch unhandled errors
6. **Test error scenarios** to ensure proper handling

## Error Logging

All errors are automatically logged with:
- Error message and stack trace
- Request URL and method
- Timestamp
- Environment-specific details

In production, sensitive information is automatically filtered out.
