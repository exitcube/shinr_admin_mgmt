import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import controller from './handler';
import { adminAuthValidationPreHandler } from '../utils/authValidation';

export default async function rewardsRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    const handler = controller(fastify, opts);
    fastify.get('/get-target-audience',{ preHandler: [adminAuthValidationPreHandler] },handler.targetAudienceHandler);
}