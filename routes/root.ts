import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import adminRoutes from '../admin/routes';

export default async function routes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  fastify.get('/', async () => {
    return {
      message: 'Welcome to Shinr Admin  Management API',
      environment: process.env.NODE_ENV || 'development',
    };
  });
  fastify.register(adminRoutes, { prefix: '/admin' });

}
