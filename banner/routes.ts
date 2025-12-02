import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import controller from './handler';
import { authValidationPreHandler, adminAuthValidationPreHandler } from '../utils/authValidation';
import { validation } from '../utils/validation';
import { updateBannerCategoryValidate, listBannerValidate } from './validators';

export default async function bannerRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    const handler = controller(fastify, opts);
    fastify.get('/get-vendors', { preHandler: [adminAuthValidationPreHandler] }, handler.vendorListinghandler);
    fastify.get('/get-categories', { preHandler: [adminAuthValidationPreHandler] }, handler.categoryListinghandler);
    fastify.get('/get-status', { preHandler: [adminAuthValidationPreHandler] }, handler.statusListinghandler);
    fastify.put('/update-banner-category', { preHandler: [adminAuthValidationPreHandler, validation(updateBannerCategoryValidate)] }, handler.updateBannerCategoryHandler);
    fastify.delete('/delete-banner-category', { preHandler: [adminAuthValidationPreHandler] }, handler.deleteBannerCategoryHandler);
    fastify.get('/getTargetAudience', { preHandler: [adminAuthValidationPreHandler] }, handler.targetAudienceHandler);
    fastify.get('/getBanners', { preHandler: [adminAuthValidationPreHandler, validation(listBannerValidate)] }, handler.listbannerhandler);
} 
