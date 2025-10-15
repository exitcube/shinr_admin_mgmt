import Joi from "joi";
import { createErrorResponse } from './response';
import { ErrorCodes } from '../types/errors';

export type ValidationResult = { success: true } | ReturnType<typeof createErrorResponse>;

// Generic validation function that takes schema and data as parameters
export function validatePayload(schema: Joi.ObjectSchema, data: any, path?: string, method?: string): ValidationResult {
  const { error } = schema.validate(data, { abortEarly: true });
  if (error) {
    const message = error.message;
    return createErrorResponse({
      message,
      statusCode: 422,
      code: ErrorCodes.VALIDATION_FAILED,
      timestamp: new Date().toISOString(),
      path: path || '',
      method: method || '',
    }, message)

  }
  return { success: true };
}

export function validation(schemaMap: { body?: Joi.ObjectSchema; query?: Joi.ObjectSchema }) {
  return async function (request: any, reply: any) {
    if (schemaMap.body) {
      const result = validatePayload(schemaMap.body, request.body, request.url, request.method);
      if (!result.success) {
        reply.status(422).send(result);
        return reply;
      }
    }
    if (schemaMap.query) {
      const result = validatePayload(schemaMap.query, request.query, request.url, request.method);
      if (!result.success) {
        reply.status(422).send(result);
        return reply;
      }
    }
  };
}
