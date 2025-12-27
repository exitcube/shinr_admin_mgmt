import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import controller from './handler';
import { createRewardValidate } from './validators';
import { validation } from '../utils/validation';

export default async function rewardsRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    const handler = controller(fastify, opts);
    fastify.post('/create-reward',{preHandler:[validation(createRewardValidate)]},handler.createRewardHandler);
}