// Custom API Error Classes
export class APIError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public publicMessage : string;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true,
    publicMessage : string = 'An unexpected error occurred'
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.publicMessage = publicMessage;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }
}

// Specific error types
export class BadRequestError extends APIError {
  constructor(message: string = 'Bad Request', code?: string) {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: string = 'Unauthorized', code?: string) {
    super(message, 401, code);
  }
}

export class ForbiddenError extends APIError {
  constructor(message: string = 'Forbidden', code?: string) {
    super(message, 403, code);
  }
}

export class NotFoundError extends APIError {
  constructor(message: string = 'Not Found', code?: string) {
    super(message, 404, code);
  }
}

export class ConflictError extends APIError {
  constructor(message: string = 'Conflict', code?: string) {
    super(message, 409, code);
  }
}

export class ValidationError extends APIError {
  constructor(message: string = 'Validation Error', code?: string) {
    super(message, 422, code);
  }
}

export class InternalServerError extends APIError {
  constructor(message: string = 'Internal Server Error', code?: string) {
    super(message, 500, code);
  }
}

export class DatabaseError extends APIError {
  constructor(message: string = 'Database Error', code?: string) {
    super(message, 500, code);
  }
}

// Error response interface
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    timestamp: string;
    path?: string;
    method?: string;
  };
  message?: string;
}

export type ErrorBody = ErrorResponse['error'];

// Error codes enum
export enum ErrorCodes {
  // Authentication & Authorization
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Database
  DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  FOREIGN_KEY_VIOLATION = 'FOREIGN_KEY_VIOLATION',
  
  // Business Logic
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}
