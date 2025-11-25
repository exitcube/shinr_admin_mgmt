import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import controller from './handler';
import { adminAuthValidationPreHandler } from '../utils/authValidation';
import { validation } from '../utils/validation';
import { bannerFilterValidate } from './validators';

export default async function bannerRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    const handler = controller(fastify, opts);

    fastify.post('/filter-banner',{preHandler:[adminAuthValidationPreHandler,validation(bannerFilterValidate)]},handler.filterBannerHandler);


}