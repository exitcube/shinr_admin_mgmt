import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import controller from './handler';

export default async function rewardsRoutes(fastify: FastifyInstance, opts: FastifyPluginOptions) {
    const handler = controller(fastify, opts);
}