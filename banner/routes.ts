import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import controller from './handler';
import { adminAuthValidationPreHandler } from '../utils/authValidation';
import { validation } from '../utils/validation';

export default async function bannerRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    const handler = controller(fastify, opts);

    fastify.post( '/add',{ preHandler: [adminAuthValidationPreHandler] },handler.createbannerhandler
    );

}