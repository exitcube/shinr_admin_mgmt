import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import controller from './handler';
import { createRewardValidate,updateRewardValidate } from './validators';
import { validation } from '../utils/validation';
import { adminAuthValidationPreHandler } from '../utils/authValidation';

export default async function rewardsRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    const handler = controller(fastify, opts);
    fastify.post('/create-reward',{preHandler:[adminAuthValidationPreHandler,validation(createRewardValidate)]},handler.createRewardHandler);
    fastify.put('/update-reward' ,{preHandler:[adminAuthValidationPreHandler,validation(updateRewardValidate)]},handler.updateRewardHandler);
}