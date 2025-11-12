import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import vehicleRoutes from '../vehicle/routes';
import serviceRoutes from '../service/routes';
import bannerRoutes from '../banner/routes';
import adminLoginRoutes from '../admin/routes';

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
  fastify.register(vehicleRoutes, { prefix: '/cars' });
  fastify.register(serviceRoutes,{prefix: '/service'});
  fastify.register(bannerRoutes, { prefix : '/banner'});
  fastify.register(adminLoginRoutes, { prefix: '/admin' });
}
