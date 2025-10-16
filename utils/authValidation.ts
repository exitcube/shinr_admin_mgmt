import  { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from './jwt';
import { createErrorResponse } from './response';
import { accessTokenPayloadType, AuthenticatedUser } from '../types/config';

/**
 * PreHandler to validate JWT token and x-device-id header
 */
export async function authValidationPreHandler(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    try {
        // Check for x-device-id header
        const deviceId = request.headers['x-device-id'];
        if (!deviceId) {
            const errorResponse = createErrorResponse({
                message: 'Device ID is required',
                code: 'MISSING_DEVICE_ID',
                statusCode: 401,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method
            }, 'x-device-id header is missing');

            return reply.status(401).send(errorResponse);
        }

        // Check for Authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            const errorResponse = createErrorResponse({
                message: 'Authorization token is required',
                code: 'MISSING_AUTH_TOKEN',
                statusCode: 401,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method
            }, 'Authorization header is missing');

            return reply.status(401).send(errorResponse);
        }

        // Extract token from "Bearer <token>" format
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        if (!token) {
            const errorResponse = createErrorResponse({
                message: 'Invalid authorization format',
                code: 'INVALID_AUTH_FORMAT',
                statusCode: 401,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method
            }, 'Authorization header must be in format "Bearer <token>"');

            return reply.status(401).send(errorResponse);
        }

        // Verify the JWT token
        try {
            const payload : accessTokenPayloadType= await verifyAccessToken(token);
            // Verify that the device-id in header matches the device in token
            if (payload.deviceUUId !== deviceId) {
                const errorResponse = createErrorResponse({
                    message: 'Device ID mismatch',
                    code: 'DEVICE_ID_MISMATCH',
                    statusCode: 403,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    method: request.method
                }, 'Device ID in header does not match the device associated with this token');

                return reply.status(403).send(errorResponse);
            }

            // Attach user info to request for use in handlers
            const userInfo: AuthenticatedUser = {
                userId: payload.userId,
                userUUId: payload.userUUId,
                deviceUUId: payload.deviceUUId,
                tokenId: payload.tokenId,
            };
            (request as any).user = userInfo;
        } catch (jwtError: any) {
            let errorCode = 'INVALID_TOKEN';
            let errorMessage = 'Invalid token';
            let publicMessage = 'The provided token is invalid';

            // Handle specific JWT errors
            if (jwtError.code === 'ERR_JWT_EXPIRED') {
                errorCode = 'TOKEN_EXPIRED';
                errorMessage = 'Token has expired';
                publicMessage = 'Your session has expired.';
            } else if (jwtError.code === 'ERR_JWT_INVALID') {
                errorCode = 'INVALID_TOKEN';
                errorMessage = 'Invalid token format';
                publicMessage = 'The provided token is malformed or invalid';
            } else if (jwtError.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
                errorCode = 'INVALID_TOKEN';
                errorMessage = 'Invalid token signature';
                publicMessage = 'The provided token is invalid';
            }

            const errorResponse = createErrorResponse({
                message: errorMessage,
                code: errorCode,
                statusCode: 401,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method
            }, publicMessage);

            return reply.status(401).send(errorResponse);
        }

    } catch (error) {
        // Handle any unexpected errors
        const errorResponse = createErrorResponse({
            message: 'Authentication validation failed',
            code: 'AUTH_VALIDATION_ERROR',
            statusCode: 500,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method
        }, 'An error occurred during authentication validation');

        return reply.status(500).send(errorResponse);
    }
}

/**
 * PreHandler to validate only x-device-id header (without JWT verification)
 */
export async function deviceIdValidationPreHandler(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    try {
        // Check for x-device-id header
        const deviceId = request.headers['x-device-id'];
        if (!deviceId) {
            const errorResponse = createErrorResponse({
                message: 'Device ID is required',
                code: 'MISSING_DEVICE_ID',
                statusCode: 401,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method
            }, 'x-device-id header is missing');

            return reply.status(401).send(errorResponse);
        }

        // Attach device ID to request for use in handlers
        (request as any).deviceId = deviceId;

    } catch (error) {
        const errorResponse = createErrorResponse({
            message: 'Device validation failed',
            code: 'DEVICE_VALIDATION_ERROR',
            statusCode: 500,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method
        }, 'An error occurred during device validation');

        return reply.status(500).send(errorResponse);
    }
}
