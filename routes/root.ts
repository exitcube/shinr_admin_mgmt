import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import loginRoutes from '../login/routes';
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

  fastify.register(loginRoutes, { prefix: '/user' });
  fastify.register(userRoutes, { prefix: '/user-profile' });
}
