import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import controller from './handler';
import { authValidationPreHandler } from '../utils/authValidation';
import { validation } from '../utils/validation';
import { createBannerValidate } from './validators';

export default async function bannerRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    const handler = controller(fastify, opts);

    fastify.post(
        '/add',
        { preHandler: [authValidationPreHandler, validation(createBannerValidate)] },
        handler.createbannerhandler
    );
}