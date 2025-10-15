import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import { authValidationPreHandler } from '../utils/authValidation';
import { createSuccessResponse } from '../utils/response';

export default async function userRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
	// User details endpoint with JWT and device validation
	fastify.get('/user/details', {
		preHandler: [authValidationPreHandler]
	}, async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			// Access user information from the validated request
			// We know user exists because of authValidationPreHandler
			const user = (request as any).user;
			
			// Return user details
			const userDetails = {
				userId: user.userId,
				userUUId: user.userUUId,
				deviceUUId: user.deviceUUId,
				mobile: user.mobile
			};

			const result = createSuccessResponse(userDetails, "User details retrieved successfully");
			return reply.status(200).send(result);
		} catch (error) {
			return reply.status(500).send({
				success: false,
				error: {
					message: 'Failed to retrieve user details',
					code: 'USER_DETAILS_ERROR',
					statusCode: 500,
					timestamp: new Date().toISOString(),
					path: request.url,
					method: request.method
				}
			});
		}
	});
}


