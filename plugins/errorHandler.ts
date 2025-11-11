import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyError } from 'fastify';
import { 
  APIError, 
  ErrorResponse, 
  ErrorCodes,
  InternalServerError 
} from '../types/errors';



const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  // Decorate fastify with a helper method to throw API errors
  fastify.decorate('throwAPIError', (error: APIError): never => {
    throw error;
  });

  // Global error handler
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    // Log the error
    fastify.log.error({
      error: error.message,
      stack: error.stack,
      url: path,
      method: method,
      timestamp: timestamp
    });

    // Handle our custom API errors
    if (error instanceof APIError) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
          timestamp: timestamp,
          path: path,
          method: method
        },
        message: error.publicMessage
      };

      return reply.status(error.statusCode).send(errorResponse);
    }
    // Handle 404 errors
    if (error.statusCode === 404) {
      const notFoundError: ErrorResponse = {
        success: false,
        error: {
          message: 'Route not found',
          code: ErrorCodes.RECORD_NOT_FOUND,
          statusCode: 404,
          timestamp: timestamp,
          path: path,
          method: method
        }
      };

      return reply.status(404).send(notFoundError);
    }

    // Default error handler for any unhandled errors
    const defaultError: ErrorResponse = {
      success: false,
      error: {
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal Server Error' 
          : error.message,
        code: ErrorCodes.INTERNAL_ERROR,
        statusCode: 500,
        timestamp: timestamp,
        path: path,
        method: method
      }
    };

    return reply.status(500).send(defaultError);
  });

  // Handle uncaught exceptions
 process.on('uncaughtException', (error) => {
  fastify.log.fatal({ err: error }, 'Uncaught Exception');
  process.exit(1);
});

  // Handle unhandled promise rejections
 process.on('unhandledRejection', (reason, promise) => {
  fastify.log.fatal({ reason, promise }, 'Unhandled Promise Rejection');
  process.exit(1);
});

  console.log('✅ Error handler plugin registered successfully');
};

export default fp(errorHandlerPlugin, {
  name: 'errorHandler'
});
