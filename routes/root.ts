import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import userRoutes from '../user/routes';

export default async function routes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
) {
  fastify.get('/', async () => {
    return {
      message: 'Welcome to Shinr User Management API',
      environment: process.env.NODE_ENV || 'development',
    };
  });

  fastify.register(userRoutes, { prefix: '/user-profile' });
}
