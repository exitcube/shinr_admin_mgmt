import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import controller from './handler';
import { createRewardValidate,updateRewardValidate,listRewardValidate } from './validators';
import { validation } from '../utils/validation';
import { adminAuthValidationPreHandler } from '../utils/authValidation';

export default async function rewardsRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    const handler = controller(fastify, opts);
    fastify.get('/category-listing',{ preHandler: [adminAuthValidationPreHandler] },handler.categoryListingHandler)
    fastify.get('/service-listing',{ preHandler: [adminAuthValidationPreHandler] },handler.serviceCategoryListingHandler)
    fastify.get('/get-target-audience',{ preHandler: [adminAuthValidationPreHandler] },handler.targetAudienceHandler);
    fastify.post('/create-reward',{preHandler:[adminAuthValidationPreHandler,validation(createRewardValidate)]},handler.createRewardHandler);
    fastify.put('/update-reward' ,{preHandler:[adminAuthValidationPreHandler,validation(updateRewardValidate)]},handler.updateRewardHandler);
    fastify.get('/getSingleReward/:id',{ preHandler: [adminAuthValidationPreHandler] },handler.singleRewardHandler);
    fastify.post('/list-rewards',{ preHandler: [adminAuthValidationPreHandler,validation(listRewardValidate)] },handler.listRewardHandler);
    fastify.post('/delete-reward/:id',{ preHandler: [adminAuthValidationPreHandler] },handler.deleteRewardHandler);
}