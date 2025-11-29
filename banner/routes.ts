import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import controller from './handler';
import { authValidationPreHandler,adminAuthValidationPreHandler } from '../utils/authValidation';
import { validation } from '../utils/validation';
import { createBannerValidate,updateBannerValidate,approveBannerValidate,deleteBannerValidate } from './validators';

export default async function bannerRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    const handler = controller(fastify, opts);
    fastify.get('/get-vendors',{ preHandler: [adminAuthValidationPreHandler] },handler.vendorListinghandler);
    fastify.get('/get-categories',{ preHandler: [adminAuthValidationPreHandler] },handler.categoryListinghandler);
    fastify.get('/get-status',{ preHandler: [adminAuthValidationPreHandler] },handler.statusListinghandler);
    fastify.post('/create', { preHandler: [adminAuthValidationPreHandler, validation(createBannerValidate)] }, handler.createBannerHandler);
    fastify.put('/:id/approve', { preHandler: [adminAuthValidationPreHandler, validation(approveBannerValidate)] }, handler.approveBannerHandler);
    fastify.delete('/:id', { preHandler: [adminAuthValidationPreHandler, validation(deleteBannerValidate)] }, handler.deleteBannerHandler);
} 